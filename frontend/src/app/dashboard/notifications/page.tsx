"use client";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Popup from '@/components/Popup';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  relatedPostId?: any;
  relatedUserId?: any;
  relatedGroupId?: any;
  relatedPageId?: any;
}

interface NotificationSettings {
  someonelikedMyPosts: boolean;
  someoneCommentedOnMyPosts: boolean;
  someoneSharedOnMyPosts: boolean;
  someoneFollowedMe: boolean;
  someoneLikedMyPages: boolean;
  someoneVisitedMyProfile: boolean;
  someoneMentionedMe: boolean;
  someoneJoinedMyGroups: boolean;
  someoneAcceptedMyFriendRequest: boolean;
  someonePostedOnMyTimeline: boolean;
}

interface PopupState {
  isOpen: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

const NotificationsPage = () => {
  const { isDarkMode } = useDarkMode();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('notifications');
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    someonelikedMyPosts: true,
    someoneCommentedOnMyPosts: true,
    someoneSharedOnMyPosts: true,
    someoneFollowedMe: true,
    someoneLikedMyPages: true,
    someoneVisitedMyProfile: true,
    someoneMentionedMe: true,
    someoneJoinedMyGroups: true,
    someoneAcceptedMyFriendRequest: true,
    someonePostedOnMyTimeline: true,
  });
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  useEffect(() => {
    fetchNotifications();
    fetchNotificationSettings();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ No token found');
        return;
      }

      console.log('🔔 Fetching notifications from:', `${API_URL}/api/notifications`);
      
      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔔 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔔 Notifications API response:', data);
        const notifications = data.data?.notifications || data.notifications || [];
        console.log('📱 Setting notifications:', notifications);
        setNotifications(notifications);
        
        // Dispatch event to update notification count in dashboard
        window.dispatchEvent(new CustomEvent('notificationsUpdated'));
      } else {
        console.error('❌ Failed to fetch notifications:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error details:', errorData);
        
        // Show user-friendly error message
        setPopup({
          isOpen: true,
          type: 'error',
          title: 'Failed to Load Notifications',
          message: 'Unable to fetch notifications. Please try again later.'
        });
      }
    } catch (error) {
      console.error('❌ Network error fetching notifications:', error);
      
      // Show user-friendly error message
      setPopup({
        isOpen: true,
        type: 'error',
        title: 'Network Error',
        message: 'Unable to connect to the server. Please check your internet connection.'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

  const response = await fetch(`${API_URL}/api/notifications/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotificationSettings(data.data || {});
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

  const response = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, isRead: true }
              : notification
          )
        );
        
        // Dispatch event to update notification count in dashboard
        window.dispatchEvent(new CustomEvent('notificationsUpdated'));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

  const response = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        );
        showPopup('success', 'Success', 'All notifications marked as read');
        
        // Dispatch event to update notification count in dashboard
        window.dispatchEvent(new CustomEvent('notificationsUpdated'));
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

  const response = await fetch(`${API_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Remove from local state
        setNotifications(prev => prev.filter(notification => notification._id !== notificationId));
        showPopup('success', 'Success', 'Notification deleted');
        
        // Dispatch event to update notification count in dashboard
        window.dispatchEvent(new CustomEvent('notificationsUpdated'));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleSettingChange = (setting: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const saveNotificationSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

  const response = await fetch(`${API_URL}/api/notifications/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(notificationSettings)
      });

      if (response.ok) {
        showPopup('success', 'Success', 'Notification settings saved successfully!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      showPopup('error', 'Error', 'Failed to save notification settings');
    } finally {
      setLoading(false);
    }
  };

  const showPopup = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setPopup({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closePopup = () => {
    setPopup(prev => ({ ...prev, isOpen: false }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return '❤️';
      case 'comment': return '💬';
      case 'follow': return '👤';
      case 'mention': return '📢';
      case 'share': return '🔄';
      default: return '🔔';
    }
  };

  const notificationOptions = [
    { key: 'someonelikedMyPosts', label: 'Someone liked my posts' },
    { key: 'someoneCommentedOnMyPosts', label: 'Someone commented on my posts' },
    { key: 'someoneSharedOnMyPosts', label: 'Someone shared on my posts' },
    { key: 'someoneFollowedMe', label: 'Someone followed me' },
    { key: 'someoneLikedMyPages', label: 'Someone liked my pages' },
    { key: 'someoneVisitedMyProfile', label: 'Someone visited my profile' },
    { key: 'someoneMentionedMe', label: 'Someone mentioned me' },
    { key: 'someoneJoinedMyGroups', label: 'Someone joined my groups' },
    { key: 'someoneAcceptedMyFriendRequest', label: 'Someone accepted my friend/follow request' },
    { key: 'someonePostedOnMyTimeline', label: 'Someone posted on my timeline' },
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className={`rounded-lg shadow-sm border transition-colors duration-200 ${
        isDarkMode 
          ? 'bg-dark-800 border-dark-700' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b transition-colors duration-200 ${
          isDarkMode ? 'border-dark-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <h1 className={`text-2xl font-semibold transition-colors duration-200 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Notifications</h1>
            <div className="flex items-center space-x-4">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => fetchNotifications()}
                className={`text-sm transition-colors duration-200 ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex border-b transition-colors duration-200 ${
          isDarkMode ? 'border-dark-700' : 'border-gray-200'
        }`}>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'notifications'
                ? 'border-blue-500 text-blue-600'
                : `border-transparent ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-gray-300' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`
            }`}
          >
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : `border-transparent ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-gray-300' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`
            }`}
          >
            Settings
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'notifications' ? (
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-200 ${
                    isDarkMode ? 'bg-dark-700' : 'bg-gray-100'
                  }`}>
                    <span className="text-2xl">🔔</span>
                  </div>
                  <h3 className={`text-lg font-medium mb-2 transition-colors duration-200 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>No notifications</h3>
                  <p className={`transition-colors duration-200 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>You're all caught up!</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 rounded-lg border transition-colors duration-200 ${
                      notification.isRead 
                        ? (isDarkMode ? 'bg-dark-700 border-dark-600' : 'bg-gray-50 border-gray-200')
                        : (isDarkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200')
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                        <div className="flex-1">
                          <h4 className={`font-medium transition-colors duration-200 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>{notification.title}</h4>
                          <p className={`text-sm mt-1 transition-colors duration-200 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>{notification.message}</p>
                          <p className={`text-xs mt-2 transition-colors duration-200 ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-500'
                          }`}>{formatDate(notification.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Mark read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification._id)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-medium mb-4 transition-colors duration-200 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Notify me when</h3>
                
                <div className="space-y-4">
                  {notificationOptions.map((option) => (
                    <div key={option.key} className="flex items-center">
                      <div className="relative">
                        <input
                          type="checkbox"
                          id={option.key}
                          checked={notificationSettings?.[option.key as keyof NotificationSettings] || false}
                          onChange={(e) => handleSettingChange(option.key as keyof NotificationSettings, e.target.checked)}
                          className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        {notificationSettings?.[option.key as keyof NotificationSettings] && (
                          <svg
                            className="absolute inset-0 h-5 w-5 text-blue-600 pointer-events-none"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <label 
                        htmlFor={option.key}
                        className={`ml-3 text-sm cursor-pointer transition-colors duration-200 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={saveNotificationSettings}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white px-8 py-3 rounded-md font-medium transition-colors duration-200 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Popup Component */}
      <Popup popup={popup} onClose={closePopup} />
    </div>
  );
};

export default NotificationsPage; 
