"use client";

import React, { useState } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

const ThirdPartySites = () => {
  const { isDarkMode } = useDarkMode();
  const [playTubeUrl, setPlayTubeUrl] = useState('https://playtubescript.com');
  const [deepSoundUrl, setDeepSoundUrl] = useState('https://deepsoundscript.com');
  const [savingPlayTube, setSavingPlayTube] = useState(false);
  const [savingDeepSound, setSavingDeepSound] = useState(false);

  const handleSavePlayTube = async () => {
    setSavingPlayTube(true);
    // Add API call here
    console.log('Saving PlayTube URL:', playTubeUrl);
    
    // Simulate API call
    setTimeout(() => {
      setSavingPlayTube(false);
      alert('PlayTube settings saved successfully!');
    }, 1000);
  };

  const handleSaveDeepSound = async () => {
    setSavingDeepSound(true);
    // Add API call here
    console.log('Saving DeepSound URL:', deepSoundUrl);
    
    // Simulate API call
    setTimeout(() => {
      setSavingDeepSound(false);
      alert('DeepSound settings saved successfully!');
    }, 1000);
  };

  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Third party sites
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
          <span className="text-red-500 font-semibold">Third party sites</span>
        </div>
      </div>

      {/* Two Panels Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: PlayTube */}
        <div className={`rounded-lg shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="p-6">
            <h2 className={`text-xl font-semibold mb-4 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Third party sites
            </h2>

            <h3 className={`text-lg font-semibold mb-4 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              PlayTube
            </h3>

            {/* URL Input Field */}
            <div className="mb-4">
              <label
                htmlFor="playTubeUrl"
                className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                https://playtubescript.com
              </label>
              <input
                type="url"
                id="playTubeUrl"
                value={playTubeUrl}
                onChange={(e) => setPlayTubeUrl(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
              />
              <p className={`mt-1.5 text-xs transition-colors duration-200 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Your website that uses PlayTube Script, e.g. https://demo.playtubescript.com
              </p>
            </div>

            {/* Info Banner (Yellow) */}
            <div className={`mb-4 p-4 rounded-lg border transition-colors duration-200 ${
              isDarkMode ? 'bg-yellow-900/20 border-yellow-700 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-yellow-800'
            }`}>
              <p className="text-sm">
                This feature allows you to integrate PlayTube script with your site, so videos will be embedded in the post box if someone shares a link from your site.
              </p>
            </div>

            {/* What is PlayTube Link */}
            <div className="mb-6">
              <a
                href="#"
                className={`text-sm transition-colors duration-200 ${
                  isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  alert('What is PlayTube?');
                }}
              >
                What is PlayTube?
              </a>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSavePlayTube}
              disabled={savingPlayTube}
              className={`w-full px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 font-medium ${
                savingPlayTube ? 'opacity-70' : ''
              }`}
            >
              {savingPlayTube ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Right Panel: DeepSound */}
        <div className={`rounded-lg shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="p-6">
            <h2 className={`text-xl font-semibold mb-4 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Third party sites
            </h2>

            <h3 className={`text-lg font-semibold mb-4 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              DeepSound
            </h3>

            {/* URL Input Field */}
            <div className="mb-4">
              <label
                htmlFor="deepSoundUrl"
                className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                https://deepsoundscript.com
              </label>
              <input
                type="url"
                id="deepSoundUrl"
                value={deepSoundUrl}
                onChange={(e) => setDeepSoundUrl(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
              />
              <p className={`mt-1.5 text-xs transition-colors duration-200 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Your website that uses DeepSound Script, e.g. https://demo.deepsoundscript.com
              </p>
            </div>

            {/* Info Banner (Yellow) */}
            <div className={`mb-4 p-4 rounded-lg border transition-colors duration-200 ${
              isDarkMode ? 'bg-yellow-900/20 border-yellow-700 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-yellow-800'
            }`}>
              <p className="text-sm">
                This feature allows you to integrate Deep Sound script with your site, so Sounds will be embedded in the post box if someone shares a link from your site.
              </p>
            </div>

            {/* What is DeepSound Link */}
            <div className="mb-6">
              <a
                href="#"
                className={`text-sm transition-colors duration-200 ${
                  isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  alert('What is DeepSound?');
                }}
              >
                What is DeepSound?
              </a>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveDeepSound}
              disabled={savingDeepSound}
              className={`w-full px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 font-medium ${
                savingDeepSound ? 'opacity-70' : ''
              }`}
            >
              {savingDeepSound ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThirdPartySites;



