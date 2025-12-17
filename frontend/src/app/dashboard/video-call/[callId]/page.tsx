'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import useWebRTC from '@/hooks/webrtc';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useRealtimeTranslation } from '@/hooks/useRealtimeTranslation';
import { TranslationControls } from '@/components/TranslationControls';
import LanguageSelectorModal from '@/components/LanguageSelectorModal';
import { getVideoCallDetailsApi } from '@/utils/api';
import { getToken } from '@/utils/auth';

interface VideoCallPageProps { }

const VideoCallPage: React.FC<VideoCallPageProps> = () => {
    const params = useParams();
    const router = useRouter();
    const callId = params.callId as string;

    const videoRef = useRef<HTMLVideoElement>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [callerName, setCallerName] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [callStartTime, setCallStartTime] = useState<Date | null>(null);
    const [hasRealtimeTranslationAllowed, setHasRealtimeTranslationAllowed] = useState(false);

    // Translation state
    const [translationEnabled, setTranslationEnabled] = useState(false);
    const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
    const [hasPopupShown, setHasPopupShown] = useState(false);
    const [translationConfig, setTranslationConfig] = useState({
        roomId: callId,
        targetLanguage: 'hi',
        sourceLanguage: 'en',
        translationType: 'one_way' as const
    });

    // Load saved call duration from localStorage
    useEffect(() => {
        const savedDuration = localStorage.getItem(`call-duration-${callId}`);
        const savedStartTime = localStorage.getItem(`call-start-time-${callId}`);

        if (savedDuration && savedStartTime) {
            const startTime = new Date(savedStartTime);
            const now = new Date();
            const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);

            setCallDuration(elapsedSeconds);
            setCallStartTime(startTime);
            console.log(`🕐 Restored call duration: ${elapsedSeconds}s from localStorage`);
        }
    }, [callId]);

    // Mobile detection
    const isMobile = typeof window !== 'undefined' && (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth <= 768
    );

    // Get isAdmin from URL directly to avoid timing issues
    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const userType = urlParams.get('type');
    const isAdminFromURL = userType === 'admin';

    const {
        localStream,
        remoteStream,
        isConnected,
        connectionState,
        handleDisconnect,
        startPeerConnection,
        handleVideoPlay,
        showVideoPlayError,
        isReconnecting,
        reconnectionAttempt,
        maxReconnectionAttempts,
        socket // Ensure socket is destructured
    } = useWebRTC({
        isAdmin: isAdminFromURL,
        roomId: callId,
        videoRef,
        user: null
    });


    // Initialize translation hook
    const {
        isTranslating,
        currentTranscript,
        currentTranslation
    } = useRealtimeTranslation({
        socket,
        enabled: translationEnabled,
        config: translationConfig,
        inputStream: remoteStream, // Translate the other person's voice
        onTranscript: (result) => {
            console.log('📝 Transcript:', result.transcript);
            console.log('🌐 Translation:', result.translation);
        },
        onError: (error) => {
            console.error('❌ Translation error:', error);
            alert(`Translation error: ${error.message}`);
            setTranslationEnabled(false);
        }
    });

    // Handle translation toggle
    const handleTranslationToggle = useCallback((enabled: boolean, config: any) => {
        setTranslationEnabled(enabled);
        setTranslationConfig({
            ...translationConfig,
            ...config
        });

        // When translation is enabled, mute the REMOTE video element
        // so you don't hear the original audio, only the translated audio
        if (enabled && videoRef.current) {
            videoRef.current.muted = true;
            console.log('🔇 Muted remote video - will play translated audio instead');
        } else if (!enabled && videoRef.current) {
            // Re-enable remote video audio when translation is disabled
            videoRef.current.muted = false;
            console.log('🔊 Unmuted remote video - playing original audio');
        }
    }, [videoRef, translationConfig]);


    useEffect(() => {
        // Check if user is admin or regular user based on URL or other logic
        const urlParams = new URLSearchParams(window.location.search);
        const userType = urlParams.get('type');
        const isAdminUser = userType === 'admin';

        setIsAdmin(isAdminUser);

        // Get caller name from URL params or localStorage
        const caller = urlParams.get('caller') || 'Unknown Caller';
        setCallerName(caller);

        // Peer connection is started automatically by the WebRTC hook
    }, [callId]);

    // Automatically show language selection popup when connected if translation is allowed
    useEffect(() => {
        if (isConnected && hasRealtimeTranslationAllowed && !hasPopupShown && !translationEnabled) {
            console.log('🌐 Connection established and translation allowed, opening language selector...');
            setIsLanguageModalOpen(true);
            setHasPopupShown(true);
        }
    }, [isConnected, hasRealtimeTranslationAllowed, hasPopupShown, translationEnabled]);

    const handleLanguageSelect = useCallback((selectedLanguage: string) => {
        console.log(`🌐 User selected language: ${selectedLanguage}`);

        // Update config and enable translation
        const newConfig = {
            ...translationConfig,
            targetLanguage: selectedLanguage,
            // If source language same as target, pick something else as secondary hint
            sourceLanguage: selectedLanguage === 'en' ? 'es' : 'en'
        };

        setTranslationConfig(newConfig);
        setTranslationEnabled(true);

        // Mute remote video to hear translated audio
        if (videoRef.current) {
            videoRef.current.muted = true;
            console.log('🔇 Muted remote video - will play translated audio instead');
        }
    }, [translationConfig, videoRef]);

    // Fetch call details to check for paid features
    useEffect(() => {
        const fetchCallDetails = async () => {
            const token = getToken();
            if (!token || !callId) return;

            try {
                const response = await getVideoCallDetailsApi(token, callId);
                if (response.success && response.videoCall) {
                    const allowed = response.videoCall.hasRealtimeTranslation ||
                        (response.videoCall.bookingId && response.videoCall.bookingId.hasRealtimeTranslation) ||
                        false;
                    setHasRealtimeTranslationAllowed(allowed);
                    console.log('📹 Call details fetched:', {
                        hasRealtimeTranslation: response.videoCall.hasRealtimeTranslation,
                        bookingId: response.videoCall.bookingId
                    });
                }
            } catch (error) {
                console.error('Error fetching call details:', error);
            }
        };

        fetchCallDetails();
    }, [callId]);

    // Timer effect - only runs when connected
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isConnected && connectionState === 'connected') {
            // Start timer when connected
            if (!callStartTime) {
                const startTime = new Date();
                setCallStartTime(startTime);

                // Save start time to localStorage
                localStorage.setItem(`call-start-time-${callId}`, startTime.toISOString());
                console.log(`🕐 Call started, saved start time: ${startTime.toISOString()}`);
            }

            interval = setInterval(() => {
                setCallDuration(prev => {
                    const newDuration = prev + 1;
                    // Save current duration to localStorage
                    localStorage.setItem(`call-duration-${callId}`, newDuration.toString());
                    return newDuration;
                });
            }, 1000);
        } else {
            // Reset timer when not connected
            setCallStartTime(null);
            setCallDuration(0);

            // Clear localStorage when call ends
            localStorage.removeItem(`call-duration-${callId}`);
            localStorage.removeItem(`call-start-time-${callId}`);
            console.log(`🕐 Call ended, cleared localStorage for call: ${callId}`);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isConnected, connectionState, callStartTime, callId]);

    // Cleanup localStorage on component unmount
    useEffect(() => {
        return () => {
            // Clear localStorage when component unmounts
            localStorage.removeItem(`call-duration-${callId}`);
            localStorage.removeItem(`call-start-time-${callId}`);
            console.log(`🕐 Component unmounted, cleared localStorage for call: ${callId}`);
        };
    }, [callId]);

    // Format duration helper - memoized to prevent unnecessary re-renders
    const formatDuration = useCallback((seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    // Memoized formatted duration to prevent unnecessary re-renders
    const formattedDuration = useMemo(() => formatDuration(callDuration), [callDuration, formatDuration]);

    const toggleMute = useCallback(() => {
        if (localStream) {
            const audioTracks = localStream.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = isMuted;
            });
            setIsMuted(!isMuted);
        }
    }, [localStream, isMuted]);

    const toggleVideo = useCallback(() => {
        if (localStream) {
            const videoTracks = localStream.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = isVideoOff;
            });
            setIsVideoOff(!isVideoOff);
        }
    }, [localStream, isVideoOff]);

    const handleEndCall = useCallback(() => {
        // Clear localStorage when call is manually ended
        localStorage.removeItem(`call-duration-${callId}`);
        localStorage.removeItem(`call-start-time-${callId}`);
        console.log(`🕐 Call manually ended, cleared localStorage for call: ${callId}`);

        handleDisconnect(true);
        // Don't redirect here - let the WebRTC hook handle redirects
        // This ensures both users get redirected properly
    }, [handleDisconnect, callId]);

    const handleVideoRef = useCallback((video: HTMLVideoElement | null) => {
        if (video && localStream) {
            video.srcObject = localStream;
            video.play().catch(e => console.error("Error playing local video:", e));
        }
    }, [localStream]);

    // Ensure remote stream is attached when available
    useEffect(() => {
        if (videoRef.current && remoteStream) {
            console.log('VideoCallPage: Attaching remote stream to video element', remoteStream.id);
            videoRef.current.srcObject = remoteStream;
            videoRef.current.play().catch(err => {
                console.error('VideoCallPage: Error playing remote video:', err);
            });
        }
    }, [remoteStream]);


    return (
        <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
            <div className="w-full h-full flex flex-col">
                {/* Header */}
                <div className="text-center py-4 px-4 flex-shrink-0">
                    <h1 className="text-white text-xl sm:text-2xl font-bold">
                        Video Call with {callerName}
                    </h1>
                    <div className="flex items-center justify-center space-x-4 mt-2">
                        <p className="text-gray-400 text-sm sm:text-base">
                            {isReconnecting ? (
                                <span className="text-yellow-400">
                                    Reconnecting... (Attempt {reconnectionAttempt}/{maxReconnectionAttempts})
                                </span>
                            ) : isConnected ? (
                                'Connected'
                            ) : (
                                'Connecting...'
                            )}
                        </p>
                        {/* Call Timer - Only show when connected */}
                        {isConnected && connectionState === 'connected' && callDuration > 0 && (
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-green-400 font-mono text-base sm:text-lg font-semibold">
                                    {formattedDuration}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Video Container */}
                <div className="relative bg-gray-900 flex-1 mx-4 mb-4 overflow-hidden">
                    <div className="w-full h-full relative flex items-center justify-center">
                        {/* Remote Video */}
                        {remoteStream ? (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted={false}
                                className={`${isMobile ? 'w-full h-full' : 'w-full h-full'} object-contain`}
                                style={{
                                    aspectRatio: isMobile ? '9/16' : '16/9',
                                    maxWidth: isMobile ? '100%' : '100%',
                                    maxHeight: isMobile ? '100%' : '100%'
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                <div className="text-center text-white">
                                    <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl">📹</span>
                                    </div>
                                    <p className="text-lg font-medium">Waiting for video...</p>
                                    <p className="text-sm text-gray-400 mt-2">
                                        {isReconnecting ? 'Reconnecting...' : 'Connecting...'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Local Video (Picture-in-Picture) */}
                        {localStream && (
                            <div className={`absolute top-4 right-4 bg-gray-800 rounded-lg overflow-hidden ${isMobile ? 'w-24 h-32' : 'w-32 h-24 sm:w-48 sm:h-36'
                                }`}>
                                <video
                                    autoPlay
                                    playsInline
                                    muted={true}
                                    className="w-full h-full object-contain"
                                    style={{
                                        aspectRatio: isMobile ? '9/16' : '16/9'
                                    }}
                                    ref={handleVideoRef}
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
                <div className="flex justify-center space-x-4 py-4 px-4 flex-shrink-0">
                    <button
                        onClick={toggleMute}
                        className={`rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center transition-colors ${isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                            }`}
                    >
                        {isMuted ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
                    </button>

                    <button
                        onClick={toggleVideo}
                        className={`rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center transition-colors ${isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                            }`}
                    >
                        {isVideoOff ? <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Video className="w-5 h-5 sm:w-6 sm:h-6" />}
                    </button>

                    {/* Translation Controls - Only show if paid for in P2P call */}
                    {hasRealtimeTranslationAllowed && (
                        <TranslationControls
                            enabled={translationEnabled}
                            isTranslating={isTranslating}
                            config={translationConfig}
                            currentTranscript={currentTranscript}
                            currentTranslation={currentTranslation}
                            onToggle={handleTranslationToggle}
                        />
                    )}

                    <button
                        onClick={handleEndCall}
                        className="rounded-full w-12 h-12 sm:w-14 sm:h-14 bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors"
                    >
                        <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>


                </div>
            </div>



            {/* Call Status */}
            <div className="text-center py-2 px-4 flex-shrink-0">
                <div className="text-gray-400 text-xs sm:text-sm">
                    {isReconnecting ? (
                        <div className="flex items-center justify-center space-x-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                            <span>Reconnecting... (Attempt {reconnectionAttempt}/{maxReconnectionAttempts})</span>
                        </div>
                    ) : connectionState === 'connected' ? (
                        <div className="flex items-center justify-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Call Active</span>
                            {/* Show timer in status area as well */}
                            {callDuration > 0 && (
                                <span className="text-green-400 font-mono ml-2">
                                    ({formattedDuration})
                                </span>
                            )}
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

            {/* Language Selection Modal */}
            <LanguageSelectorModal
                isOpen={isLanguageModalOpen}
                onClose={() => setIsLanguageModalOpen(false)}
                onSelect={handleLanguageSelect}
            />
        </div>
    );
};

export default VideoCallPage;
