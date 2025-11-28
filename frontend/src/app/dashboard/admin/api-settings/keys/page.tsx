"use client";

import React, { useState } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

const ManageAPIServerKeys = () => {
  const { isDarkMode } = useDarkMode();
  const [apiId, setApiId] = useState('ed9c8e3880fe5bdf53d77d5d108635e0');
  const [apiSecretKey, setApiSecretKey] = useState('a6285de905c4ae4d26f87a874e029dd8');
  const [serverKey, setServerKey] = useState('a6285de905c4ae4d26f87a874e029dd8');
  const [resettingV1, setResettingV1] = useState(false);
  const [resettingV2, setResettingV2] = useState(false);

  const handleResetV1 = async () => {
    if (!window.confirm('Are you sure you want to reset the API v1 keys? This action cannot be undone.')) {
      return;
    }

    setResettingV1(true);
    // Add API call here
    console.log('Resetting API v1 keys');
    
    // Simulate API call
    setTimeout(() => {
      // Generate new keys (in real app, these would come from the API)
      setApiId('new_' + Math.random().toString(36).substring(2, 15));
      setApiSecretKey('new_' + Math.random().toString(36).substring(2, 15));
      setResettingV1(false);
      alert('API v1 keys reset successfully!');
    }, 1000);
  };

  const handleResetV2 = async () => {
    if (!window.confirm('Are you sure you want to reset the Server Key? This action cannot be undone.')) {
      return;
    }

    setResettingV2(true);
    // Add API call here
    console.log('Resetting Server Key');
    
    // Simulate API call
    setTimeout(() => {
      // Generate new key (in real app, this would come from the API)
      setServerKey('new_' + Math.random().toString(36).substring(2, 15));
      setResettingV2(false);
      alert('Server Key reset successfully!');
    }, 1000);
  };

  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Manage API Server Keys
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
          <span className="text-red-500 font-semibold">Manage API Server Keys</span>
        </div>
      </div>

      {/* Two Panels Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: API Settings (API v1) */}
        <div className={`rounded-lg shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="p-6">
            <h2 className={`text-xl font-semibold mb-4 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              API Settings (API v1)
            </h2>

            {/* Info Banner (Blue) */}
            <div className={`mb-6 p-4 rounded-lg border transition-colors duration-200 ${
              isDarkMode ? 'bg-blue-900/20 border-blue-700 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              <p className="text-sm">
                Use these keys to setup your application.
              </p>
            </div>

            {/* API ID Field */}
            <div className="mb-4">
              <label
                htmlFor="apiId"
                className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                API ID
              </label>
              <input
                type="text"
                id="apiId"
                value={apiId}
                readOnly
                className={`w-full px-4 py-2.5 border rounded-lg transition-colors duration-200 ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-gray-300'
                    : 'border-gray-300 bg-gray-100 text-gray-700'
                }`}
              />
            </div>

            {/* API Secret Key Field */}
            <div className="mb-6">
              <label
                htmlFor="apiSecretKey"
                className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                API Secret Key
              </label>
              <input
                type="text"
                id="apiSecretKey"
                value={apiSecretKey}
                readOnly
                className={`w-full px-4 py-2.5 border rounded-lg transition-colors duration-200 ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-gray-300'
                    : 'border-gray-300 bg-gray-100 text-gray-700'
                }`}
              />
            </div>

            {/* Reset Button */}
            <button
              onClick={handleResetV1}
              disabled={resettingV1}
              className={`w-full px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 font-medium ${
                resettingV1 ? 'opacity-70' : ''
              }`}
            >
              {resettingV1 ? 'Resetting...' : 'RESET KEYS'}
            </button>
          </div>
        </div>

        {/* Right Panel: Server Key (API v2) */}
        <div className={`rounded-lg shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="p-6">
            <h2 className={`text-xl font-semibold mb-4 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Server Key (API v2)
            </h2>

            {/* Info Banner (Blue) */}
            <div className={`mb-6 p-4 rounded-lg border transition-colors duration-200 ${
              isDarkMode ? 'bg-blue-900/20 border-blue-700 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              <p className="text-sm">
                Use this key to setup and access the API endpoints.{' '}
                <a
                  href="#"
                  className={`underline hover:opacity-80 transition-opacity duration-200 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-700'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Documentation link');
                  }}
                >
                  Read Documentation
                </a>
              </p>
            </div>

            {/* Server Key Field */}
            <div className="mb-6">
              <label
                htmlFor="serverKey"
                className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Server Key
              </label>
              <input
                type="text"
                id="serverKey"
                value={serverKey}
                readOnly
                className={`w-full px-4 py-2.5 border rounded-lg transition-colors duration-200 ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-gray-300'
                    : 'border-gray-300 bg-gray-100 text-gray-700'
                }`}
              />
            </div>

            {/* Reset Button */}
            <button
              onClick={handleResetV2}
              disabled={resettingV2}
              className={`w-full px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 font-medium ${
                resettingV2 ? 'opacity-70' : ''
              }`}
            >
              {resettingV2 ? 'Resetting...' : 'RESET SERVER KEY'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAPIServerKeys;



