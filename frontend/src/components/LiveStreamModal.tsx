"use client";
import React, { useState, useEffect, useRef } from 'react';
import { X, Users, MessageCircle, Heart, Send, Video, VideoOff, Mic, MicOff, Share2, MoreVertical, Star, Smile, Plus } from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { io, Socket } from 'socket.io-client';
import { getCurrentUserId } from '@/utils/auth';
import Popup from '@/components/Popup';


interface LiveStreamModalProps {
    isOpen: boolean;
    onClose: () => void;
    streamId?: string; // If present, we are a viewer
    isHost?: boolean;
    initialData?: any;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const LiveStreamModal: React.FC<LiveStreamModalProps> = ({ isOpen, onClose, streamId: propsStreamId, isHost: propsIsHost, initialData }) => {
    const { isDarkMode } = useDarkMode();
    const [streamId, setStreamId] = useState<string | null>(propsStreamId || null);
    const [isHost, setIsHost] = useState(propsIsHost || false);
    const [streamData, setStreamData] = useState<any>(initialData || null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [viewerCount, setViewerCount] = useState(0);
    const [reactions, setReactions] = useState<any[]>([]);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);


    const [showChat, setShowChat] = useState(true);

    const [popup, setPopup] = useState<any>({
        isOpen: false,
        type: 'info',
        title: '',
        message: ''
    });

    // Check window size on mount and resize
    useEffect(() => {
        const checkSize = () => {
            if (window.innerWidth < 768) {
                setShowChat(false);
            } else {
                setShowChat(true);
            }
        };

        // Initial check
        checkSize();

        window.addEventListener('resize', checkSize);
        return () => window.removeEventListener('resize', checkSize);
    }, []);

    // Sync state with props when modal opens
    useEffect(() => {
        if (isOpen) {
            setIsHost(propsIsHost || false);
            setStreamId(propsStreamId || null);
            setStreamData(initialData || null);

            // Reset transient state
            setComments([]);
            setReactions([]);
            setViewerCount(0);

            if (propsIsHost) {
                setInputTitle('');
                setInputDescription('');
            }

            // If opening as host, ensure we reset streams so preview can start
            if (propsIsHost) {
                // We don't nullify localStream here to avoid flicker if it persists, 
                // but typically we start fresh. 
                // actually, if we just closed, localStream should be null.
            }
        }
    }, [isOpen, propsIsHost, propsStreamId, initialData]);

    const showPopup = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
        setPopup({ isOpen: true, type, title, message });
        if (type === 'success') {
            setTimeout(() => setPopup((prev: any) => ({ ...prev, isOpen: false })), 3000);
        }
    };

