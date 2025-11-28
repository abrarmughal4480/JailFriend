"use client";

import React, { useState } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

const FakeUserGenerator = () => {
  const { isDarkMode } = useDarkMode();
  const [userCount, setUserCount] = useState('10');
  const [password, setPassword] = useState('');
  const [createRandomAvatar, setCreateRandomAvatar] = useState('no');
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleGenerate = async () => {
    const count = parseInt(userCount);
    if (isNaN(count) || count < 10) {
      alert('Minimum users required are 10');
      return;
    }

    if (!window.confirm(`Are you sure you want to generate ${count} fake users?`)) {
      return;
    }

    setGenerating(true);
    // Add API call here
    console.log('Generating fake users:', {
      count,
      password: password || '123456789',
      createRandomAvatar: createRandomAvatar === 'yes',
    });
    
    // Simulate API call
    setTimeout(() => {
      setGenerating(false);
      alert('Fake users generated successfully! This process might take some time, you can check for your site changes after few minutes.');
    }, 2000);
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete all fake users? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    // Add API call here
    console.log('Deleting all fake users');
    
    // Simulate API call
    setTimeout(() => {
      setDeleting(false);
      alert('All fake users deleted successfully!');
    }, 2000);
  };

  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Fake User Generator
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
          <span className="text-red-500 font-semibold">Fake User Generator</span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className={`rounded-lg shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-6">
          <h2 className={`text-2xl font-semibold mb-4 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Fake User Generator
          </h2>

          {/* Info Banner (Blue) */}
          <div className={`mb-6 p-4 rounded-lg border transition-colors duration-200 ${
            isDarkMode ? 'bg-blue-900/20 border-blue-700 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <p className="text-sm">
              Generate unlimited amount of fake users.
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* User Count Field */}
            <div>
              <label
                htmlFor="userCount"
                className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                How many users you want to generate?
              </label>
              <input
                type="number"
                id="userCount"
                value={userCount}
                onChange={(e) => setUserCount(e.target.value)}
                min="10"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
              />
              <p className={`mt-1.5 text-xs transition-colors duration-200 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Minumum users required are 10
              </p>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave empty for default password"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
              />
              <p className={`mt-1.5 text-xs transition-colors duration-200 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Choose the password that will be used for all users, default: 123456789
              </p>
            </div>

            {/* Random Avatar Radio Buttons */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Create Random Avatar?
              </label>
              <div className="flex items-center gap-6 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="createRandomAvatar"
                    value="yes"
                    checked={createRandomAvatar === 'yes'}
                    onChange={(e) => setCreateRandomAvatar(e.target.value)}
                    className={`w-4 h-4 transition-colors duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-red-600 focus:ring-red-500'
                        : 'bg-white border-gray-300 text-red-600 focus:ring-red-500'
                    }`}
                  />
                  <span className={`text-sm transition-colors duration-200 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Yes
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="createRandomAvatar"
                    value="no"
                    checked={createRandomAvatar === 'no'}
                    onChange={(e) => setCreateRandomAvatar(e.target.value)}
                    className={`w-4 h-4 transition-colors duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-red-600 focus:ring-red-500'
                        : 'bg-white border-gray-300 text-red-600 focus:ring-red-500'
                    }`}
                  />
                  <span className={`text-sm transition-colors duration-200 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    No
                  </span>
                </label>
              </div>
              <p className={`mt-3 text-sm transition-colors duration-200 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                If avatar is enabled, you might see dublicated avatars, avatars are generated randomly. This process might take some time, you can check for your site changes after few minutes.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={handleGenerate}
              disabled={generating || parseInt(userCount) < 10}
              className={`px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 font-medium ${
                generating ? 'opacity-70' : ''
              }`}
            >
              {generating ? 'Generating...' : 'Generate Fake Data'}
            </button>
            <button
              onClick={handleDeleteAll}
              disabled={deleting}
              className={`px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 font-medium ${
                deleting ? 'opacity-70' : ''
              }`}
            >
              {deleting ? 'Deleting...' : 'Delete All Fake Users'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FakeUserGenerator;



