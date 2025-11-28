"use client";

import React, { useState } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface InvitationCode {
  id: string;
  created: string;
  code: string;
  status: 'active' | 'used' | 'expired';
}

const InvitationCodes = () => {
  const { isDarkMode } = useDarkMode();
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Mock data - replace with actual API call
  const invitationCodes: InvitationCode[] = [];
  const totalCodes = 0;

  const handleGenerate = async () => {
    setGenerating(true);
    // Add API call here
    console.log('Generating new invitation code');
    
    // Simulate API call
    setTimeout(() => {
      setGenerating(false);
      alert('New invitation code generated successfully!');
    }, 1000);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCodes(invitationCodes.map(code => code.id));
    } else {
      setSelectedCodes([]);
    }
  };

  const handleSelectCode = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedCodes([...selectedCodes, id]);
    } else {
      setSelectedCodes(selectedCodes.filter(codeId => codeId !== id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedCodes.length === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedCodes.length} selected code(s)?`)) {
      return;
    }

    setDeleting(true);
    // Add API call here
    console.log('Deleting codes:', selectedCodes);
    
    // Simulate API call
    setTimeout(() => {
      setDeleting(false);
      setSelectedCodes([]);
      alert('Selected codes deleted successfully!');
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return isDarkMode ? 'text-green-400' : 'text-green-600';
      case 'used':
        return isDarkMode ? 'text-gray-400' : 'text-gray-600';
      case 'expired':
        return isDarkMode ? 'text-red-400' : 'text-red-600';
      default:
        return isDarkMode ? 'text-gray-400' : 'text-gray-600';
    }
  };

  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Invitation Codes
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
          <span className="text-red-500 font-semibold">Invitation Codes</span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className={`rounded-lg shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-6">
          {/* Header Section */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className={`text-2xl font-semibold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Manage Invitation Codes
              </h2>
              <p className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                This system is used to invite users to your site if the registration system is turned off.
              </p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className={`px-6 py-2.5 rounded-lg text-white font-medium transition-colors duration-200 ${
                isDarkMode
                  ? 'bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400'
                  : 'bg-teal-500 hover:bg-teal-600 disabled:bg-teal-400'
              }`}
            >
              {generating ? 'Generating...' : 'Generate New Code'}
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
                      checked={selectedCodes.length === invitationCodes.length && invitationCodes.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className={`w-4 h-4 rounded transition-colors duration-200 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-blue-600'
                          : 'bg-white border-gray-300 text-blue-600'
                      }`}
                    />
                  </th>
                  <th className={`px-4 py-3 text-left border-b transition-colors duration-200 ${
                    isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                  }`}>
                    ID
                  </th>
                  <th className={`px-4 py-3 text-left border-b transition-colors duration-200 ${
                    isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                  }`}>
                    CREATED
                  </th>
                  <th className={`px-4 py-3 text-left border-b transition-colors duration-200 ${
                    isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                  }`}>
                    INVITATION CODE
                  </th>
                  <th className={`px-4 py-3 text-left border-b transition-colors duration-200 ${
                    isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                  }`}>
                    STATUS
                  </th>
                  <th className={`px-4 py-3 text-left border-b transition-colors duration-200 ${
                    isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                  }`}>
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody>
                {invitationCodes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className={`px-4 py-8 text-center transition-colors duration-200 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      No invitation codes found
                    </td>
                  </tr>
                ) : (
                  invitationCodes.map((code) => (
                    <tr
                      key={code.id}
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
                          checked={selectedCodes.includes(code.id)}
                          onChange={(e) => handleSelectCode(code.id, e.target.checked)}
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
                        {code.id}
                      </td>
                      <td className={`px-4 py-3 transition-colors duration-200 ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        {code.created}
                      </td>
                      <td className={`px-4 py-3 transition-colors duration-200 ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <code className={`px-2 py-1 rounded text-sm ${
                          isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {code.code}
                        </code>
                      </td>
                      <td className={`px-4 py-3 transition-colors duration-200 ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <span className={`text-sm font-medium capitalize ${getStatusColor(code.status)}`}>
                          {code.status}
                        </span>
                      </td>
                      <td className={`px-4 py-3 transition-colors duration-200 ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <button
                          className={`px-3 py-1 rounded text-sm transition-colors duration-200 ${
                            isDarkMode
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-red-500 hover:bg-red-600 text-white'
                          }`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Delete Selected Button */}
          {selectedCodes.length > 0 && (
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

export default InvitationCodes;



