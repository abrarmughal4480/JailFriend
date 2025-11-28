"use client";

import React, { useState } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

const Announcements = () => {
  const { isDarkMode } = useDarkMode();
  const [announcementContent, setAnnouncementContent] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!announcementContent.trim()) {
      alert('Please enter announcement content');
      return;
    }

    setCreating(true);
    // Add API call here
    console.log('Creating announcement:', announcementContent);
    
    // Simulate API call
    setTimeout(() => {
      setCreating(false);
      alert('Announcement created successfully!');
      setAnnouncementContent('');
    }, 1000);
  };

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
  };

  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Announcements
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
          <span className="text-red-500 font-semibold">Announcements</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Active Announcements Card */}
        <div className={`rounded-lg shadow-sm border transition-colors duration-200 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="p-6">
            <h2 className={`text-xl font-semibold mb-2 transition-colors duration-200 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Active Announcements
            </h2>
            <p className={`text-sm transition-colors duration-200 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              There are no active announcements.
            </p>
          </div>
        </div>

        {/* Inactive Announcements Card */}
        <div className={`rounded-lg shadow-sm border transition-colors duration-200 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="p-6">
            <h2 className={`text-xl font-semibold mb-2 transition-colors duration-200 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Inactive Announcements
            </h2>
            <p className={`text-sm transition-colors duration-200 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              There are no inactive announcements.
            </p>
          </div>
        </div>
      </div>

      {/* Manage Announcements Card */}
      <div className={`rounded-lg shadow-sm border transition-colors duration-200 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="p-6">
          <h2 className={`text-2xl font-semibold mb-2 transition-colors duration-200 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Manage Announcements
          </h2>
          <p className={`text-sm mb-6 transition-colors duration-200 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Create New Announcement (HTML Allowed)
          </p>

          {/* Rich Text Editor Toolbar */}
          <div className={`border rounded-t-lg transition-colors duration-200 ${
            isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-300 bg-gray-100'
          }`}>
            <div className="p-2 space-y-2">
              {/* First Row - Menu Items */}
              <div className="flex items-center gap-4 text-sm">
                <button
                  type="button"
                  className={`px-2 py-1 rounded hover:bg-opacity-50 transition-colors duration-200 ${
                    isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  File
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 rounded hover:bg-opacity-50 transition-colors duration-200 ${
                    isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 rounded hover:bg-opacity-50 transition-colors duration-200 ${
                    isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  View
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 rounded hover:bg-opacity-50 transition-colors duration-200 ${
                    isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Insert
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 rounded hover:bg-opacity-50 transition-colors duration-200 ${
                    isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Format
                </button>
              </div>

              {/* Second Row - Formatting Icons */}
              <div className="flex items-center gap-2 border-t pt-2">
                <button
                  type="button"
                  className={`p-1.5 rounded hover:bg-opacity-50 transition-colors duration-200 ${
                    isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
                  }`}
                  title="Undo"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`p-1.5 rounded hover:bg-opacity-50 transition-colors duration-200 ${
                    isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
                  }`}
                  title="Redo"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className={`w-px h-6 mx-1 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
                <button
                  type="button"
                  className={`p-1.5 rounded hover:bg-opacity-50 transition-colors duration-200 font-bold ${
                    isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
                  }`}
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  className={`p-1.5 rounded hover:bg-opacity-50 transition-colors duration-200 italic ${
                    isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
                  }`}
                  title="Italic"
                >
                  I
                </button>
                <div className={`w-px h-6 mx-1 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
                <button
                  type="button"
                  className={`p-1.5 rounded hover:bg-opacity-50 transition-colors duration-200 ${
                    isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
                  }`}
                  title="Align Left"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`p-1.5 rounded hover:bg-opacity-50 transition-colors duration-200 ${
                    isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
                  }`}
                  title="Align Center"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm2 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm-2 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm2 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`p-1.5 rounded hover:bg-opacity-50 transition-colors duration-200 ${
                    isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
                  }`}
                  title="Align Right"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm4 4a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1zm-4 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm4 4a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`p-1.5 rounded hover:bg-opacity-50 transition-colors duration-200 ${
                    isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
                  }`}
                  title="Justify"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Third Row - Additional Tools */}
              <div className="flex items-center gap-2 border-t pt-2">
                <button
                  type="button"
                  className={`p-1.5 rounded hover:bg-opacity-50 transition-colors duration-200 ${
                    isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
                  }`}
                  title="Save"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`p-1.5 rounded hover:bg-opacity-50 transition-colors duration-200 ${
                    isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
                  }`}
                  title="Print"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className={`w-px h-6 mx-1 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
                <button
                  type="button"
                  className={`p-1.5 rounded hover:bg-opacity-50 transition-colors duration-200 ${
                    isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
                  }`}
                  title="Font Color"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2a1 1 0 01-2 0V3a1 1 0 011-1zm0 7a1 1 0 011 1v3a1 1 0 01-2 0v-3a1 1 0 011-1zm13-5a1 1 0 10-2 0v6a1 1 0 102 0V4zM9 2a1 1 0 011 1v6a1 1 0 11-2 0V3a1 1 0 011-1zm5 8a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`p-1.5 rounded hover:bg-opacity-50 transition-colors duration-200 ${
                    isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
                  }`}
                  title="Background Color"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2a1 1 0 01-2 0V3a1 1 0 011-1zm0 7a1 1 0 011 1v3a1 1 0 01-2 0v-3a1 1 0 011-1zm13-5a1 1 0 10-2 0v6a1 1 0 102 0V4zM9 2a1 1 0 011 1v6a1 1 0 11-2 0V3a1 1 0 011-1zm5 8a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`p-1.5 rounded hover:bg-opacity-50 transition-colors duration-200 ${
                    isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
                  }`}
                  title="Link"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`p-1.5 rounded hover:bg-opacity-50 transition-colors duration-200 ${
                    isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
                  }`}
                  title="Image"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="ml-auto">
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors duration-200 ${
                      isDarkMode
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    }`}
                  >
                    ⚡️ Upgrade
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Editor Textarea */}
          <div className="relative">
            <textarea
              value={announcementContent}
              onChange={(e) => setAnnouncementContent(e.target.value)}
              placeholder="Enter your announcement content here..."
              className={`w-full min-h-[300px] p-4 border rounded-b-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                isDarkMode
                  ? 'border-gray-700 bg-gray-800 text-white placeholder-gray-500'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
              }`}
            />
            {/* Editor Footer */}
            <div className={`absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs transition-colors duration-200 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              <span>p</span>
              <span>{getWordCount(announcementContent)} words tiny</span>
            </div>
          </div>

          {/* Create Button */}
          <div className="mt-6">
            <button
              onClick={handleCreate}
              disabled={creating || !announcementContent.trim()}
              className={`px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 font-medium ${
                creating ? 'opacity-70' : ''
              }`}
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Announcements;



