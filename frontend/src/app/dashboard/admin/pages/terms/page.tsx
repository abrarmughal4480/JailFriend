"use client";

import React from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface TermsPage {
  id: string;
  pageName: string;
}

const ManageTermsPages = () => {
  const { isDarkMode } = useDarkMode();

  // Terms pages data
  const termsPages: TermsPage[] = [
    { id: '1', pageName: 'Terms of Use' },
    { id: '2', pageName: 'Privacy Policy' },
    { id: '3', pageName: 'About' },
    { id: '4', pageName: 'Refund' },
  ];

  const handleEdit = (page: TermsPage) => {
    // Navigate to edit page or open modal
    console.log('Editing page:', page);
    alert(`Edit ${page.pageName} functionality`);
  };

  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Manage Terms Pages
        </h1>
        <div className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </span>
          {' > '}
          Pages
          {' > '}
          <span className="text-red-500 font-semibold">Manage Terms Pages</span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className={`rounded-lg shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-6">
          <h2 className={`text-2xl font-semibold mb-6 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Manage Terms Pages
          </h2>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className={`w-full border-collapse transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
              <thead>
                <tr className={`transition-colors duration-200 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <th className={`px-4 py-3 text-left border-b uppercase text-xs font-medium transition-colors duration-200 ${
                    isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-600'
                  }`}>
                    PAGE NAME
                  </th>
                  <th className={`px-4 py-3 text-left border-b uppercase text-xs font-medium transition-colors duration-200 ${
                    isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-600'
                  }`}>
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody>
                {termsPages.map((page) => (
                  <tr
                    key={page.id}
                    className={`border-b transition-colors duration-200 hover:bg-opacity-50 ${
                      isDarkMode
                        ? 'border-gray-700 hover:bg-gray-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <td className={`px-4 py-3 transition-colors duration-200 ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      {page.pageName}
                    </td>
                    <td className={`px-4 py-3 transition-colors duration-200 ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <button
                        onClick={() => handleEdit(page)}
                        className={`px-4 py-2 rounded-lg text-white font-medium transition-colors duration-200 ${
                          isDarkMode
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageTermsPages;



