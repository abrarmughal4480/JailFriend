"use client";

import React, { useState } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface CustomPage {
  id: string;
  pageName: string;
  pageTitle: string;
}

const ManageCustomPages = () => {
  const { isDarkMode } = useDarkMode();
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  // Mock data - replace with actual API call
  const customPages: CustomPage[] = [];
  const totalPages = 0;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPages(customPages.map(page => page.id));
    } else {
      setSelectedPages([]);
    }
  };

  const handleSelectPage = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedPages([...selectedPages, id]);
    } else {
      setSelectedPages(selectedPages.filter(pageId => pageId !== id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedPages.length === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedPages.length} selected page(s)?`)) {
      return;
    }

    setDeleting(true);
    // Add API call here
    console.log('Deleting pages:', selectedPages);
    
    // Simulate API call
    setTimeout(() => {
      setDeleting(false);
      setSelectedPages([]);
      alert('Selected pages deleted successfully!');
    }, 1000);
  };

  const handleCreateNew = () => {
    // Navigate to create page or open modal
    console.log('Create new custom page');
    alert('Create new custom page functionality');
  };

  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Manage Custom Pages
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
          <span className="text-red-500 font-semibold">Manage Custom Pages</span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className={`rounded-lg shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-6">
          {/* Header Section */}
          <div className="mb-6 flex items-start justify-between">
            <h2 className={`text-2xl font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Manage & Edit Custom Pages
            </h2>
            <button
              onClick={handleCreateNew}
              className={`px-6 py-2.5 rounded-lg text-white font-medium transition-colors duration-200 ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              Create New Custom Page
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className={`w-full border-collapse transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
              <thead>
                <tr className={`transition-colors duration-200 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <th className={`px-4 py-3 text-left border-b transition-colors duration-200 ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedPages.length === customPages.length && customPages.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className={`w-4 h-4 rounded transition-colors duration-200 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-blue-600'
                          : 'bg-white border-gray-300 text-blue-600'
                      }`}
                    />
                  </th>
                  <th className={`px-4 py-3 text-left border-b uppercase text-xs font-medium transition-colors duration-200 ${
                    isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-600'
                  }`}>
                    ID
                  </th>
                  <th className={`px-4 py-3 text-left border-b uppercase text-xs font-medium transition-colors duration-200 ${
                    isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-600'
                  }`}>
                    PAGE NAME
                  </th>
                  <th className={`px-4 py-3 text-left border-b uppercase text-xs font-medium transition-colors duration-200 ${
                    isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-600'
                  }`}>
                    PAGE TITLE
                  </th>
                  <th className={`px-4 py-3 text-left border-b uppercase text-xs font-medium transition-colors duration-200 ${
                    isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-600'
                  }`}>
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody>
                {customPages.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className={`px-4 py-8 text-center transition-colors duration-200 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      No custom pages found
                    </td>
                  </tr>
                ) : (
                  customPages.map((page) => (
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
                        <input
                          type="checkbox"
                          checked={selectedPages.includes(page.id)}
                          onChange={(e) => handleSelectPage(page.id, e.target.checked)}
                          className={`w-4 h-4 rounded transition-colors duration-200 ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-blue-600'
                              : 'bg-white border-gray-300 text-blue-600'
                          }`}
                        />
                      </td>
                      <td className={`px-4 py-3 transition-colors duration-200 ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        {page.id}
                      </td>
                      <td className={`px-4 py-3 transition-colors duration-200 ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        {page.pageName}
                      </td>
                      <td className={`px-4 py-3 transition-colors duration-200 ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        {page.pageTitle}
                      </td>
                      <td className={`px-4 py-3 transition-colors duration-200 ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          <button
                            className={`px-3 py-1 rounded text-sm transition-colors duration-200 ${
                              isDarkMode
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                          >
                            Edit
                          </button>
                          <button
                            className={`px-3 py-1 rounded text-sm transition-colors duration-200 ${
                              isDarkMode
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Delete Selected Button */}
          {selectedPages.length > 0 && (
            <div className="mt-6">
              <button
                onClick={handleDeleteSelected}
                disabled={deleting}
                className={`px-6 py-2.5 rounded-lg text-white font-medium transition-colors duration-200 ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
                    : 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400'
                }`}
              >
                {deleting ? 'Deleting...' : 'Delete Selected'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCustomPages;



