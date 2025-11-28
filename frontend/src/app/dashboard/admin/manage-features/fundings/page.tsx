'use client';

import { useState } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface FundingPost {
  id: string;
  publisher: string;
  publisherAvatar: string;
  title: string;
  link: string;
  posted: string;
}

const Funding = () => {
  const { isDarkMode } = useDarkMode();
  const [fundingEnabled, setFundingEnabled] = useState<boolean>(false);
  const [commission, setCommission] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [fundingPosts, setFundingPosts] = useState<FundingPost[]>([
    // Sample data - replace with actual data from API
    // {
    //   id: '1',
    //   publisher: 'john_doe',
    //   publisherAvatar: '/api/placeholder/24/24',
    //   title: 'Sample Funding Post',
    //   link: 'https://example.com',
    //   posted: '2 hours ago'
    // }
  ]);

  const handleSearch = () => {
    console.log('Searching for:', searchTerm);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPosts(fundingPosts.map((post: FundingPost) => post.id));
    } else {
      setSelectedPosts([]);
    }
  };

  const handleSelectPost = (postId: string, checked: boolean) => {
    if (checked) {
      setSelectedPosts(prev => [...prev, postId]);
    } else {
      setSelectedPosts(prev => prev.filter((id: string) => id !== postId));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedPosts.length > 0) {
      if (confirm(`Are you sure you want to delete ${selectedPosts.length} selected funding post(s)?`)) {
        setFundingPosts(prev => prev.filter((post: FundingPost) => !selectedPosts.includes(post.id)));
        setSelectedPosts([]);
        alert('Selected funding posts deleted successfully!');
      }
    } else {
      alert('Please select funding posts to delete.');
    }
  };

  const handleDeletePost = (postId: string) => {
    if (confirm('Are you sure you want to delete this funding post?')) {
      setFundingPosts(prev => prev.filter((post: FundingPost) => post.id !== postId));
      setSelectedPosts(prev => prev.filter((id: string) => id !== postId));
      alert('Funding post deleted successfully!');
    }
  };

  const totalPosts = fundingPosts.length;
  const isAllSelected = selectedPosts.length === totalPosts && totalPosts > 0;

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean, onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 ${isDarkMode ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-2'} ${
        enabled 
          ? isDarkMode
            ? 'bg-green-600 focus:ring-green-400'
            : 'bg-green-500 focus:ring-green-500'
          : isDarkMode
            ? 'bg-red-600 focus:ring-red-400'
            : 'bg-red-500 focus:ring-red-500'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
      {enabled && (
        <svg className="absolute right-1 w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
        </svg>
      )}
      {!enabled && (
        <svg className="absolute left-1 w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
        </svg>
      )}
    </button>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-4`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
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
                    Funding
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Page Title */}
          <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
            Funding
          </h1>

          {/* Funding Settings */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-6 mb-6`}>
            <h2 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Funding Settings
            </h2>

            {/* Funding Settings Toggle */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Funding Settings</span>
                    <span className="text-sm">🤑</span>
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Allow users to create funding requests and earn donations.
                  </p>
                </div>
                <div className="flex items-center">
                  <ToggleSwitch 
                    enabled={fundingEnabled}
                    onToggle={() => setFundingEnabled(!fundingEnabled)}
                  />
                </div>
              </div>
            </div>

            {/* Commission */}
            <div className="mb-4">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                Commission (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={commission}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setCommission(isNaN(value) ? 0 : value);
                }}
                className={`w-full px-3 py-2 text-sm border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              />
              <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                How much do you want to earn commissions from donations, Leave it 0 if you don't want to get any commissions.
              </p>
            </div>
          </div>

          {/* Manage Funding */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border`}>
            {/* Header Section */}
            <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Manage Funding
                </h2>
                <span className={`text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} px-2 py-1 rounded`}>
                  All
                </span>
              </div>

              {/* Search Section */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <label htmlFor="search" className={`block text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Search for post ID, post text.
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
              <table className="w-full">
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
                      PUBLISHER
                    </th>
                    <th className="px-3 py-2 text-left">
                      <div className="flex items-center gap-1">
                        <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>TITLE</span>
                        <svg className={`w-3 h-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </th>
                    <th className={`px-3 py-2 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>
                      LINK
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
                  {fundingPosts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={`px-3 py-8 text-center text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No funding posts found
                      </td>
                    </tr>
                  ) : (
                    fundingPosts.map((post) => (
                      <tr key={post.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selectedPosts.includes(post.id)}
                            onChange={(e) => handleSelectPost(post.id, e.target.checked)}
                            className={`rounded ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'} text-blue-600 focus:ring-blue-500 h-3 w-3`}
                          />
                        </td>
                        <td className={`px-3 py-2 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-900'} font-medium`}>{post.id}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={post.publisherAvatar}
                              alt={post.publisher}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{post.publisher}</span>
                          </div>
                        </td>
                        <td className={`px-3 py-2 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{post.title}</td>
                        <td className="px-3 py-2">
                          <a
                            href={post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-xs ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} underline`}
                          >
                            {post.link}
                          </a>
                        </td>
                        <td className={`px-3 py-2 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{post.posted}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => alert(`Edit funding post: ${post.id}`)}
                              className={`text-xs ${isDarkMode ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'} px-2 py-1 rounded transition-colors`}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
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
            <div className={`px-4 py-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
              {/* Results Count */}
              <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Showing 1 out of {totalPosts}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedPosts.length === 0}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    selectedPosts.length === 0
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className={`p-1.5 rounded-md border ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`} disabled>
                    <svg className={`w-3 h-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => alert('Funding settings saved successfully!')}
              className={`${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 focus:ring-offset-gray-800' : 'bg-blue-500 hover:bg-blue-600 focus:ring-offset-2'} text-white font-medium py-2 px-6 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
  );
};

export default Funding;
