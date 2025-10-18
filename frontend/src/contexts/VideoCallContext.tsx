'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import VideoCallService from '@/services/videoCallService';
import { getToken, getCurrentUserId } from '@/utils/auth';

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
    const initializeVideoCallService = () => {
      const token = getToken();
      const userId = getCurrentUserId();
      
      if (!token || !userId) {
        console.log('No token or userId found for video call service');
        return;
      }

      console.log('Initializing global video call service for user:', userId);
      
      const service = new VideoCallService({
        userId,
        userName: 'User', // You can get this from user context or API
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

    // Initialize after a short delay to ensure socket is ready
    const timer = setTimeout(initializeVideoCallService, 1000);
    
    return () => {
      clearTimeout(timer);
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
    </VideoCallContext.Provider>
  );
};
