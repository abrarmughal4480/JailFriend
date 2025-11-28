"use client";

import React, { useState } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

const MassNotifications = () => {
  const { isDarkMode } = useDarkMode();
  const [url, setUrl] = useState('');
  const [notificationText, setNotificationText] = useState('');
  const [selectedUsers, setSelectedUsers] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!url.trim()) {
      alert('URL is required');
      return;
    }

    if (!notificationText.trim()) {
      alert('Notification text is required');
      return;
    }

    setSending(true);
    // Add API call here
    console.log('Sending mass notification:', {
      url,
      notificationText,
      selectedUsers: selectedUsers.trim() || 'all',
    });
    
    // Simulate API call
    setTimeout(() => {
      setSending(false);
      alert('Mass notification sent successfully!');
      setUrl('');
      setNotificationText('');
      setSelectedUsers('');
    }, 2000);
  };

  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Mass Notifications
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
          <span className="text-red-500 font-semibold">Mass Notifications</span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className={`rounded-lg shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-6">
          <h2 className={`text-2xl font-semibold mb-6 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Send Site Notifications To Users
          </h2>

          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="space-y-6">
            {/* URL Field */}
            <div>
              <label
                htmlFor="url"
                className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                placeholder="https://example.com/page"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
              />
              <p className={`mt-1.5 text-xs transition-colors duration-200 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Where you want to point this notification to? URL is required.
              </p>
            </div>

            {/* Notification Text Field */}
            <div>
              <label
                htmlFor="notificationText"
                className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Notification Text
              </label>
              <textarea
                id="notificationText"
                value={notificationText}
                onChange={(e) => setNotificationText(e.target.value)}
                required
                rows={8}
                placeholder="Enter your notification message here..."
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y transition-colors duration-200 ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
              />
              <p className={`mt-1.5 text-xs transition-colors duration-200 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Write the body of your your notification.
              </p>
            </div>

            {/* Selected Users Field */}
            <div>
              <label
                htmlFor="selectedUsers"
                className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Selected Users
              </label>
              <input
                type="text"
                id="selectedUsers"
                value={selectedUsers}
                onChange={(e) => setSelectedUsers(e.target.value)}
                placeholder="user1, user2, user3 (leave empty for all users)"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
              />
              <p className={`mt-1.5 text-xs transition-colors duration-200 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                If left empty, the notification will be sent to all users.
              </p>
            </div>

            {/* Send Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={sending || !url.trim() || !notificationText.trim()}
                className={`px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 font-medium ${
                  sending ? 'opacity-70' : ''
                }`}
              >
                {sending ? 'Sending...' : 'Send Notification'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MassNotifications;



