"use client";

import React, { useState } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface Invitation {
  id: string;
  created: string;
  invitationCode: string;
  invitedUser: string;
}

const UsersInvitation = () => {
  const { isDarkMode } = useDarkMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvitations, setSelectedInvitations] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'id' | 'created'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all');

  // Mock data - replace with actual API call
  const invitations: Invitation[] = [];
  const totalInvitations = 0;
  const itemsPerPage = 15;
  const totalPages = Math.ceil(totalInvitations / itemsPerPage);

  const handleSort = (field: 'id' | 'created') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInvitations(invitations.map(inv => inv.id));
    } else {
      setSelectedInvitations([]);
    }
  };

  const handleSelectInvitation = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedInvitations([...selectedInvitations, id]);
    } else {
      setSelectedInvitations(selectedInvitations.filter(invId => invId !== id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedInvitations.length === 0) return;
    // Add delete logic here
    console.log('Deleting:', selectedInvitations);
    setSelectedInvitations([]);
  };

  const handleSearch = () => {
    // Add search logic here
    console.log('Searching for:', searchQuery);
  };

  const getSortIcon = (field: 'id' | 'created') => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Users Invitation
        </h1>
        <div className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Home {'>'} Tools {'>'} <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Users Invitation</span>
        </div>
      </div>

      {/* Main Content */}
      <div className={`rounded-lg shadow-sm border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-6">
          <h2 className={`text-2xl font-semibold mb-4 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Manage Users Invitation
          </h2>

          {/* Info Banner */}
          <div className={`mb-6 p-4 rounded-lg border transition-colors duration-200 ${
            isDarkMode ? 'bg-blue-900/20 border-blue-700 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <p className="text-sm">
              This system is used to invite users to your site if the registration system is turned off.
            </p>
          </div>

          {/* Search Section */}
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <label className={`text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Search for code
              </label>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter invitation code..."
                  className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Table Controls */}
          <div className="mb-4 flex items-center justify-between">
            <div></div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
            </div>
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
                      checked={selectedInvitations.length === invitations.length && invitations.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className={`w-4 h-4 rounded transition-colors duration-200 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-blue-600'
                          : 'bg-white border-gray-300 text-blue-600'
                      }`}
                    />
                  </th>
                  <th
                    className={`px-4 py-3 text-left border-b cursor-pointer hover:bg-opacity-80 transition-colors duration-200 ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-300'
                    }`}
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center">
                      ID
                      {getSortIcon('id')}
                    </div>
                  </th>
                  <th
                    className={`px-4 py-3 text-left border-b cursor-pointer hover:bg-opacity-80 transition-colors duration-200 ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-300'
                    }`}
                    onClick={() => handleSort('created')}
                  >
                    <div className="flex items-center">
                      CREATED
                      {getSortIcon('created')}
                    </div>
                  </th>
                  <th className={`px-4 py-3 text-left border-b transition-colors duration-200 ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  }`}>
                    INVITATION CODE
                  </th>
                  <th className={`px-4 py-3 text-left border-b transition-colors duration-200 ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  }`}>
                    INVITED USER
                  </th>
                  <th className={`px-4 py-3 text-left border-b transition-colors duration-200 ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  }`}>
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody>
                {invitations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className={`px-4 py-8 text-center transition-colors duration-200 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      No invitations found
                    </td>
                  </tr>
                ) : (
                  invitations.map((invitation) => (
                    <tr
                      key={invitation.id}
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
                          checked={selectedInvitations.includes(invitation.id)}
                          onChange={(e) => handleSelectInvitation(invitation.id, e.target.checked)}
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
                        {invitation.id}
                      </td>
                      <td className={`px-4 py-3 transition-colors duration-200 ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        {invitation.created}
                      </td>
                      <td className={`px-4 py-3 transition-colors duration-200 ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        {invitation.invitationCode}
                      </td>
                      <td className={`px-4 py-3 transition-colors duration-200 ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        {invitation.invitedUser || '-'}
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

          {/* Table Footer */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Showing {invitations.length} out of {totalInvitations}
              </p>
              {selectedInvitations.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Delete Selected
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                  currentPage === 1
                    ? isDarkMode
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                  currentPage === totalPages || totalPages === 0
                    ? isDarkMode
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersInvitation;



