"use client";
import React, { useState, useEffect } from 'react';
import Popup from '@/components/Popup';

interface SocialLinks {
  facebook: string;
  twitter: string;
  vkontakte: string;
  linkedin: string;
  instagram: string;
  youtube: string;
}

interface PopupState {
  isOpen: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

const SocialLinksPage = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    facebook: '',
    twitter: '',
    vkontakte: '',
    linkedin: '',
    instagram: '',
    youtube: ''
  });

  useEffect(() => {
    // Load social links from API
    const loadSocialLinks = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          showPopup('error', 'Authentication Error', 'Please log in to manage your social links.');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/social-links`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Social links loaded:', data);
          setSocialLinks(data);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to load social links:', errorData);
          showPopup('error', 'Load Failed', errorData.message || 'Failed to load social links. Please try again.');
        }
      } catch (error) {
        console.error('Error loading social links:', error);
        showPopup('error', 'Network Error', 'Failed to connect to server. Please check your internet connection.');
      } finally {
        setLoading(false);
      }
    };
    
    loadSocialLinks();
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

  const handleInputChange = (platform: keyof SocialLinks, value: string) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showPopup('error', 'Authentication Error', 'Please log in to save social links.');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/social-links`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(socialLinks)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Social links saved:', data);
        showPopup('success', 'Success', 'Social links saved successfully!');
        
        // Dispatch event to refresh profile
        window.dispatchEvent(new CustomEvent('profileUpdated'));
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to save social links:', errorData);
        showPopup('error', 'Save Failed', errorData.message || 'Failed to save social links. Please try again.');
      }
    } catch (error) {
      console.error('Error saving social links:', error);
      showPopup('error', 'Network Error', 'Failed to connect to server. Please check your internet connection.');
    } finally {
      setSaving(false);
    }
  };

  const socialPlatforms = [
    { key: 'facebook', placeholder: 'Facebook Username', icon: '📘' },
    { key: 'twitter', placeholder: 'Twitter Username', icon: '🐦' },
    { key: 'vkontakte', placeholder: 'Vkontakte Username', icon: '💙' },
    { key: 'linkedin', placeholder: 'LinkedIn Username', icon: '💼' },
    { key: 'instagram', placeholder: 'Instagram Username', icon: '📷' },
    { key: 'youtube', placeholder: 'YouTube Username', icon: '📺' }
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading social links...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">Social Links</h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Add your social media usernames to connect with others and build your network.
        </p>
        
        {/* Social Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {socialPlatforms.map((platform) => (
            <div key={platform.key} className="relative">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{platform.icon}</span>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {platform.key}
                </label>
              </div>
              <input
                type="text"
                value={socialLinks[platform.key as keyof SocialLinks]}
                onChange={(e) => handleInputChange(platform.key as keyof SocialLinks, e.target.value)}
                placeholder={platform.placeholder}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700"
              />
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:bg-blue-600 dark:hover:bg-blue-700 dark:disabled:bg-blue-500 text-white px-8 py-3 rounded-md font-medium transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Social Links'}
          </button>
        </div>
      </div>

      {/* Popup Component */}
      <Popup popup={popup} onClose={closePopup} />
    </div>
  );
};

export default SocialLinksPage;