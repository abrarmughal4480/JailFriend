"use client";

import React, { useState } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface BannedItem {
  id: string;
  banned: string;
  value: string;
}

const Blacklist = () => {
  const { isDarkMode } = useDarkMode();
  const [banValue, setBanValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'id' | 'banned'>('banned');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [banning, setBanning] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Mock data - replace with actual API call
  const bannedItems: BannedItem[] = [];
  const totalItems = 0;
  const itemsPerPage = 15;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleBan = async () => {
    if (!banValue.trim()) {
      alert('Please enter an IP address, email, or username');
      return;
    }

    setBanning(true);
    // Add API call here
    console.log('Banning:', banValue);
    
    // Simulate API call
    setTimeout(() => {
      setBanning(false);
      alert('Item banned successfully!');
      setBanValue('');
    }, 1000);
  };

  const handleSearch = () => {
    // Add search logic here
    console.log('Searching for:', searchQuery);
  };

  const handleSort = (field: 'id' | 'banned') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(bannedItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} selected item(s)?`)) {
      return;
    }

    setDeleting(true);
    // Add API call here
    console.log('Deleting:', selectedItems);
    
    // Simulate API call
    setTimeout(() => {
      setDeleting(false);
      setSelectedItems([]);
      alert('Selected items deleted successfully!');
    }, 1000);
  };

  const getSortIcon = (field: 'id' | 'banned') => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 inline ml-1 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    }
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
          Blacklist Users
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
          <span className="text-red-500 font-semibold">Blacklist Users</span>
        </div>
      </div>

      {/* Ban IP, email or username Section */}
      <div className={`mb-6 rounded-lg shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-6">
          <h2 className={`text-2xl font-semibold mb-4 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Ban IP, email or username
          </h2>

          {/* Info Banner (Blue) */}
          <div className={`mb-6 p-4 rounded-lg border transition-colors duration-200 ${
            isDarkMode ? 'bg-blue-900/20 border-blue-700 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <p className="text-sm">
              Add any email, username or ip to prevent users from creating accounts within the blacklist.
            </p>
          </div>

          {/* Input Field */}
          <div className="mb-6">
            <input
              type="text"
              value={banValue}
              onChange={(e) => setBanValue(e.target.value)}
              placeholder="IP Address, Email Address, E-mail range or Username"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Ban Button */}
          <div>
            <button
              onClick={handleBan}
              disabled={banning || !banValue.trim()}
              className={`px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 font-medium ${
                banning ? 'opacity-70' : ''
              }`}
            >
              {banning ? 'Banning...' : 'Ban'}
            </button>
          </div>
        </div>
      </div>

      {/* Manage Banned IPs Section */}
      <div className={`rounded-lg shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-6">
          <h2 className={`text-2xl font-semibold mb-6 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Manage Banned IPs
          </h2>

          {/* Search Section */}
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <label className={`text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Search for IP
              </label>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter IP address..."
                  className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
                <button
                  onClick={handleSearch}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
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
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
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
                      checked={selectedItems.length === bannedItems.length && bannedItems.length > 0}
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
                    onClick={() => handleSort('banned')}
                  >
                    <div className="flex items-center">
                      BANNED
                      {getSortIcon('banned')}
                    </div>
                  </th>
                  <th className={`px-4 py-3 text-left border-b transition-colors duration-200 ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  }`}>
                    VALUE
                  </th>
                  <th className={`px-4 py-3 text-left border-b transition-colors duration-200 ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  }`}>
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody>
                {bannedItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className={`px-4 py-8 text-center transition-colors duration-200 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      No banned items found
                    </td>
                  </tr>
                ) : (
                  bannedItems.map((item) => (
                    <tr
                      key={item.id}
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
                          checked={selectedItems.includes(item.id)}
                          onChange={(e) => handleSelectItem(item.id, e.target.checked)}
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
                        {item.id}
                      </td>
                      <td className={`px-4 py-3 transition-colors duration-200 ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        {item.banned}
                      </td>
                      <td className={`px-4 py-3 transition-colors duration-200 ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        {item.value}
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
                Showing {bannedItems.length} out of {totalItems}
              </p>
              {selectedItems.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={deleting}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400'
                      : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-400'
                  }`}
                >
                  {deleting ? 'Deleting...' : 'Delete Selected'}
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

export default Blacklist;



