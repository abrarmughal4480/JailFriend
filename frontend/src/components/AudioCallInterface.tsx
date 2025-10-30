"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Settings } from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface AudioCallInterfaceProps {
  isVisible: boolean;
  callType: 'incoming' | 'outgoing' | 'active';
  caller?: {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  onAccept?: () => void;
  onReject?: () => void;
  onEnd?: () => void;
  onCancel?: () => void;
  onMuteToggle?: () => void;
  onSpeakerToggle?: () => void;
  isMuted?: boolean;
  isSpeakerOn?: boolean;
  callDuration?: number;
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor';
}

export default function AudioCallInterface({
  isVisible,
  callType,
  caller,
  onAccept,
  onReject,
  onEnd,
  onCancel,
  onMuteToggle,
  onSpeakerToggle,
  isMuted = false,
  isSpeakerOn = true,
  callDuration = 0,
  connectionQuality = 'good'
}: AudioCallInterfaceProps) {
  const { isDarkMode } = useDarkMode();
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Update call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callType === 'active') {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callType]);

  // Reset timer when call ends
  useEffect(() => {
    if (callType !== 'active') {
      setTimeElapsed(0);
    }
  }, [callType]);

  if (!isVisible) return null;

  const getConnectionQualityColor = () => {
    switch (connectionQuality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getConnectionQualityText = () => {
    switch (connectionQuality) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'fair': return 'Fair';
      case 'poor': return 'Poor';
      default: return 'Unknown';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${
      isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'
    } backdrop-blur-sm`}>
      <div className={`w-full max-w-md mx-4 p-6 rounded-2xl shadow-2xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        
        {/* Caller Info */}
        <div className="text-center mb-8">
          <div className="relative mx-auto mb-4">
            <div className={`w-24 h-24 rounded-full mx-auto overflow-hidden ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              {caller?.avatar && caller.avatar !== '/default-avatar.svg' ? (
                <img
                  src={caller.avatar}
                  alt={caller.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-3xl">👤</span>
                </div>
              )}
            </div>
            
            {/* Connection Quality Indicator */}
            {callType === 'active' && (
              <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-full text-xs font-medium ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              } ${getConnectionQualityColor()}`}>
                {getConnectionQualityText()}
              </div>
            )}
          </div>
          
          <h2 className={`text-xl font-semibold mb-1 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {caller?.name || 'Unknown Caller'}
          </h2>
          
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            @{caller?.username || 'unknown'}
          </p>
          
          {/* Call Status */}
          <div className="mt-4">
            {callType === 'incoming' && (
              <p className={`text-lg font-medium ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                Incoming Call
              </p>
            )}
            {callType === 'outgoing' && (
              <p className={`text-lg font-medium ${
                isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
              }`}>
                Calling...
              </p>
            )}
            {callType === 'active' && (
              <div>
                <p className={`text-lg font-mono font-medium ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`}>
                  {formatDuration(timeElapsed)}
                </p>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Call in progress
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Call Controls */}
        <div className="flex justify-center items-center space-x-6">
          {/* Mute Button */}
          {callType === 'active' && (
            <button
              onClick={onMuteToggle}
              className={`p-4 rounded-full transition-all duration-200 ${
                isMuted
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          )}

          {/* Speaker Button */}
          {callType === 'active' && (
            <button
              onClick={onSpeakerToggle}
              className={`p-4 rounded-full transition-all duration-200 ${
                isSpeakerOn
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>
          )}

          {/* Accept Button (Incoming Call) */}
          {callType === 'incoming' && (
            <button
              onClick={onAccept}
              className="p-4 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <Phone className="w-6 h-6" />
            </button>
          )}

          {/* End/Cancel Button */}
          <button
            onClick={callType === 'active' ? onEnd : onReject || onCancel}
            className={`p-4 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 ${
              callType === 'active'
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>

        {/* Additional Info */}
        {callType === 'active' && (
          <div className="mt-6 text-center">
            <p className={`text-xs ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              Tap to minimize call
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