    const socketRef = useRef<Socket | null>(null);
    const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
    const videoRef = useRef<HTMLVideoElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    // Initialize Socket.io
    useEffect(() => {
        if (isOpen) {
            const token = localStorage.getItem('token');
            const socket = io(API_URL, {
                auth: { token },
                transports: ['websocket']
            });

            socketRef.current = socket;

            socket.on('connect', () => {
                console.log("🟢 Socket connected");
                setIsConnected(true);
            });

            socket.on('disconnect', () => {
                console.log("🔴 Socket disconnected");
                setIsConnected(false);
            });

            if (streamId) {
                console.log("📡 Joining stream room:", streamId);
                socket.emit('join_live_stream', { streamId });
            }

            socket.on('new_live_comment', (comment: any) => {
                setComments(prev => [...prev, comment]);
            });

            socket.on('new_live_reaction', (data: any) => {
                const reactionId = Date.now() + Math.random();
                setReactions(prev => [{ id: reactionId, reaction: data.reaction }, ...prev].slice(0, 5));
                setTimeout(() => {
                    setReactions(prev => prev.filter(r => r.id !== reactionId));
                }, 3000);
            });

            socket.on('viewer_count_update', (data: any) => {
                console.log("👥 Viewer count update:", data.count);
                setViewerCount(data.count);
            });

            socket.on('live_stream_ended', () => {
                if (!isHost) {
                    showPopup('info', 'Stream Ended', 'The broadcaster has ended the stream.');
                    setRemoteStream(null);
                    setTimeout(() => {
                        onClose();
                    }, 2000);
                }
            });

            // --- WebRTC Signaling ---

            if (isHost) {
                // When a viewer requests the stream
                socket.on('viewer_request_stream', async (data: any) => {
                    const { viewerId } = data;
                    console.log(`Viewer ${viewerId} requested stream`);
                    await createOffer(viewerId);
                });

                socket.on('live_stream_answer', async (data: any) => {
                    const { viewerId, answer } = data;
                    const pc = peerConnections.current.get(viewerId);
                    if (pc) {
                        await pc.setRemoteDescription(new RTCSessionDescription(answer));
                    }
                });
            } else {
                // We are a viewer
                socket.on('live_stream_offer', async (data: any) => {
                    const { hostId, offer } = data;
                    await handleOffer(hostId, offer);
                });
            }

            socket.on('live_stream_ice_candidate', async (data: any) => {
                const { senderId, candidate } = data;
                const pc = peerConnections.current.get(senderId) || (isHost ? null : peerConnections.current.get('host'));
                if (pc) {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                }
            });

            return () => {
                socket.close();
                stopStream();
            };
        }
    }, [isOpen, streamId, isHost]);

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    // Start camera preview for host as soon as modal opens
    useEffect(() => {
        // If we are host, and modal is open, and we don't have a stream yet
        if (isOpen && isHost && !localStream) {
            const startPreview = async () => {
                try {
                    console.log("📸 Starting camera preview...");
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    setLocalStream(stream);
                } catch (err) {
                    console.error("❌ Camera preview error:", err);
                    showPopup('error', 'Camera Error', 'Could not access camera/microphone. Please check permissions.');
                }
            };
            startPreview();
        }
    }, [isOpen, isHost]); // Removed localStream dependency to prevent loop if setLocalStream triggers re-run unnecessarily, though !localStream check handles it.

    // Attach stream to video element
    useEffect(() => {
        console.log("📹 videoRef Effect:", {
            hasVideoRef: !!videoRef.current,
            isHost,
            hasLocal: !!localStream,
            hasRemote: !!remoteStream
        });

        if (videoRef.current) {
            const video = videoRef.current;
            if (isHost && localStream) {
                console.log("🎙️ Attaching LOCAL stream");
                video.srcObject = localStream;
                video.onloadedmetadata = () => {
                    video.play().catch(e => console.error("❌ Auto-play failed:", e));
                };
            } else if (!isHost && remoteStream) {
                console.log("📺 Attaching REMOTE stream");
                video.srcObject = remoteStream;
                video.onloadedmetadata = () => {
                    video.play().catch(e => console.error("❌ Remote play failed:", e));
                };
            }
        }
    }, [localStream, remoteStream, isHost, isOpen]);

    const [inputTitle, setInputTitle] = useState('');
    const [inputDescription, setInputDescription] = useState('');

    const startBroadcast = async () => {
        try {
            if (!inputTitle.trim()) {
                showPopup('error', 'Title Required', 'Please enter a title for your live stream.');
                return;
            }

            setIsStarting(true);

            let currentStream = localStream;
            if (!currentStream) {
                currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(currentStream);
            }

            // Start Recording
            if (currentStream && MediaRecorder.isTypeSupported('video/webm')) {
                const mediaRecorder = new MediaRecorder(currentStream, { mimeType: 'video/webm' });
                mediaRecorderRef.current = mediaRecorder;
                chunksRef.current = [];

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data && e.data.size > 0) {
                        chunksRef.current.push(e.data);
                    }
                };

                mediaRecorder.start(1000); // Collect 1s chunks
                console.log("🎥 Recording started");
            }


