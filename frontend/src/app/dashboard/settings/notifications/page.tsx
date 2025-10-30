"use client";
import React, { useState, useEffect } from 'react';
import Popup from '@/components/Popup';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useSystemThemeOverride } from '@/hooks/useSystemThemeOverride';

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
  notificationSound: boolean;
}

interface PopupState {
  isOpen: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

const NotificationSettingsPage = () => {
  // Ensure system dark mode has no effect - especially for mobile systems
  useSystemThemeOverride();
  
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState('notification');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });
  const [settings, setSettings] = useState<NotificationSettings>({
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
    notificationSound: true,
  });

  useEffect(() => {
    // Load notification settings from backend API
    const loadSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // Fallback to localStorage if no token
          const savedSettings = localStorage.getItem('notificationSettings');
          if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
          }
          setInitialLoading(false);
          return;
        }

        const response = await fetch(process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com/api/notifications/settings', { 
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          setSettings(result.data);
          // Also save to localStorage as backup
          localStorage.setItem('notificationSettings', JSON.stringify(result.data));
        } else {
          // Fallback to localStorage if API fails
          const savedSettings = localStorage.getItem('notificationSettings');
          if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
          }
        }
      } catch (error) {
        console.error('Error fetching notification settings:', error);
        // Fallback to localStorage if network error
        const savedSettings = localStorage.getItem('notificationSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadSettings();
  }, []);

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

  const handleSettingChange = (setting: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Try backend API first
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com/api/notifications/settings', { 
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(settings)
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Notification settings saved:', result);
          
          // Update settings with backend data
          setSettings(result.data);
          localStorage.setItem('notificationSettings', JSON.stringify(result.data));
          
          showPopup('success', 'Success', 'Notification settings saved successfully!');
        } else {
          // Fallback to localStorage if API fails
          throw new Error('API failed, using localStorage');
        }
      } else {
        // Fallback to localStorage if no token
        throw new Error('No token, using localStorage');
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      
      // Fallback to localStorage
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Save to localStorage (replace with actual API call)
        localStorage.setItem('notificationSettings', JSON.stringify(settings));
        
        console.log('Notification settings saved (local):', settings);
        showPopup('success', 'Success', 'Notification settings saved successfully! (Saved locally)');
      } catch (localError) {
        console.error('Error in local save:', localError);
        showPopup('error', 'Error', 'Failed to save settings. Please try again.');
      }
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className={`rounded-lg shadow-sm border p-6 transition-colors duration-200 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <h1 className={`text-2xl font-semibold mb-6 transition-colors duration-200 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>Notification Settings</h1>
        
        {initialLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className={`ml-3 transition-colors duration-200 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Loading settings...</span>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className={`flex mb-6 border-b transition-colors duration-200 ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => setActiveTab('notification')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'notification'
                    ? 'border-blue-500 text-blue-600'
                    : isDarkMode 
                      ? 'border-transparent text-gray-400 hover:text-gray-200'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Notification Settings
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ml-6 ${
                  activeTab === 'email'
                    ? 'border-blue-500 text-blue-600'
                    : isDarkMode 
                      ? 'border-transparent text-gray-400 hover:text-gray-200'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Email notification
              </button>
            </div>

            {/* Content */}
            {activeTab === 'notification' ? (
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
                            checked={settings?.[option.key as keyof NotificationSettings] || false}
                            onChange={(e) => handleSettingChange(option.key as keyof NotificationSettings, e.target.checked)}
                            className={`h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-colors duration-200 ${
                              isDarkMode ? 'border-gray-600' : 'border-gray-300'
                            }`}
                          />
                          {settings?.[option.key as keyof NotificationSettings] && (
                            <svg
                              className="absolute inset-0 h-5 w-5 text-blue-600 dark:text-blue-400 pointer-events-none"
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
                            isDarkMode ? 'text-gray-200' : 'text-gray-700'
                          }`}
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notification Sound Toggle */}
                <div className={`border-t pt-6 transition-colors duration-200 ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <h3 className={`text-lg font-medium mb-4 transition-colors duration-200 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="relative">
                          <input
                            type="checkbox"
                            id="notificationSound"
                            checked={settings?.notificationSound || false}
                            onChange={(e) => handleSettingChange('notificationSound', e.target.checked)}
                            className={`h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-colors duration-200 ${
                              isDarkMode ? 'border-gray-600' : 'border-gray-300'
                            }`}
                          />
                          {settings?.notificationSound && (
                            <svg
                              className="absolute inset-0 h-5 w-5 text-blue-600 dark:text-blue-400 pointer-events-none"
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
                          htmlFor="notificationSound"
                          className={`ml-3 text-sm cursor-pointer transition-colors duration-200 ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-700'
                          }`}
                        >
                          Play notification sound
                        </label>
                      </div>
                      <button
                        onClick={() => {
                          if (settings?.notificationSound) {
                            // Test the notification sound
                            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                            const oscillator = audioContext.createOscillator();
                            const gainNode = audioContext.createGain();
                            oscillator.connect(gainNode);
                            gainNode.connect(audioContext.destination);
                            const now = audioContext.currentTime;
                            oscillator.frequency.setValueAtTime(800, now);
                            gainNode.gain.setValueAtTime(0, now);
                            gainNode.gain.linearRampToValueAtTime(0.1, now + 0.05);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                            oscillator.start(now);
                            oscillator.stop(now + 0.5);
                          }
                        }}
                        disabled={!settings?.notificationSound}
                        className={`px-3 py-1 text-xs rounded-md transition-colors duration-200 ${
                          isDarkMode 
                            ? 'bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 text-gray-200'
                            : 'bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-600'
                        }`}
                      >
                        Test
                      </button>
                    </div>
                    <p className={`text-sm ml-8 transition-colors duration-200 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Play a sound when you receive new notifications
                    </p>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white px-8 py-3 rounded-md font-medium transition-colors duration-200 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center py-12">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-200 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                    <svg className={`w-8 h-8 transition-colors duration-200 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className={`text-lg font-medium mb-2 transition-colors duration-200 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Email Notifications</h3>
                  <p className={`transition-colors duration-200 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Email notification settings will be implemented here.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Popup Component */}
      <Popup popup={popup} onClose={closePopup} />
    </div>
  );
};

export default NotificationSettingsPage;