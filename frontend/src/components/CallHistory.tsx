"use client";
import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, PhoneIncoming, PhoneOutgoing, Clock, Calendar, Trash2 } from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { getToken } from '@/utils/auth';
import { cleanupOldCallsApi } from '@/utils/api';

interface CallRecord {
  _id: string;
  callerId: {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  receiverId: {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  status: 'initiated' | 'ringing' | 'answered' | 'rejected' | 'ended' | 'missed' | 'cancelled';
  startTime: string;
  endTime?: string;
  duration: number;
  callType: 'audio' | 'video';
  rejectionReason?: string;
}

interface CallHistoryProps {
  userId: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function CallHistory({ userId, isVisible, onClose }: CallHistoryProps) {
  const { isDarkMode } = useDarkMode();
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [cleaningUp, setCleaningUp] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jailfriend-1.onrender.com';

  const fetchCallHistory = async (pageNum: number = 1, append: boolean = false) => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/audio-calls/history?page=${pageNum}&limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (append) {
          setCalls(prev => [...prev, ...data.calls]);
        } else {
          setCalls(data.calls);
        }
        setHasMore(data.pagination.hasNextPage);
      }
    } catch (error) {
      console.error('Error fetching call history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchCallHistory(1, false);
    }
  }, [isVisible]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCallHistory(nextPage, true);
    }
  };

  const cleanupOldCalls = async () => {
    const token = getToken();
    if (!token) return;

    setCleaningUp(true);
    try {
      await cleanupOldCallsApi(token);
      // Refresh the call history
      await fetchCallHistory(1, false);
      alert('Old calls cleaned up successfully!');
    } catch (error) {
      console.error('Error cleaning up calls:', error);
      alert('Failed to cleanup old calls');
    } finally {
      setCleaningUp(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60 * 1000) return 'Just now';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m ago`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}h ago`;
    if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (24 * 60 * 60 * 1000))}d ago`;
    
    return date.toLocaleDateString();
  };

  const getCallIcon = (call: CallRecord) => {
    const isIncoming = call.receiverId._id === userId;
    
    switch (call.status) {
      case 'answered':
        return isIncoming ? <PhoneIncoming className="w-5 h-5 text-green-500" /> : <PhoneOutgoing className="w-5 h-5 text-green-500" />;
      case 'rejected':
      case 'missed':
        return isIncoming ? <PhoneIncoming className="w-5 h-5 text-red-500" /> : <PhoneOutgoing className="w-5 h-5 text-red-500" />;
      case 'cancelled':
        return <PhoneOff className="w-5 h-5 text-gray-500" />;
      default:
        return <Phone className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCallStatusText = (call: CallRecord) => {
    const isIncoming = call.receiverId._id === userId;
    
    switch (call.status) {
      case 'answered':
        return isIncoming ? 'Incoming - Answered' : 'Outgoing - Answered';
      case 'rejected':
        return isIncoming ? 'Incoming - Rejected' : 'Outgoing - Rejected';
      case 'missed':
        return 'Missed Call';
      case 'cancelled':
        return 'Cancelled';
      default:
        return call.status.charAt(0).toUpperCase() + call.status.slice(1);
    }
  };

  const getCallStatusColor = (call: CallRecord) => {
    switch (call.status) {
      case 'answered':
        return 'text-green-600 dark:text-green-400';
      case 'rejected':
      case 'missed':
        return 'text-red-600 dark:text-red-400';
      case 'cancelled':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getOtherParticipant = (call: CallRecord) => {
    return call.callerId._id === userId ? call.receiverId : call.callerId;
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${
      isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'
    } backdrop-blur-sm`}>
      <div className={`w-full max-w-2xl mx-4 h-[80vh] rounded-2xl shadow-2xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col`}>
        
        {/* Header */}
        <div className={`p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Call History
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={cleanupOldCalls}
                disabled={cleaningUp}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  cleaningUp
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : isDarkMode
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
                title="Clean up old calls"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Call List */}
        <div className="flex-1 overflow-y-auto">
          {loading && calls.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : calls.length > 0 ? (
            <div className="p-4 space-y-3">
              {calls.map((call) => {
                const otherParticipant = getOtherParticipant(call);
                return (
                  <div
                    key={call._id}
                    className={`p-4 rounded-lg border transition-colors duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full overflow-hidden ${
                          isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                        }`}>
                          {otherParticipant.avatar && otherParticipant.avatar !== '/default-avatar.svg' ? (
                            <img
                              src={otherParticipant.avatar}
                              alt={otherParticipant.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-lg">👤</span>
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1">
                          {getCallIcon(call)}
                        </div>
                      </div>

                      {/* Call Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-medium truncate ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {otherParticipant.name}
                          </h3>
                          <span className={`text-sm ${getCallStatusColor(call)}`}>
                            {formatDate(call.startTime)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-sm ${getCallStatusColor(call)}`}>
                            {getCallStatusText(call)}
                          </p>
                          {call.duration > 0 && (
                            <span className={`text-sm ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {formatDuration(call.duration)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Phone className={`w-12 h-12 mb-4 ${
                isDarkMode ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <h3 className={`text-lg font-medium mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                No Call History
              </h3>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Your audio call history will appear here
              </p>
            </div>
          )}

          {/* Load More Button */}
          {hasMore && calls.length > 0 && (
            <div className="p-4 text-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
