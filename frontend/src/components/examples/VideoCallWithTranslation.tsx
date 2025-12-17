/**
 * Complete Video Call Component with Real-Time Translation
 * 
 * This is a reference implementation showing how to integrate
 * real-time translation into a video call.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useRealtimeTranslation } from '@/hooks/useRealtimeTranslation';
import { TranslationControls } from '@/components/TranslationControls';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff } from 'react-icons/fi';

interface VideoCallWithTranslationProps {
    roomId: string;
    socket: any; // Socket.IO client
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    onEndCall: () => void;
}

export const VideoCallWithTranslation: React.FC<VideoCallWithTranslationProps> = ({
    roomId,
    socket,
    localStream,
    remoteStream,
    onEndCall
}) => {
    // Video refs
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    // Call controls state
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    // Translation state
    const [translationEnabled, setTranslationEnabled] = useState(false);
    const [translationConfig, setTranslationConfig] = useState({
        roomId,
        targetLanguage: 'hi',
        sourceLanguage: 'en',
        translationType: 'two_way' as const
    });

    // Initialize translation hook
    const {
        isTranslating,
        currentTranscript,
        currentTranslation,
        startTranslation,
        stopTranslation
    } = useRealtimeTranslation({
        socket,
        enabled: translationEnabled,
        config: translationConfig,
        onTranscript: (result) => {
            console.log('📝 Transcript:', result.transcript);
            console.log('🌐 Translation:', result.translation);

            // You can display these in a UI element
            // For example, show captions or save to chat history
        },
        onError: (error) => {
            console.error('❌ Translation error:', error);
            alert(`Translation error: ${error.message}`);
            setTranslationEnabled(false);
        }
    });

    // Set up video streams
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    // Handle mute toggle
    const toggleMute = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    // Handle video toggle
    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    // Handle translation toggle
    const handleTranslationToggle = (enabled: boolean, config: any) => {
        setTranslationEnabled(enabled);
        setTranslationConfig({
            ...translationConfig,
            ...config
        });

        /**
         * IMPORTANT: When translation is enabled, we need to mute the WebRTC audio
         * because the translation system will handle audio separately.
         * 
         * The flow is:
         * 1. User enables translation
         * 2. WebRTC audio is muted (but video continues)
         * 3. MediaRecorder captures audio separately
         * 4. Audio is sent to Soniox for STT + Translation
         * 5. Translated audio is played via WavStreamPlayer
         */
        if (enabled && localStream) {
            // Mute WebRTC audio track
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = false;
                setIsMuted(true);
            }
        } else if (!enabled && localStream && !isMuted) {
            // Re-enable WebRTC audio track only if user hasn't manually muted
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = true;
                setIsMuted(false);
            }
        }
    };

    // Handle end call
    const handleEndCall = () => {
        // Stop translation if active
        if (translationEnabled) {
            stopTranslation();
        }

        // Stop all tracks
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }

        // Call parent callback
        onEndCall();
    };

    return (
        <div className="video-call-container">
            {/* Remote video (large) */}
            <div className="remote-video-wrapper">
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="remote-video"
                />

                {/* Translation captions overlay */}
                {translationEnabled && (currentTranscript || currentTranslation) && (
                    <div className="captions-overlay">
                        {currentTranscript && (
                            <div className="caption original">
                                <span className="label">Original:</span>
                                <span className="text">{currentTranscript}</span>
                            </div>
                        )}
                        {currentTranslation && (
                            <div className="caption translation">
                                <span className="label">Translation:</span>
                                <span className="text">{currentTranslation}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Local video (small, picture-in-picture) */}
            <div className="local-video-wrapper">
                <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="local-video"
                />
                {isVideoOff && (
                    <div className="video-off-overlay">
                        <FiVideoOff size={32} />
                    </div>
                )}
            </div>

            {/* Call controls */}
            <div className="call-controls">
                {/* Mute button */}
                <button
                    onClick={toggleMute}
                    className={`control-btn ${isMuted ? 'active' : ''}`}
                    disabled={translationEnabled} // Disable when translation is active
                    title={translationEnabled ? 'Disabled during translation' : 'Toggle Mute'}
                >
                    {isMuted ? <FiMicOff size={20} /> : <FiMic size={20} />}
                </button>

                {/* Video button */}
                <button
                    onClick={toggleVideo}
                    className={`control-btn ${isVideoOff ? 'active' : ''}`}
                    title="Toggle Video"
                >
                    {isVideoOff ? <FiVideoOff size={20} /> : <FiVideo size={20} />}
                </button>

                {/* Translation controls */}
                <TranslationControls
                    enabled={translationEnabled}
                    isTranslating={isTranslating}
                    currentTranscript={currentTranscript}
                    currentTranslation={currentTranslation}
                    onToggle={handleTranslationToggle}
                />

                {/* End call button */}
                <button
                    onClick={handleEndCall}
                    className="control-btn end-call"
                    title="End Call"
                >
                    <FiPhoneOff size={20} />
                </button>
            </div>

            <style jsx>{`
        .video-call-container {
          position: relative;
          width: 100%;
          height: 100vh;
          background: #000;
          overflow: hidden;
        }

        .remote-video-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .remote-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .local-video-wrapper {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 200px;
          height: 150px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .local-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-off-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .captions-overlay {
          position: absolute;
          bottom: 100px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 800px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .caption {
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          padding: 12px 16px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .caption .label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          opacity: 0.7;
          color: white;
        }

        .caption .text {
          font-size: 16px;
          color: white;
          line-height: 1.5;
        }

        .caption.translation {
          background: rgba(102, 126, 234, 0.9);
        }

        .caption.translation .label {
          color: rgba(255, 255, 255, 0.9);
        }

        .call-controls {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 16px;
          padding: 16px 24px;
          background: rgba(30, 30, 30, 0.9);
          backdrop-filter: blur(20px);
          border-radius: 50px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .control-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
        }

        .control-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }

        .control-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .control-btn:disabled:hover {
          transform: none;
        }

        .control-btn.active {
          background: rgba(239, 68, 68, 0.8);
          border-color: transparent;
        }

        .control-btn.end-call {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border-color: transparent;
        }

        .control-btn.end-call:hover {
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }

        @media (max-width: 768px) {
          .local-video-wrapper {
            width: 120px;
            height: 90px;
            top: 10px;
            right: 10px;
          }

          .captions-overlay {
            width: 95%;
            bottom: 120px;
          }

          .caption .text {
            font-size: 14px;
          }

          .call-controls {
            gap: 12px;
            padding: 12px 16px;
          }

          .control-btn {
            width: 44px;
            height: 44px;
          }
        }
      `}</style>
        </div>
    );
};
