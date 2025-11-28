"use client";

import React, { useState } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

const PushNotificationsSettings = () => {
  const { isDarkMode } = useDarkMode();
  
  // Feature toggles state
  const [features, setFeatures] = useState({
    pushNotificationsSystem: false,
    androidPushMessages: false,
    iosPushMessages: false,
    androidPushNativeSite: false,
    iosPushNativeSite: false,
    webPushNotifications: false,
  });

  // API Keys state
  const [apiKeys, setApiKeys] = useState({
    androidGlobal: { appId: '', restApiKey: '' },
    iosGlobal: { appId: '', restApiKey: '' },
    webGlobal: { appId: '', restApiKey: '' },
    androidMessenger: { appId: '', restApiKey: '' },
    iosMessenger: { appId: '', restApiKey: '' },
  });

  const [saving, setSaving] = useState(false);

  const toggleFeature = (featureName: keyof typeof features) => {
    setFeatures(prev => ({
      ...prev,
      [featureName]: !prev[featureName],
    }));
  };

  const handleApiKeyChange = (section: keyof typeof apiKeys, field: 'appId' | 'restApiKey', value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Add API call here
    console.log('Saving push notification settings:', { features, apiKeys });
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      alert('Push notification settings saved successfully!');
    }, 1000);
  };

  const featureList = [
    {
      key: 'pushNotificationsSystem' as const,
      title: 'Push Notifications System',
      description: 'Enable this feature and users will get notificed on their browser / app while the app is closed.',
    },
    {
      key: 'androidPushMessages' as const,
      title: 'Android Push Messages',
      description: 'Enable this feature for android devices. (Push User Messages Only)',
    },
    {
      key: 'iosPushMessages' as const,
      title: 'IOS Push Messages (Push User Messages)',
      description: 'Enable this feature for IOS devices. (Push User Messages Only)',
    },
    {
      key: 'androidPushNativeSite' as const,
      title: 'Android Push Native Site Notifications',
      description: 'Enable this feature for Android devices. (Likes, Followed, Wonder, Comment etc)',
    },
    {
      key: 'iosPushNativeSite' as const,
      title: 'IOS Push Native Site Notifications',
      description: 'Enable this feature for IOS devices (Likes, Followed, Wonder, Comment etc)',
    },
    {
      key: 'webPushNotifications' as const,
      title: 'Web Push Notifications',
      description: 'The user will get notified on web browsers, (Chrome, Firefox etc..) SSL required',
    },
  ];

  const apiKeySections = [
    {
      key: 'androidGlobal' as const,
      title: 'Android Global Notifications Settings (Likes, Dislikes, Comments, Follow etc.)',
    },
    {
      key: 'iosGlobal' as const,
      title: 'IOS Global Notifications Settings (Likes, Dislikes, Comments, Follow etc.)',
    },
    {
      key: 'webGlobal' as const,
      title: 'Web Global Notifications Settings (Likes, Dislikes, Comments, Follow etc.)',
    },
    {
      key: 'androidMessenger' as const,
      title: 'Android Messenger & Chat Push Notifications Settings',
    },
    {
      key: 'iosMessenger' as const,
      title: 'IOS Messenger & Chat Push Notifications Settings',
    },
  ];

  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Push Notifications Settings
        </h1>
        <div className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </span>
          {' > '}
          API Settings
          {' > '}
          <span className="text-red-500 font-semibold">Push Notifications Settings</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Section: Features */}
        <div className="space-y-6">
          <div className={`rounded-lg shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="p-6">
              <h2 className={`text-2xl font-semibold mb-4 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Push Notifications Settings
              </h2>

              {/* Info Banner */}
              <div className={`mb-6 p-4 rounded-lg border transition-colors duration-200 ${
                isDarkMode ? 'bg-blue-900/20 border-blue-700 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}>
                <p className="text-sm">
                  This system allows your script to send push notifications to any application who uses our API.{' '}
                  <a
                    href="#"
                    className={`underline hover:opacity-80 transition-opacity duration-200 ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-700'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Registration link');
                    }}
                  >
                    To get started, Register Here.
                  </a>
                </p>
              </div>

              {/* Feature List */}
              <div className="space-y-4">
                {featureList.map((feature) => (
                  <div
                    key={feature.key}
                    className={`p-4 border rounded-lg transition-colors duration-200 ${
                      isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-sm font-semibold mb-1 transition-colors duration-200 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {feature.title}
                        </h3>
                        <p className={`text-xs transition-colors duration-200 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {feature.description}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleFeature(feature.key)}
                        className={`ml-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                          features[feature.key]
                            ? isDarkMode
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                            : isDarkMode
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                      >
                        {features[feature.key] ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Help Link */}
              <div className="mt-6">
                <a
                  href="#"
                  className={`text-sm transition-colors duration-200 ${
                    isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Documentation link');
                  }}
                >
                  Need Help? Read The Documentation.
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: API Keys */}
        <div className="space-y-6">
          {apiKeySections.map((section) => (
            <div
              key={section.key}
              className={`rounded-lg shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              <div className="p-6">
                <h3 className={`text-lg font-semibold mb-4 transition-colors duration-200 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {section.title}
                </h3>

                <div className="space-y-4">
                  {/* OneSignal APP ID */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      OneSignal APP ID
                    </label>
                    <input
                      type="text"
                      value={apiKeys[section.key].appId}
                      onChange={(e) => handleApiKeyChange(section.key, 'appId', e.target.value)}
                      placeholder="Enter OneSignal APP ID"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                        isDarkMode
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>

                  {/* REST API Key */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      REST API Key
                    </label>
                    <input
                      type="text"
                      value={apiKeys[section.key].restApiKey}
                      onChange={(e) => handleApiKeyChange(section.key, 'restApiKey', e.target.value)}
                      placeholder="Enter REST API Key"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                        isDarkMode
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 font-medium ${
            saving ? 'opacity-70' : ''
          }`}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default PushNotificationsSettings;



