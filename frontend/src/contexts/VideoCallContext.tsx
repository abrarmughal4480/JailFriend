'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import VideoCallService from '@/services/videoCallService';
import { getToken, getCurrentUserId, getCurrentUser } from '@/utils/auth';
import socketService from '@/services/socketService';

interface VideoCallContextType {
  videoCallService: VideoCallService | null;
  incomingVideoCall: any | null;
  showVideoCallNotification: boolean;
  setShowVideoCallNotification: (show: boolean) => void;
  acceptVideoCall: (callId: string) => void;
  declineVideoCall: (callId: string) => void;
}

const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined);

export const useVideoCall = () => {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error('useVideoCall must be used within a VideoCallProvider');
  }
  return context;
};

interface VideoCallProviderProps {
  children: React.ReactNode;
}

export const VideoCallProvider: React.FC<VideoCallProviderProps> = ({ children }) => {
  const [videoCallService, setVideoCallService] = useState<VideoCallService | null>(null);
  const [incomingVideoCall, setIncomingVideoCall] = useState<any | null>(null);
  const [showVideoCallNotification, setShowVideoCallNotification] = useState(false);
  const [callTimer, setCallTimer] = useState(30);

  useEffect(() => {
    // Request notification permission on app load
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    let retryCount = 0;
    const maxRetries = 10; // Maximum 20 seconds of retries
    
    // Initialize after ensuring socket is ready
    const initializeWithSocketCheck = () => {
      const token = getToken();
      const userId = getCurrentUserId();
      const user = getCurrentUser();
      
      if (!token || !userId) {
        console.log('No token or userId found for video call service');
        return;
      }

      // Check if socket is ready
      const socket = socketService.getSocket();
      if (!socket || !socket.connected) {
        // Try to connect socket if not connected
        if (!socketService.getConnected()) {
          console.log('🎯 Socket not connected, attempting to connect...');
          socketService.connect();
        }
        
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`🎯 Socket not ready for video call service, retry ${retryCount}/${maxRetries}...`);
          setTimeout(initializeWithSocketCheck, 2000);
        } else {
          console.error('🎯 Failed to initialize video call service after maximum retries');
        }
        return;
      }

      console.log('🎯 Initializing global video call service for user:', userId);
      console.log('🎯 User data:', user);
      console.log('🎯 Socket ready:', socket.id);
      
      // Get user name from stored user data or fallback to username/email
      const userName = user?.name || (user as any)?.username || user?.email || 'User';
      console.log('🎯 Using userName for video call service:', userName);
      
      const service = new VideoCallService({
        userId,
        userName: userName,
        onIncomingCall: (callData) => {
          console.log('📹 Global incoming video call:', callData);
          setIncomingVideoCall(callData);
          setShowVideoCallNotification(true);
          
          // Request browser notification permission and show notification
          if ('Notification' in window) {
            if (Notification.permission === 'granted') {
              new Notification('Incoming Video Call', {
                body: `${callData.callerName} is calling you for a service session`,
                icon: '/favicon.ico',
                tag: 'video-call',
                requireInteraction: true
              });
            } else if (Notification.permission !== 'denied') {
              Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                  new Notification('Incoming Video Call', {
                    body: `${callData.callerName} is calling you for a service session`,
                    icon: '/favicon.ico',
                    tag: 'video-call',
                    requireInteraction: true
                  });
                }
              });
            }
          }
          
          // Play professional notification sound using Web Audio API
          try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            // Create a more professional ringtone
            const createTone = (frequency: number, startTime: number, duration: number) => {
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              
              oscillator.frequency.setValueAtTime(frequency, startTime);
              oscillator.type = 'sine';
              
              gainNode.gain.setValueAtTime(0, startTime);
              gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.1);
              gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
              
              oscillator.start(startTime);
              oscillator.stop(startTime + duration);
            };
            
            const currentTime = audioContext.currentTime;
            
            // Create a professional ringtone pattern
            createTone(800, currentTime, 0.2);
            createTone(600, currentTime + 0.3, 0.2);
            createTone(800, currentTime + 0.6, 0.2);
            
            // Repeat the pattern
            setTimeout(() => {
              createTone(800, audioContext.currentTime, 0.2);
              createTone(600, audioContext.currentTime + 0.3, 0.2);
              createTone(800, audioContext.currentTime + 0.6, 0.2);
            }, 1000);
            
          } catch (e) {
            console.log('Web Audio API not available for notification sound');
          }
        },
        onCallAccepted: (callId) => {
          console.log('📹 Video call accepted:', callId);
          setShowVideoCallNotification(false);
          setIncomingVideoCall(null);
        },
        onCallDeclined: (callId) => {
          console.log('📹 Video call declined:', callId);
          setShowVideoCallNotification(false);
          setIncomingVideoCall(null);
        },
        onCallEnded: (callId) => {
          console.log('📹 Video call ended:', callId);
          setShowVideoCallNotification(false);
          setIncomingVideoCall(null);
        }
      });
      
      service.connect();
      setVideoCallService(service);
    };

    // Start initialization immediately, but with socket checking
    initializeWithSocketCheck();
    
    return () => {
      if (videoCallService) {
        videoCallService.disconnect();
      }
    };
  }, []);

  // Timer effect for incoming calls
  useEffect(() => {
    if (showVideoCallNotification && callTimer > 0) {
      const timer = setTimeout(() => {
        setCallTimer(prev => {
          if (prev <= 1) {
            // Auto decline after 30 seconds
            declineVideoCall(incomingVideoCall?.callId || '');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [showVideoCallNotification, callTimer, incomingVideoCall]);

  // Reset timer when new call comes in
  useEffect(() => {
    if (showVideoCallNotification) {
      setCallTimer(30);
    }
  }, [showVideoCallNotification]);

  const acceptVideoCall = (callId: string) => {
    if (videoCallService && incomingVideoCall) {
      console.log('🎯 Accepting video call:', {
        callId,
        incomingVideoCall,
        userType: 'USER',
        url: `/dashboard/video-call/${callId}?type=user&caller=${encodeURIComponent(incomingVideoCall.callerName)}`
      });
      
      videoCallService.acceptCall(callId);
      // Navigate to video call page
      window.location.href = `/dashboard/video-call/${callId}?type=user&caller=${encodeURIComponent(incomingVideoCall.callerName)}`;
    }
  };

  const declineVideoCall = (callId: string) => {
    if (videoCallService) {
      videoCallService.declineCall(incomingVideoCall?.callId || callId);
    }
  };

  const value: VideoCallContextType = {
    videoCallService,
    incomingVideoCall,
    showVideoCallNotification,
    setShowVideoCallNotification,
    acceptVideoCall,
    declineVideoCall
  };

  return (
    <VideoCallContext.Provider value={value}>
      {children}
      
      {/* Global Video Call Notification */}
      {showVideoCallNotification && incomingVideoCall && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 video-call-backdrop">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full mx-4 transform transition-all duration-500 scale-100 video-call-notification">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Incoming Call
                  </h3>
                </div>
              </div>
              
              {/* Caller Info */}
              <div className="text-center mb-6">
                {/* Avatar */}
                <div className="relative mb-4">
                  <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-green-500 shadow-lg video-call-avatar">
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                      {incomingVideoCall.callerName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  </div>
                  {/* Ring animation */}
                  <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping opacity-75"></div>
                </div>

                {/* Caller Name */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {incomingVideoCall.callerName || 'Unknown Caller'}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Video Call Request
                </p>
              </div>

              {/* Timer */}
              <div className="mb-6">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Auto-decline in</span>
                  <span className="font-bold text-red-500 text-lg video-call-timer">{callTimer}s</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowVideoCallNotification(false);
                    setIncomingVideoCall(null);
                    // Redirect to video call page as user (receiver) in same tab
                    window.location.href = `/dashboard/video-call/${incomingVideoCall.callId}?type=user`;
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-2xl h-14 flex items-center justify-center space-x-2 font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg video-call-button"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Accept</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowVideoCallNotification(false);
                    setIncomingVideoCall(null);
                    declineVideoCall(incomingVideoCall.callId);
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-2xl h-14 flex items-center justify-center space-x-2 font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg video-call-button"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Decline</span>
                </button>
              </div>

              {/* Call Info */}
              <div className="mt-4 text-center">
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  Call ID: {incomingVideoCall.callId?.slice(0, 8)}...
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </VideoCallContext.Provider>
  );
};
