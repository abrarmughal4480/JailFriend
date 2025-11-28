"use client";

import React, { useState } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

const BackupSQL = () => {
  const { isDarkMode } = useDarkMode();
  const [lastBackup, setLastBackup] = useState('00-00-0000');
  const [backingUp, setBackingUp] = useState(false);

  const handleCreateBackup = async () => {
    if (!window.confirm('Are you sure you want to create a new full backup? This may take several minutes.')) {
      return;
    }

    setBackingUp(true);
    // Add API call here
    console.log('Creating new full backup');
    
    // Simulate API call
    setTimeout(() => {
      setBackingUp(false);
      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
      setLastBackup(formattedDate);
      alert('Backup created successfully! Please note that it may take several minutes to complete.');
    }, 2000);
  };

  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Backup SQL & Files
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
          <span className="text-red-500 font-semibold">Backup SQL & Files</span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className={`rounded-lg shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-6">
          {/* Section Header with Icon */}
          <div className="flex items-center gap-4 mb-6">
            {/* Database/Backup Icon */}
            <div className={`p-4 rounded-lg transition-colors duration-200 ${
              isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
            }`}>
              <svg className={`w-8 h-8 transition-colors duration-200 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {/* Database server icon with refresh arrow */}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                {/* Refresh arrow overlay */}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M20 4l-3 3m-8 8l-3 3" />
              </svg>
            </div>
            <h2 className={`text-2xl font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Backup SQL & Files
            </h2>
          </div>

          {/* Backup Details */}
          <div className="space-y-4 mb-6">
            {/* Last Backup */}
            <div className="flex items-center gap-3">
              <svg className={`w-5 h-5 transition-colors duration-200 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`text-sm transition-colors duration-200 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <strong>Last Backup:</strong> {lastBackup}
              </span>
            </div>

            {/* Backups Directory */}
            <div className="flex items-center gap-3">
              <svg className={`w-5 h-5 transition-colors duration-200 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span className={`text-sm transition-colors duration-200 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <strong>Backups directory:</strong> ./script_backups/
              </span>
            </div>

            {/* Backup Type */}
            <div className="flex items-start gap-3">
              <svg className={`w-5 h-5 mt-0.5 transition-colors duration-200 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className={`text-sm transition-colors duration-200 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <strong>Backup type:</strong> all files including ./upload folder and full backup of your database.
              </span>
            </div>

            {/* Recommendation */}
            <div className="flex items-center gap-3">
              <svg className={`w-5 h-5 transition-colors duration-200 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className={`text-sm transition-colors duration-200 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                It's recommended to download the backups via FTP.
              </span>
            </div>
          </div>

          {/* Create Backup Button */}
          <div className="mb-4">
            <button
              onClick={handleCreateBackup}
              disabled={backingUp}
              className={`px-6 py-2.5 rounded-lg text-white font-medium transition-colors duration-200 ${
                isDarkMode
                  ? 'bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400'
                  : 'bg-teal-500 hover:bg-teal-600 disabled:bg-teal-400'
              }`}
            >
              {backingUp ? 'Creating Backup...' : 'Create New Full Backup'}
            </button>
          </div>

          {/* Note */}
          <p className={`text-xs transition-colors duration-200 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Please note that it may take several minutes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BackupSQL;



