"use client";

import React, { useState } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

const VerifyApplications = () => {
  const { isDarkMode } = useDarkMode();
  const [verificationCodes, setVerificationCodes] = useState({
    androidMessenger: '',
    iosMessenger: '',
    windowsDesktop: '',
    androidTimeline: '',
  });
  const [verifying, setVerifying] = useState({
    androidMessenger: false,
    iosMessenger: false,
    windowsDesktop: false,
    androidTimeline: false,
  });

  const handleVerify = async (appType: keyof typeof verificationCodes) => {
    if (!verificationCodes[appType].trim()) {
      alert('Please enter a verification code');
      return;
    }

    setVerifying(prev => ({ ...prev, [appType]: true }));
    // Add API call here
    console.log(`Verifying ${appType}:`, verificationCodes[appType]);
    
    // Simulate API call
    setTimeout(() => {
      setVerifying(prev => ({ ...prev, [appType]: false }));
      alert(`${appType} verified successfully!`);
      setVerificationCodes(prev => ({ ...prev, [appType]: '' }));
    }, 1000);
  };

  const handleGetCode = (appType: string) => {
    alert(`Get verification code for ${appType}`);
  };

  const applications = [
    {
      id: 'windows',
      name: 'Native Windows Messenger',
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
        </svg>
      ),
      color: 'text-blue-600',
    },
    {
      id: 'android-messenger',
      name: 'Native Android Messenger',
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993 0 .5511-.4483.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C17.5902 8.2439 16.8533 7.9988 16.06 7.9988c-1.6935 0-3.0849 1.3892-3.0849 3.0827 0 .414.0804.8089.2365 1.1692l-2.7888 1.8287c-.2617-.2129-.5805-.3414-.9293-.3414-.9654 0-1.7503.7849-1.7503 1.7503s.7849 1.7503 1.7503 1.7503c.3488 0 .6676-.1285.9293-.3414l2.7888 1.8286c-.1561.3603-.2365.7552-.2365 1.1692 0 1.6935 1.3914 3.0827 3.0849 3.0827 1.6935 0 3.0849-1.3892 3.0849-3.0827 0-.414-.0804-.8089-.2365-1.1692l2.7888-1.8286c.2617.2129.5805.3414.9293.3414.9654 0 1.7503-.7849 1.7503-1.7503s-.7849-1.7503-1.7503-1.7503c-.3488 0-.6676.1285-.9293.3414l-2.7888-1.8286c.1561-.3603.2365-.7552.2365-1.1692 0-1.6935-1.3914-3.0827-3.0849-3.0827-.7933 0-1.5302.2451-2.1425.6662z" />
        </svg>
      ),
      color: 'text-green-600',
    },
    {
      id: 'ios-messenger',
      name: 'Native iOS Messenger',
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.78-3.24-.78-1.15 0-2.23.28-3.24.78-1.03.48-2.1.55-3.08-.4-4.5-4.34-4.53-11.83 0-16.17.98-.95 2.05-.88 3.08-.4 1.09.5 2.08.78 3.24.78 1.15 0 2.23-.28 3.24-.78 1.03-.48 2.1-.55 3.08.4 4.5 4.34 4.53 11.83 0 16.17zm-1.05-14.4c-.5-.48-1.13-.44-1.53.03-.4.48-.35 1.13.15 1.6.5.48 1.13.44 1.53-.03.4-.48.35-1.13-.15-1.6zm-5.5 0c-.5-.48-1.13-.44-1.53.03-.4.48-.35 1.13.15 1.6.5.48 1.13.44 1.53-.03.4-.48.35-1.13-.15-1.6z" />
        </svg>
      ),
      color: 'text-gray-800',
    },
    {
      id: 'android-timeline',
      name: 'Native Android Timeline',
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993 0 .5511-.4483.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C17.5902 8.2439 16.8533 7.9988 16.06 7.9988c-1.6935 0-3.0849 1.3892-3.0849 3.0827 0 .414.0804.8089.2365 1.1692l-2.7888 1.8287c-.2617-.2129-.5805-.3414-.9293-.3414-.9654 0-1.7503.7849-1.7503 1.7503s.7849 1.7503 1.7503 1.7503c.3488 0 .6676-.1285.9293-.3414l2.7888 1.8286c-.1561.3603-.2365.7552-.2365 1.1692 0 1.6935 1.3914 3.0827 3.0849 3.0827 1.6935 0 3.0849-1.3892 3.0849-3.0827 0-.414-.0804-.8089-.2365-1.1692l2.7888-1.8286c.2617.2129.5805.3414.9293.3414.9654 0 1.7503-.7849 1.7503-1.7503s-.7849-1.7503-1.7503-1.7503c-.3488 0-.6676.1285-.9293.3414l-2.7888-1.8286c.1561-.3603.2365-.7552.2365-1.1692 0-1.6935-1.3914-3.0827-3.0849-3.0827-.7933 0-1.5302.2451-2.1425.6662z" />
        </svg>
      ),
      color: 'text-green-600',
    },
  ];

  const verificationForms = [
    {
      key: 'androidMessenger' as const,
      title: 'Verify Android Messenger',
      label: 'Android Messenger Verification Code',
    },
    {
      key: 'iosMessenger' as const,
      title: 'Verify IOS Messenger',
      label: 'IOS Messenger Verification Code',
    },
    {
      key: 'windowsDesktop' as const,
      title: 'Windows Desktop Messenger',
      label: 'Windows Desktop Verification Code',
    },
    {
      key: 'androidTimeline' as const,
      title: 'Android Timeline Application',
      label: 'Android Timeline Verification Code',
    },
  ];

  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Mobile & Verify Applications
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
          <span className="text-red-500 font-semibold">Mobile & Verify Applications</span>
        </div>
      </div>

      {/* Use The Applications Section */}
      <div className={`mb-8 rounded-lg shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-6">
          <h2 className={`text-2xl font-semibold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Use The Applications
          </h2>
          <p className={`text-sm mb-6 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            If you use one of those products listed below, you need to verify them before you can use them.
          </p>

          {/* Application Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className={`p-4 border rounded-lg transition-colors duration-200 ${
                  isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`mb-3 ${app.color}`}>
                    {app.icon}
                  </div>
                  <h3 className={`text-sm font-semibold mb-3 transition-colors duration-200 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {app.name}
                  </h3>
                  <button
                    className={`w-full px-4 py-2 rounded-lg text-white font-medium transition-colors duration-200 ${
                      isDarkMode
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                    onClick={() => alert(`Get ${app.name}`)}
                  >
                    Get Here
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verification Forms Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {verificationForms.map((form) => (
          <div
            key={form.key}
            className={`rounded-lg shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 transition-colors duration-200 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {form.title}
              </h3>

              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {form.label}
                  </label>
                  <input
                    type="text"
                    value={verificationCodes[form.key]}
                    onChange={(e) => setVerificationCodes(prev => ({
                      ...prev,
                      [form.key]: e.target.value,
                    }))}
                    placeholder="Enter verification code"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                      isDarkMode
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleGetCode(form.title);
                    }}
                    className={`text-sm transition-colors duration-200 ${
                      isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    Get Verification Code
                  </a>
                  <button
                    onClick={() => handleVerify(form.key)}
                    disabled={verifying[form.key] || !verificationCodes[form.key].trim()}
                    className={`px-6 py-2 rounded-lg text-white font-medium transition-colors duration-200 ${
                      isDarkMode
                        ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                        : 'bg-red-500 hover:bg-red-600 disabled:bg-red-400'
                    }`}
                  >
                    {verifying[form.key] ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerifyApplications;



