"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Popup from '@/components/Popup';
import { usePrivacy } from '@/contexts/PrivacyContext';
import { ProfileSettings } from '@/utils/privacyUtils';

interface PopupState {
  isOpen: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

const ProfileSettingsPage = () => {
  const router = useRouter();
  const { profileSettings, updateProfileSettings, loading: contextLoading } = usePrivacy();
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });
  const [localSettings, setLocalSettings] = useState<ProfileSettings>({
    firstName: 'Hina Sadaf -BSCS-2nd-029',
    lastName: '',
    aboutMe: '',
    location: '',
    website: '',
    relationship: 'None',
    school: '',
    schoolCompleted: false,
    workingAt: '',
    companyWebsite: ''
  });

  useEffect(() => {
    // Update local settings when context settings change
    if (profileSettings) {
      setLocalSettings(profileSettings);
    }
  }, [profileSettings]);

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

  const handleInputChange = (field: keyof ProfileSettings, value: string | boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfileSettings(localSettings);
      showPopup('success', 'Success', 'Profile updated successfully!');
      
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
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile. Please try again.';
      showPopup('error', 'Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const relationshipOptions = [
    'None',
    'Single',
    'In a relationship',
    'Engaged',
    'Married',
    'It\'s complicated',
    'In an open relationship',
    'Widowed',
    'Separated',
    'Divorced'
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">Profile Setting</h1>
        
        <div className="space-y-6">
          {/* First Name and Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First name
              </label>
              <input
                type="text"
                value={localSettings.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last name
              </label>
              <input
                type="text"
                value={localSettings.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              />
            </div>
          </div>

          {/* About Me */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              About me
            </label>
            <textarea
              value={localSettings.aboutMe}
              onChange={(e) => handleInputChange('aboutMe', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700 resize-vertical"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location
            </label>
            <input
              type="text"
              value={localSettings.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
            />
          </div>

          {/* Website and Relationship */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website
              </label>
              <input
                type="url"
                value={localSettings.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Relationship
              </label>
              <select
                value={localSettings.relationship}
                onChange={(e) => handleInputChange('relationship', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              >
                {relationshipOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* School with Completed Checkbox */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              School
            </label>
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={localSettings.school}
                onChange={(e) => handleInputChange('school', e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="schoolCompleted"
                  checked={localSettings.schoolCompleted}
                  onChange={(e) => handleInputChange('schoolCompleted', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 dark:bg-gray-700"
                />
                <label htmlFor="schoolCompleted" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Completed
                </label>
              </div>
            </div>
          </div>

          {/* Working at and Company Website */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Working at
              </label>
              <input
                type="text"
                value={localSettings.workingAt}
                onChange={(e) => handleInputChange('workingAt', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company website
              </label>
              <input
                type="url"
                value={localSettings.companyWebsite}
                onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              />
            </div>
          </div>
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
      </div>

      {/* Popup Component */}
      <Popup popup={popup} onClose={closePopup} />
    </div>
  );
};

export default ProfileSettingsPage;