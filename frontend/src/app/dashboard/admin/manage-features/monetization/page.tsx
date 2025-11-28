'use client';

import { useState } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface Monetization {
  id: string;
  monetizationOwner: string;
  monetizationOwnerAvatar: string;
  subscriber: string;
  subscriberAvatar: string;
  period: string;
  price: number;
  title: string;
  posted: string;
}

const Monetization = () => {
  const { isDarkMode } = useDarkMode();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMonetizations, setSelectedMonetizations] = useState<string[]>([]);
  const [monetizations, setMonetizations] = useState<Monetization[]>([
    // Sample data - replace with actual data from API
    // {
    //   id: '1',
    //   monetizationOwner: 'john_doe',
    //   monetizationOwnerAvatar: '/api/placeholder/24/24',
    //   subscriber: 'jane_smith',
    //   subscriberAvatar: '/api/placeholder/24/24',
    //   period: 'Monthly',
    //   price: 9.99,
    //   title: 'Premium Content',
    //   posted: '2 hours ago'
    // }
  ]);

  const handleSearch = () => {
    console.log('Searching for:', searchTerm);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMonetizations(monetizations.map((monetization: Monetization) => monetization.id));
    } else {
      setSelectedMonetizations([]);
    }
  };

  const handleSelectMonetization = (monetizationId: string, checked: boolean) => {
    if (checked) {
      setSelectedMonetizations(prev => [...prev, monetizationId]);
    } else {
      setSelectedMonetizations(prev => prev.filter((id: string) => id !== monetizationId));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedMonetizations.length > 0) {
      if (confirm(`Are you sure you want to delete ${selectedMonetizations.length} selected monetization(s)?`)) {
        setMonetizations(prev => prev.filter((monetization: Monetization) => !selectedMonetizations.includes(monetization.id)));
        setSelectedMonetizations([]);
        alert('Selected monetizations deleted successfully!');
      }
    } else {
      alert('Please select monetizations to delete.');
    }
  };

  const handleDeleteMonetization = (monetizationId: string) => {
    if (confirm('Are you sure you want to delete this monetization?')) {
      setMonetizations(prev => prev.filter((monetization: Monetization) => monetization.id !== monetizationId));
      setSelectedMonetizations(prev => prev.filter((id: string) => id !== monetizationId));
      alert('Monetization deleted successfully!');
    }
  };

  const handleEditMonetization = (monetizationId: string) => {
    alert(`Edit monetization with ID: ${monetizationId}`);
  };

  const totalMonetizations = monetizations.length;
  const isAllSelected = selectedMonetizations.length === totalMonetizations && totalMonetizations > 0;

  // Stats - replace with actual data from API
  const totalEarnings = 0;
  const earningsThisMonth = 0;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-2 sm:py-4 lg:py-6`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex mb-4 sm:mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-3">
              <li>
                <div className="flex items-center">
                  <svg className={`w-3 h-3 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L8 5.414V17a1 1 0 102 0V5.414l6.293 6.293a1 1 0 001.414-1.414l-9-9z"/>
                  </svg>
                  <a href="#" className={`ml-1 text-xs font-medium ${isDarkMode ? 'text-orange-400 hover:text-orange-300' : 'text-orange-500 hover:text-orange-700'}`}>
                    Home
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className={`w-3 h-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                  <a href="#" className={`ml-1 text-xs font-medium ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>
                    Manage Features
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className={`w-3 h-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className={`ml-1 text-xs font-medium ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>
                    Content Monetization
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Page Title */}
          <h1 className={`text-lg sm:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3 sm:mb-4`}>
            Content Monetization
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-2 sm:p-4`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'} rounded-full flex items-center justify-center`}>
                    <svg className={`w-3 h-3 sm:w-4 sm:h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>TOTAL EARNINGS</p>
                  <p className={`text-sm sm:text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${totalEarnings.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-2 sm:p-4`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'} rounded-full flex items-center justify-center`}>
                    <svg className={`w-3 h-3 sm:w-4 sm:h-4 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>EARNINGS THIS MONTH</p>
                  <p className={`text-sm sm:text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${earningsThisMonth.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border`}>
            {/* Header Section */}
            <div className={`p-3 sm:p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Manage Content Monetization
                </h2>
                <span className={`text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} px-2 py-1 rounded`}>
                  All
                </span>
              </div>

              {/* Search Section */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <label htmlFor="search" className={`block text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Search for Title.
                  </label>
                  <input
                    id="search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full px-2 py-1.5 text-xs border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleSearch}
                    className={`${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-medium py-1.5 px-4 text-xs rounded-md transition-colors`}
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border-b`}>
                  <tr>
                    <th className="px-3 py-2 text-left">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className={`rounded ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'} text-blue-600 focus:ring-blue-500 h-3 w-3`}
                      />
                    </th>
                    <th className="px-3 py-2 text-left">
                      <div className="flex items-center gap-1">
                        <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>ID</span>
                        <svg className={`w-3 h-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        </svg>
                      </div>
                    </th>
                    <th className={`px-3 py-2 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>
                      MONETIZATION OWNER
                    </th>
                    <th className={`px-3 py-2 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>
                      SUBSCRIBER
                    </th>
                    <th className={`px-3 py-2 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>
                      PERIOD
                    </th>
                    <th className={`px-3 py-2 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>
                      PRICE
                    </th>
                    <th className="px-3 py-2 text-left">
                      <div className="flex items-center gap-1">
                        <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>TITLE</span>
                        <svg className={`w-3 h-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left">
                      <div className="flex items-center gap-1">
                        <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>POSTED</span>
                        <svg className={`w-3 h-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </th>
                    <th className={`px-3 py-2 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
                  {monetizations.length === 0 ? (
                    <tr>
                      <td colSpan={9} className={`px-3 py-8 text-center text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No monetizations found
                      </td>
                    </tr>
                  ) : (
                    monetizations.map((monetization) => (
                      <tr key={monetization.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selectedMonetizations.includes(monetization.id)}
                            onChange={(e) => handleSelectMonetization(monetization.id, e.target.checked)}
                            className={`rounded ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'} text-blue-600 focus:ring-blue-500 h-3 w-3`}
                          />
                        </td>
                        <td className={`px-3 py-2 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-900'} font-medium`}>{monetization.id}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={monetization.monetizationOwnerAvatar || '/default-avatar.svg'}
                              alt={monetization.monetizationOwner}
                              className="w-5 h-5 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/default-avatar.svg';
                              }}
                            />
                            <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{monetization.monetizationOwner}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={monetization.subscriberAvatar || '/default-avatar.svg'}
                              alt={monetization.subscriber}
                              className="w-5 h-5 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/default-avatar.svg';
                              }}
                            />
                            <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{monetization.subscriber}</span>
                          </div>
                        </td>
                        <td className={`px-3 py-2 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{monetization.period}</td>
                        <td className={`px-3 py-2 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>${monetization.price.toFixed(2)}</td>
                        <td className={`px-3 py-2 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{monetization.title}</td>
                        <td className={`px-3 py-2 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{monetization.posted}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditMonetization(monetization.id)}
                              className={`text-xs ${isDarkMode ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'} px-2 py-1 rounded transition-colors`}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMonetization(monetization.id)}
                              className={`text-xs ${isDarkMode ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-100 text-red-600 hover:bg-red-200'} px-2 py-1 rounded transition-colors`}
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

            {/* Footer Section */}
            <div className={`px-3 sm:px-4 py-2 sm:py-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3`}>
              {/* Results Count */}
              <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Showing 1 out of {totalMonetizations}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedMonetizations.length === 0}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    selectedMonetizations.length === 0
                      ? isDarkMode
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : isDarkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Delete Selected
                </button>

                {/* Pagination */}
                <div className="flex items-center gap-1">
                  <button className={`p-1.5 rounded-md border ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`} disabled>
                    <svg className={`w-3 h-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className={`p-1.5 rounded-md border ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`} disabled>
                    <svg className={`w-3 h-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className={`p-1.5 rounded-md border ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`} disabled>
                    <svg className={`w-3 h-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button className={`p-1.5 rounded-md border ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`} disabled>
                    <svg className={`w-3 h-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Monetization;




