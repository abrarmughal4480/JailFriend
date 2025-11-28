"use client";

import React, { useState } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

const SendEmail = () => {
  const { isDarkMode } = useDarkMode();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sendTo, setSendTo] = useState('all');
  const [searchUsers, setSearchUsers] = useState('');
  const [testMessage, setTestMessage] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    // Add API call here
    console.log({
      subject,
      message,
      sendTo,
      searchUsers,
      testMessage,
    });
    
    // Simulate API call
    setTimeout(() => {
      setSending(false);
      alert('Email sent successfully!');
    }, 1000);
  };

  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Send E-mail
        </h1>
        <div className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Home {'>'} Tools {'>'} <span className="text-red-500 font-semibold">Send E-mail</span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className={`rounded-lg shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-6">
          <h2 className={`text-2xl font-semibold mb-6 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Send E-mail To Users
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject Field */}
            <div>
              <label
                htmlFor="subject"
                className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Subject
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter email subject"
              />
              <p className={`mt-1.5 text-xs transition-colors duration-200 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Choose the title for your message.
              </p>
            </div>

            {/* Message Field */}
            <div>
              <label
                htmlFor="message"
                className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Message (HTML Allowed)
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={10}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y transition-colors duration-200 ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter your message here..."
              />
              <p className={`mt-1.5 text-xs transition-colors duration-200 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Write your message here.
              </p>
            </div>

            {/* Send E-mail To Field */}
            <div>
              <label
                htmlFor="sendTo"
                className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Send E-mail To
              </label>
              <select
                id="sendTo"
                value={sendTo}
                onChange={(e) => setSendTo(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-white'
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                <option value="all">All users</option>
                <option value="active">Active users</option>
                <option value="inactive">Inactive users</option>
                <option value="verified">Verified users</option>
                <option value="unverified">Unverified users</option>
                <option value="premium">Premium users</option>
                <option value="free">Free users</option>
              </select>
              <p className={`mt-1.5 text-xs transition-colors duration-200 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Choose the type of users you want to send the message to.
              </p>
            </div>

            {/* Search Users Field */}
            <div>
              <label
                htmlFor="searchUsers"
                className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Search Users (Optional)
              </label>
              <input
                type="text"
                id="searchUsers"
                value={searchUsers}
                onChange={(e) => setSearchUsers(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Search for specific users..."
              />
              <p className={`mt-1.5 text-xs transition-colors duration-200 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Send only to those users, leave it empty to send to all users.
              </p>
            </div>

            {/* Test Message Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="testMessage"
                checked={testMessage}
                onChange={(e) => setTestMessage(e.target.checked)}
                className={`w-4 h-4 rounded transition-colors duration-200 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500'
                    : 'bg-white border-gray-300 text-blue-600 focus:ring-blue-500'
                }`}
              />
              <label
                htmlFor="testMessage"
                className={`ml-2 text-sm transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Test Message (Send to my email first)
              </label>
            </div>

            {/* Send Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={sending}
                className={`px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 font-medium ${
                  sending ? 'opacity-70' : ''
                }`}
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendEmail;



