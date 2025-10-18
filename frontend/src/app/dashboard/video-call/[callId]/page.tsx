'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import useWebRTC from '@/hooks/webrtc';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';

interface VideoCallPageProps {}

const VideoCallPage: React.FC<VideoCallPageProps> = () => {
    const params = useParams();
    const router = useRouter();
    const callId = params.callId as string;
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [callerName, setCallerName] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    
    // Get isAdmin from URL directly to avoid timing issues
    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const userType = urlParams.get('type');
    const isAdminFromURL = userType === 'admin';
    
    console.log('🎯 Video Call Page - Direct URL Check:', {
        userType,
        isAdminFromURL,
        searchParams: typeof window !== 'undefined' ? window.location.search : 'N/A'
    });
    
    const {
        localStream,
        remoteStream,
        isConnected,
        connectionState,
        handleDisconnect,
        startPeerConnection,
        handleVideoPlay,
        showVideoPlayError
    } = useWebRTC({
        isAdmin: isAdminFromURL,
        roomId: callId,
        videoRef,
        user: null
    });

    useEffect(() => {
        // Check if user is admin or regular user based on URL or other logic
        const urlParams = new URLSearchParams(window.location.search);
        const userType = urlParams.get('type');
        const isAdminUser = userType === 'admin';
        
        console.log('🎯 Video Call Page - URL Parameters:', {
            callId,
            userType,
            isAdminUser,
            fullURL: window.location.href,
            searchParams: window.location.search
        });
        
        setIsAdmin(isAdminUser);
        
        // Get caller name from URL params or localStorage
        const caller = urlParams.get('caller') || 'Unknown Caller';
        setCallerName(caller);
        
        // Peer connection is started automatically by the WebRTC hook
    }, [callId]);

    const handleEndCall = () => {
        handleDisconnect(true);
        // Don't redirect here - let the WebRTC hook handle redirects
        // This ensures both users get redirected properly
    };

    const toggleMute = () => {
        if (localStream) {
            const audioTracks = localStream.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = isMuted;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            const videoTracks = localStream.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = isVideoOff;
            });
            setIsVideoOff(!isVideoOff);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-full max-w-6xl mx-auto p-4">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-white text-2xl font-bold">
                        Video Call with {callerName}
                    </h1>
                    <p className="text-gray-400">
                        {isConnected ? 'Connected' : 'Connecting...'}
                    </p>
                </div>

                {/* Video Container */}
                <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-6">
                    <div className="aspect-video relative">
                        {/* Remote Video */}
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted={false}
                            className="w-full h-full object-cover"
                        />
                        
                        {/* Local Video (Picture-in-Picture) */}
                        {localStream && (
                            <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
                                <video
                                    autoPlay
                                    playsInline
                                    muted={true}
                                    className="w-full h-full object-cover"
                                    ref={(video) => {
                                        if (video && localStream) {
                                            video.srcObject = localStream;
                                        }
                                    }}
                                />
                            </div>
                        )}
                        
                        {/* Video Play Error Overlay */}
                        {showVideoPlayError && (
                            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                                <div className="text-center text-white">
                                    <p className="text-lg mb-4">Video autoplay blocked</p>
                                    <button 
                                        onClick={handleVideoPlay} 
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                                    >
                                        Click to Play Video
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Call Controls */}
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={toggleMute}
                        className={`rounded-full w-14 h-14 flex items-center justify-center ${
                            isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                        }`}
                    >
                        {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </button>
                    
                    <button
                        onClick={toggleVideo}
                        className={`rounded-full w-14 h-14 flex items-center justify-center ${
                            isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                        }`}
                    >
                        {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                    </button>
                    
                    <button
                        onClick={handleEndCall}
                        className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700 flex items-center justify-center"
                    >
                        <PhoneOff className="w-6 h-6" />
                    </button>
                </div>

                {/* Call Status */}
                <div className="text-center mt-6">
                    <div className="text-gray-400 text-sm">
                        {connectionState === 'connected' ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span>Call Active</span>
                            </div>
                        ) : connectionState === 'failed' ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span>Connection Failed</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                <span>Connecting...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoCallPage;
