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

  useEffect(() => {
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📹</span>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                Incoming Video Call
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                {incomingVideoCall.callerName} is calling you for a service session
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <p><strong>Call ID:</strong> {incomingVideoCall.callId}</p>
                  <p><strong>Room ID:</strong> {incomingVideoCall.roomId}</p>
                  <p><strong>Booking ID:</strong> {incomingVideoCall.bookingId}</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowVideoCallNotification(false);
                    setIncomingVideoCall(null);
                    // Redirect to video call page as user (receiver) in same tab
                    window.location.href = `/dashboard/video-call/${incomingVideoCall.callId}?type=user`;
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <span>📞</span>
                  <span>Accept Call</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowVideoCallNotification(false);
                    setIncomingVideoCall(null);
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <span>❌</span>
                  <span>Decline</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </VideoCallContext.Provider>
  );
};
