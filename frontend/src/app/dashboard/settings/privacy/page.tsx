"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Popup from '@/components/Popup';
import { usePrivacy } from '@/contexts/PrivacyContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { PrivacySettings, calculatePrivacyLevel, getPrivacyLevelText } from '@/utils/privacyUtils';

interface PopupState {
  isOpen: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

const PrivacySettingsPage = () => {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const { privacySettings, updatePrivacySettings, loading: contextLoading } = usePrivacy();
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });
  const [localSettings, setLocalSettings] = useState<PrivacySettings>({
    status: 'Online',
    whoCanFollowMe: 'Everyone',
    whoCanMessageMe: 'Everyone',
    whoCanSeeMyFriends: 'Everyone',
    whoCanPostOnMyTimeline: 'People I Follow',
    whoCanSeeMyBirthday: 'Everyone',
    confirmRequestWhenSomeoneFollowsYou: 'No',
    showMyActivities: 'Yes',
    shareMyLocationWithPublic: 'Yes',
    allowSearchEnginesToIndex: 'Yes'
  });

  useEffect(() => {
    // Update local settings when context settings change
    if (privacySettings) {
      setLocalSettings(privacySettings);
    }
  }, [privacySettings]);

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

  const handleSettingChange = (setting: keyof PrivacySettings, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updatePrivacySettings(localSettings);
      showPopup('success', 'Success', 'Privacy settings saved successfully!');
      
      // Get current user ID and navigate to profile page
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const currentUserResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/profile/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (currentUserResponse.ok) {
            const currentUser = await currentUserResponse.json();
            setTimeout(() => {
              router.push(`/dashboard/profile/${currentUser.id}`);
            }, 1500);
          } else {
            // Fallback to "me" if we can't get the user ID
            setTimeout(() => {
              router.push('/dashboard/profile/me');
            }, 1500);
          }
        } else {
          setTimeout(() => {
            router.push('/dashboard/profile/me');
          }, 1500);
        }
      } catch (error) {
        console.error('Error getting current user ID:', error);
        // Fallback to "me" if there's an error
        setTimeout(() => {
          router.push('/dashboard/profile/me');
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      showPopup('error', 'Error', 'Failed to save privacy settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const privacyOptions = [
    {
      key: 'status',
      question: 'Status',
      options: ['Online', 'Offline', 'Away', 'Busy']
    },
    {
      key: 'whoCanFollowMe',
      question: 'Who can follow me ?',
      options: ['Everyone', 'Friends only', 'No one']
    },
    {
      key: 'whoCanMessageMe',
      question: 'Who can message me ?',
      options: ['Everyone', 'Friends only', 'People I Follow', 'No one']
    },
    {
      key: 'whoCanSeeMyFriends',
      question: 'Who can see my friends?',
      options: ['Everyone', 'Friends only', 'Only me']
    },
    {
      key: 'whoCanPostOnMyTimeline',
      question: 'Who can post on my timeline ?',
      options: ['Everyone', 'Friends only', 'People I Follow', 'Only me']
    },
    {
      key: 'whoCanSeeMyBirthday',
      question: 'Who can see my birthday?',
      options: ['Everyone', 'Friends only', 'Only me']
    },
    {
      key: 'confirmRequestWhenSomeoneFollowsYou',
      question: 'Confirm request when someone follows you ?',
      options: ['Yes', 'No']
    },
    {
      key: 'showMyActivities',
      question: 'Show my activities ?',
      options: ['Yes', 'No']
    },
    {
      key: 'shareMyLocationWithPublic',
      question: 'Share my location with public?',
      options: ['Yes', 'No']
    },
    {
      key: 'allowSearchEnginesToIndex',
      question: 'Allow search engines to index my profile and posts?',
      options: ['Yes', 'No']
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">Privacy Setting</h1>
        
        {/* Privacy Level Indicator */}
        {localSettings && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg border border-blue-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-400">Privacy Level</h3>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {getPrivacyLevelText(calculatePrivacyLevel(localSettings))}
              </span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-gray-600 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${calculatePrivacyLevel(localSettings)}%` }}
              ></div>
            </div>
            <p className="text-sm text-blue-700 dark:text-gray-300">
              {calculatePrivacyLevel(localSettings)}% - Your profile is {getPrivacyLevelText(calculatePrivacyLevel(localSettings)).toLowerCase()}
            </p>
          </div>
        )}
        
        <div className="space-y-6">
          {privacyOptions.map((option, index) => (
            <div key={option.key} className="border-b border-gray-200 dark:border-gray-600 pb-4">
              <div className="mb-2">
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  {option.question}
                </label>
                <div className="relative">
                  <select
                    value={localSettings[option.key as keyof PrivacySettings]}
                    onChange={(e) => handleSettingChange(option.key as keyof PrivacySettings, e.target.value)}
                    className="w-full max-w-xs px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-base cursor-pointer rounded-md"
                    style={{ 
                      colorScheme: isDarkMode ? 'dark' : 'light'
                    }}
                  >
                    {option.options.map((optionValue) => (
                      <option 
                        key={optionValue} 
                        value={optionValue}
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {optionValue}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 dark:bg-blue-600 dark:hover:bg-blue-700 dark:disabled:bg-blue-500 text-white px-8 py-3 rounded-md font-medium transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Information Note */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">Privacy Information:</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <li>• These settings control who can interact with you and see your content</li>
            <li>• Changes take effect immediately after saving</li>
            <li>• You can update these settings at any time</li>
            <li>• Some settings may affect your visibility on the platform</li>
          </ul>
        </div>
      </div>

      {/* Popup Component */}
      <Popup popup={popup} onClose={closePopup} />
    </div>
  );
};

export default PrivacySettingsPage;