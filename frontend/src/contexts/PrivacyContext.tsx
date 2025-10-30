"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PrivacySettings, ProfileSettings } from '@/utils/privacyUtils';

interface PrivacyContextType {
  privacySettings: PrivacySettings | null;
  profileSettings: ProfileSettings | null;
  loading: boolean;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => Promise<void>;
  updateProfileSettings: (settings: Partial<ProfileSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export const usePrivacy = () => {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
};

interface PrivacyProviderProps {
  children: ReactNode;
}

export const PrivacyProvider: React.FC<PrivacyProviderProps> = ({ children }) => {
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [profileSettings, setProfileSettings] = useState<ProfileSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPrivacySettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Fallback to localStorage
        const savedSettings = localStorage.getItem('privacySettings');
        if (savedSettings) {
          setPrivacySettings(JSON.parse(savedSettings));
        }
        return;
      }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/privacy/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setPrivacySettings(result.data);
        localStorage.setItem('privacySettings', JSON.stringify(result.data));
      } else {
        // Fallback to localStorage
        const savedSettings = localStorage.getItem('privacySettings');
        if (savedSettings) {
          setPrivacySettings(JSON.parse(savedSettings));
        }
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
      // Fallback to localStorage
      const savedSettings = localStorage.getItem('privacySettings');
      if (savedSettings) {
        setPrivacySettings(JSON.parse(savedSettings));
      }
    }
  };

  const loadProfileSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Fallback to localStorage
        const savedSettings = localStorage.getItem('profileSettings');
        if (savedSettings) {
          setProfileSettings(JSON.parse(savedSettings));
        }
        return;
      }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/profile/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        
        // Map user data to profile settings format
        const nameParts = (userData.name || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const mappedSettings: ProfileSettings = {
          firstName,
          lastName,
          aboutMe: userData.bio || '',
          location: userData.location || '',
          website: userData.website || '',
          relationship: 'None', // Not in user model yet
          school: '', // Not in user model yet
          schoolCompleted: false, // Not in user model yet
          workingAt: userData.workplace || '',
          companyWebsite: '' // Not in user model yet
        };
        
        setProfileSettings(mappedSettings);
        localStorage.setItem('profileSettings', JSON.stringify(mappedSettings));
      } else {
        // Fallback to localStorage
        const savedSettings = localStorage.getItem('profileSettings');
        if (savedSettings) {
          setProfileSettings(JSON.parse(savedSettings));
        }
      }
    } catch (error) {
      console.error('Error loading profile settings:', error);
      // Fallback to localStorage
      const savedSettings = localStorage.getItem('profileSettings');
      if (savedSettings) {
        setProfileSettings(JSON.parse(savedSettings));
      }
    }
  };

  const refreshSettings = async () => {
    setLoading(true);
    await Promise.all([loadPrivacySettings(), loadProfileSettings()]);
    setLoading(false);
  };

  const updatePrivacySettings = async (newSettings: Partial<PrivacySettings>) => {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/privacy/settings`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newSettings)
        });

        if (response.ok) {
          const result = await response.json();
          const updatedSettings = { ...privacySettings, ...result.data };
          setPrivacySettings(updatedSettings);
          localStorage.setItem('privacySettings', JSON.stringify(updatedSettings));
          
          // Dispatch event to notify other components
          window.dispatchEvent(new CustomEvent('privacySettingsUpdated'));
        } else {
          throw new Error('Failed to update privacy settings');
        }
      } else {
        // Fallback to localStorage
        if (privacySettings) {
          const updatedSettings = { ...privacySettings, ...newSettings };
          setPrivacySettings(updatedSettings);
          localStorage.setItem('privacySettings', JSON.stringify(updatedSettings));
        } else {
          // If no existing settings, create default settings with new values
          const defaultSettings: PrivacySettings = {
            status: 'Online',
            whoCanFollowMe: 'Everyone',
            whoCanMessageMe: 'Everyone',
            whoCanSeeMyFriends: 'Everyone',
            whoCanPostOnMyTimeline: 'People I Follow',
            whoCanSeeMyBirthday: 'Everyone',
            confirmRequestWhenSomeoneFollowsYou: 'No',
            showMyActivities: 'Yes',
            shareMyLocationWithPublic: 'Yes',
            allowSearchEnginesToIndex: 'Yes',
            ...newSettings
          };
          setPrivacySettings(defaultSettings);
          localStorage.setItem('privacySettings', JSON.stringify(defaultSettings));
        }
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('privacySettingsUpdated'));
      }
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      throw error;
    }
  };

  const updateProfileSettings = async (newSettings: Partial<ProfileSettings>) => {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Map the settings to the correct API format
        const profileData = {
          name: `${newSettings.firstName || profileSettings?.firstName || ''} ${newSettings.lastName || profileSettings?.lastName || ''}`.trim(),
          bio: newSettings.aboutMe || profileSettings?.aboutMe || '',
          location: newSettings.location || profileSettings?.location || '',
          website: newSettings.website || profileSettings?.website || '',
          workplace: newSettings.workingAt || profileSettings?.workingAt || '',
        };

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/profile/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(profileData)
        });

        if (response.ok) {
          if (profileSettings) {
            const updatedSettings = { ...profileSettings, ...newSettings };
            setProfileSettings(updatedSettings);
            localStorage.setItem('profileSettings', JSON.stringify(updatedSettings));
          }
          
          // Dispatch event to notify other components
          window.dispatchEvent(new CustomEvent('profileSettingsUpdated'));
        } else {
          throw new Error('Failed to update profile settings');
        }
      } else {
        // Fallback to localStorage
        if (profileSettings) {
          const updatedSettings = { ...profileSettings, ...newSettings };
          setProfileSettings(updatedSettings);
          localStorage.setItem('profileSettings', JSON.stringify(updatedSettings));
        } else {
          // If no existing settings, create default settings with new values
          const defaultSettings: ProfileSettings = {
            firstName: '',
            lastName: '',
            aboutMe: '',
            location: '',
            website: '',
            relationship: 'None',
            school: '',
            schoolCompleted: false,
            workingAt: '',
            companyWebsite: '',
            ...newSettings
          };
          setProfileSettings(defaultSettings);
          localStorage.setItem('profileSettings', JSON.stringify(defaultSettings));
        }
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('profileSettingsUpdated'));
      }
    } catch (error) {
      console.error('Error updating profile settings:', error);
      throw error;
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  // Listen for settings updates from other components
  useEffect(() => {
    const handlePrivacySettingsUpdated = () => {
      loadPrivacySettings();
    };

    const handleProfileSettingsUpdated = () => {
      loadProfileSettings();
    };

    window.addEventListener('privacySettingsUpdated', handlePrivacySettingsUpdated);
    window.addEventListener('profileSettingsUpdated', handleProfileSettingsUpdated);

    return () => {
      window.removeEventListener('privacySettingsUpdated', handlePrivacySettingsUpdated);
      window.removeEventListener('profileSettingsUpdated', handleProfileSettingsUpdated);
    };
  }, []);

  const value: PrivacyContextType = {
    privacySettings,
    profileSettings,
    loading,
    updatePrivacySettings,
    updateProfileSettings,
    refreshSettings
  };

  return (
    <PrivacyContext.Provider value={value}>
      {children}
    </PrivacyContext.Provider>
  );
};
