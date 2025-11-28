"use client";

import React, { useState } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

const AutoGroupJoin = () => {
  const { isDarkMode } = useDarkMode();
  const [groupNames, setGroupNames] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!groupNames.trim()) {
      alert('Please enter at least one group name');
      return;
    }

    setSaving(true);
    // Add API call here
    console.log('Saving auto group join group names:', groupNames);
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      alert('Auto group join settings saved successfully!');
    }, 1000);
  };

  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Auto Group Join
        </h1>
        <div className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </span>
          {' > '}
          Tools
          {' > '}
          <span className="text-red-500 font-semibold">Auto Group Join</span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className={`rounded-lg shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-6">
          <h2 className={`text-2xl font-semibold mb-4 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Auto Group Join
          </h2>

          {/* Info Banner (Blue) */}
          <div className={`mb-6 p-4 rounded-lg border transition-colors duration-200 ${
            isDarkMode ? 'bg-blue-900/20 border-blue-700 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <p className="text-sm">
              When a user creates a new account, choose which group you would like to get auto joined.
            </p>
          </div>

          {/* Group Name Input Field */}
          <div className="mb-6">
            <label
              htmlFor="groupNames"
              className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Group name(s), sperated by a comma (,)
            </label>
            <input
              type="text"
              id="groupNames"
              value={groupNames}
              onChange={(e) => setGroupNames(e.target.value)}
              placeholder="group1, group2, group3"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Warning Banner (Yellow) */}
          <div className={`mb-6 p-4 rounded-lg border transition-colors duration-200 ${
            isDarkMode ? 'bg-yellow-900/20 border-yellow-700 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-yellow-800'
          }`}>
            <p className="text-sm">
              This process might take some time, you can check for your site changes after few minutes.
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={saving || !groupNames.trim()}
              className={`px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 font-medium ${
                saving ? 'opacity-70' : ''
              }`}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoGroupJoin;