            // Register stream in backend
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/live-streams/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: inputTitle,
                    description: inputDescription
                })
            });

            const data = await res.json();
            console.log("🚀 Stream registered:", data);

            if (data.success) {
                setStreamId(data.data._id);
                setStreamData(data.data);
                socketRef.current?.emit('join_live_stream', { streamId: data.data._id });
                socketRef.current?.emit('live_stream_started', data.data);
                showPopup('success', 'Live!', 'You are now broadcasting live.');
            } else {
                throw new Error(data.message || 'Failed to start stream');
            }
        } catch (error: any) {
            console.error('❌ Error starting broadcast:', error);
            showPopup('error', 'Broadcast Failed', error.message || 'Could not access camera or connect to server.');
            setLocalStream(null); // Go back to start UI
        } finally {
            setIsStarting(false);
        }
    };

    const stopStream = () => {
        localStream?.getTracks().forEach(track => track.stop());
        peerConnections.current.forEach(pc => pc.close());
        peerConnections.current.clear();
        setLocalStream(null);
        setRemoteStream(null);
        if (isHost && streamId) {
            const token = localStorage.getItem('token');
            // Stop recording
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }

            // Just end the stream without saving (unless handled by handleSaveAndEnd)
            // If this is called directly, we assume discard.
            // Note: If you want to ensure save on regular close, logic should be moved.
            // For now, "Stop Stream" via close button = End without save? 
            // Or we should try to save if chunks exist? 
            // Let's safe-guard: if chunks exist and we are closing, maybe we should auto-save in background? 
            // For simplicity, we just end the session here.

            fetch(`${API_URL}/api/live-streams/${streamId}/end`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({})
            });
        }
        chunksRef.current = [];
    };

    const handleSaveAndEnd = async () => {
        if (!streamId || !isHost) return;

        showPopup('info', 'Saving...', 'Ending stream and processing recording...');

        // Stop recorder first
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }

        // Wait a bit for last chunk
        await new Promise(resolve => setTimeout(resolve, 500));

        if (chunksRef.current.length === 0) {
            stopStream();
            onClose();
            return;
        }

        try {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            const file = new File([blob], `livestream-${streamId}.webm`, { type: 'video/webm' });

            const formData = new FormData();
            formData.append('postMedia', file);

            const token = localStorage.getItem('token');

            // Upload
            const uploadRes = await fetch(`${API_URL}/api/upload/post-media`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const uploadData = await uploadRes.json();

            let recordingUrl = null;
            if (uploadData.files && uploadData.files.length > 0) {
                recordingUrl = uploadData.files[0].url;
            }

            // End Stream with recording URL
            await fetch(`${API_URL}/api/live-streams/${streamId}/end`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ recordingUrl })
            });

            showPopup('success', 'Saved!', 'Your stream has been saved to your profile.');

            // Clean up
            stopStream(); // This also calls end endpoint, but duplicate call is harmless usually or we can modify stopStream
            setTimeout(onClose, 2000);

        } catch (error) {
            console.error('Error saving stream:', error);
            showPopup('error', 'Save Failed', 'Stream ended but recording could not be saved.');
            stopStream();
            onClose();
        }
    };

    const createOffer = async (viewerId: string) => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        peerConnections.current.set(viewerId, pc);

        localStream?.getTracks().forEach(track => {
            pc.addTrack(track, localStream);
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current?.emit('live_stream_ice_candidate', {
                    streamId,
                    targetId: viewerId,
                    candidate: event.candidate
                });
            }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socketRef.current?.emit('live_stream_offer', {
            streamId,
            viewerId,
            offer
        });
    };

    const handleOffer = async (hostId: string, offer: any) => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        peerConnections.current.set('host', pc);

        pc.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current?.emit('live_stream_ice_candidate', {
                    streamId,
                    targetId: hostId,
                    candidate: event.candidate
                });
            }
        };

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socketRef.current?.emit('live_stream_answer', {
            streamId,
            hostId,
            answer
        });
    };

    const sendComment = () => {
        if (!newComment.trim()) return;
        socketRef.current?.emit('live_stream_comment', {
            streamId,
            content: newComment
        });
        setNewComment('');
    };

    const sendReaction = (type: string) => {
        socketRef.current?.emit('live_stream_reaction', {
            streamId,
            reaction: type
        });
    };



    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-0 sm:p-4">
            <Popup popup={popup} onClose={() => setPopup((prev: any) => ({ ...prev, isOpen: false }))} />
            <div className={`relative w-full h-full sm:max-w-6xl sm:h-[80vh] flex flex-col md:flex-row overflow-hidden shadow-2xl rounded-none sm:rounded-2xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>

                {/* Video Side */}
                {/* Video Side */}
                <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full relative">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted={isHost}
                            className="w-full h-full object-cover"
                        />

                        {/* Start Broadcast Overlay */}
                        {isHost && !streamId && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                                <div className="flex flex-col items-center gap-4 p-8 text-center animate-fade-in w-full max-w-md">
                                    <div className="w-20 h-20 rounded-full bg-pink-500/20 flex items-center justify-center animate-pulse mb-2">
                                        <Video className="w-10 h-10 text-pink-500" />
                                    </div>
                                    <div className="w-full space-y-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-1">Ready to go Live?</h2>
                                            <p className="text-gray-400 text-sm">Fill in the details below to start your broadcast.</p>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="text-left">
                                                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Stream Title</label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter stream title..."
                                                    value={inputTitle}
                                                    onChange={(e) => setInputTitle(e.target.value)}
                                                    className={`w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-all`}
                                                />
                                            </div>
                                            <div className="text-left">
                                                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Brief Description (Optional)</label>
                                                <textarea
                                                    placeholder="What's this stream about?"
                                                    value={inputDescription}
                                                    onChange={(e) => setInputDescription(e.target.value)}
                                                    rows={2}
                                                    className={`w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-all resize-none`}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={startBroadcast}
                                            disabled={isStarting}
                                            className="w-full py-4 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-lg shadow-pink-500/20 mt-4"
                                        >
                                            {isStarting ? 'Preparing...' : 'Start Broadcast'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isVideoOff && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center">
                                        <VideoOff className="w-10 h-10 text-gray-500" />
                                    </div>
                                    <p className="text-gray-400 font-medium">Video is off</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Overlay Controls */}
                    <div className="absolute top-4 left-4 flex items-center gap-3">
                        <div className="bg-red-600 text-white px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider animate-pulse flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-white" />
                            Live
                        </div>
                        <div className="bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-md text-xs font-bold flex items-center gap-2">
                            <Users className="w-3 h-3" />
                            {viewerCount}
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            if (isHost && isConnected) {
                                if (window.confirm("Ending the live stream? This will disconnect all viewers.")) {
                                    onClose();
                                }
                            } else {
                                onClose();
                            }
                        }}
                        className="absolute top-4 right-4 z-50 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Floating Reactions */}
                    <div className="absolute bottom-20 right-4 pointer-events-none flex flex-col-reverse gap-4 overflow-visible h-64">
                        {reactions.map((r, i) => (
                            <div key={r.id} className="animate-reaction px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-2xl">
                                {r.reaction === 'heart' ? '❤️' : r.reaction === 'laugh' ? '😂' : r.reaction === 'wow' ? '😮' : '🔥'}
                            </div>
                        ))}
                    </div>

                    {/* Host Controls */}
                    {isHost && localStream && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/30 backdrop-blur-lg p-3 rounded-2xl border border-white/10">
                            <button onClick={() => setIsMuted(!isMuted)} className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                            </button>
                            <button onClick={() => setIsVideoOff(!isVideoOff)} className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                                {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                            </button>
                            <button onClick={() => {
                                showPopup('success', 'Stream Shared', 'Your live stream link has been copied to clipboard!');
                                navigator.clipboard.writeText(`${window.location.origin}/dashboard/live/${streamId}`);
                            }} className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20">
                                <Share2 className="w-6 h-6" />
                            </button>
                            <button onClick={handleSaveAndEnd} className="px-6 py-4 rounded-full bg-pink-600 text-white font-bold hover:bg-pink-700 shadow-lg shadow-pink-600/20 flex items-center gap-2">
                                <Star className="w-5 h-5" />
                                Save & Share
                            </button>
                        </div>
                    )}

                    {/* Mobile Chat Toggle (Visible only on mobile/tablet when controls are shown) */}
                    <div className="absolute bottom-4 right-4 md:hidden z-20">
                        <button
                            onClick={() => setShowChat(!showChat)}
                            className={`p-3 rounded-full shadow-lg backdrop-blur-md transition-all ${showChat ? 'bg-pink-500 text-white' : 'bg-black/40 text-white'}`}
                        >
                            <MessageCircle className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Interaction Side */}
                <div className={`
                    ${showChat ? 'flex' : 'hidden md:flex'} 
                    w-full md:w-80 lg:w-96 flex-col border-l transition-colors duration-200 
                    ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}
                    absolute md:relative inset-x-0 bottom-0 top-1/2 md:top-auto md:bottom-auto z-30 md:z-auto h-[50vh] md:h-auto rounded-t-2xl md:rounded-none shadow-[0_-4px_20px_rgba(0,0,0,0.2)] md:shadow-none
                `}>
                    <div className="p-4 border-b flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-500 p-0.5">
                                <img
                                    src={streamData?.hostId?.avatar || '/default-avatar.svg'}
                                    className="w-full h-full rounded-full object-cover border border-white"
                                />
                            </div>
                            <div>
                                <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{streamData?.hostId?.name || 'Broadcaster'}</h3>
                                <p className="text-xs text-gray-400">@{streamData?.hostId?.username || 'user'}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {/* Close Chat Button (Mobile Only) */}
                            <button onClick={() => setShowChat(false)} className="md:hidden text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Stream Info Area */}
                    {(streamData?.title || streamData?.description) && (
                        <div className={`p-4 border-b ${isDarkMode ? 'bg-gray-800/50' : 'bg-pink-50/30'}`}>
                            {streamData?.title && (
                                <h4 className={`font-bold text-sm mb-1 ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`}>
                                    {streamData.title}
                                </h4>
                            )}
                            {streamData?.description && (
                                <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} line-clamp-2`}>
                                    {streamData.description}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Chat Area */}
                    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                        {comments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-40">
                                <MessageCircle className="w-12 h-12 mb-4" />
                                <p className="text-sm italic">Welcome to the live chat! Be the first to say something.</p>
                            </div>
                        ) : (
                            comments.map((c, i) => (
                                <div key={i} className="flex gap-3 items-start animate-fade-in group/chat">
                                    <img src={c.sender?.avatar || '/default-avatar.svg'} className="w-8 h-8 rounded-full flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className={`text-xs font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{c.sender?.name}</p>
                                            {isHost && (
                                                <button
                                                    onClick={() => {
                                                        setComments(prev => prev.filter((_, idx) => idx !== i));
                                                    }}
                                                    className="text-[10px] text-red-500 opacity-0 group-hover/chat:opacity-100 transition-opacity uppercase font-bold"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                        <p className={`text-sm break-words ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{c.content}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={chatEndRef} />
                    </div>



                    {/* Input Area */}
                    <div className="p-4 bg-transparent">
                        <div className="flex items-center gap-2 mb-4">
                            <button onClick={() => sendReaction('heart')} className="p-2 hover:bg-red-500/10 rounded-full text-red-500 transition-colors">❤️</button>
                            <button onClick={() => sendReaction('laugh')} className="p-2 hover:bg-yellow-500/10 rounded-full text-yellow-500 transition-colors">😂</button>
                            <button onClick={() => sendReaction('wow')} className="p-2 hover:bg-blue-500/10 rounded-full text-blue-500 transition-colors">😮</button>
                            <button onClick={() => sendReaction('fire')} className="p-2 hover:bg-orange-500/10 rounded-full text-orange-500 transition-colors">🔥</button>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`flex-1 flex items-center px-4 py-2.5 rounded-2xl border transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 focus-within:border-pink-500' : 'bg-white border-gray-200 focus-within:border-pink-400'}`}>
                                <input
                                    type="text"
                                    placeholder="Comment something..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendComment()}
                                    className="w-full bg-transparent border-none focus:outline-none text-sm"
                                />
                                <Smile className="w-5 h-5 text-gray-400 cursor-pointer hover:text-pink-500 transition-colors" />
                            </div>
                            <button
                                onClick={sendComment}
                                className="p-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl shadow-lg shadow-pink-500/20 transition-all active:scale-95"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-200px) translateX(20px) scale(1.5); opacity: 0; }
        }
        .animate-reaction {
          animation: float 2.5s ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>


        </div>
    );
};

export default LiveStreamModal;
