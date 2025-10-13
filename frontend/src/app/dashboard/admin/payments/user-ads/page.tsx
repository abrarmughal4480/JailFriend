"use client";

import { useState } from 'react';

interface Advertisement {
  id: string;
  website: string;
  user: string;
  added: string;
  clicks: number;
  views: number;
}

export default function ManageUserAdvertisements() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedAds, setSelectedAds] = useState<string[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([
    // Sample data - replace with actual data from API
    // {
    //   id: '1',
    //   website: 'example.com',
    //   user: 'john_doe',
    //   added: '2024-01-15',
    //   clicks: 150,
    //   views: 2500
    // }
  ]);

  const handleSearch = () => {
    // Implement search functionality here
    console.log('Searching for:', searchTerm);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAds(advertisements.map((ad: Advertisement) => ad.id));
    } else {
      setSelectedAds([]);
    }
  };

  const handleSelectAd = (adId: string, checked: boolean) => {
    if (checked) {
      setSelectedAds(prev => [...prev, adId]);
    } else {
      setSelectedAds(prev => prev.filter(id => id !== adId));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedAds.length > 0) {
      if (confirm(`Are you sure you want to delete ${selectedAds.length} selected advertisement(s)?`)) {
        setAdvertisements(prev => prev.filter((ad: Advertisement) => !selectedAds.includes(ad.id)));
        setSelectedAds([]);
        alert('Selected advertisements deleted successfully!');
      }
    } else {
      alert('Please select advertisements to delete.');
    }
  };

  const handleDeleteAd = (adId: string) => {
    if (confirm('Are you sure you want to delete this advertisement?')) {
      setAdvertisements(prev => prev.filter((ad: Advertisement) => ad.id !== adId));
      setSelectedAds(prev => prev.filter((id: string) => id !== adId));
      alert('Advertisement deleted successfully!');
    }
  };

  const totalAds = advertisements.length;
  const isAllSelected = selectedAds.length === totalAds && totalAds > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L8 5.414V17a1 1 0 102 0V5.414l6.293 6.293a1 1 0 001.414-1.414l-9-9z"/>
                  </svg>
                  <a href="#" className="ml-2 text-sm font-medium text-orange-500 hover:text-orange-700">
                    Home
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                  <a href="#" className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                    Advertisements
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="ml-2 text-sm font-medium text-red-500">
                    Manage User Advertisements
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Page Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Manage User Advertisements
          </h1>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header Section */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Manage User Advertisements
                  </h2>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                    All
                  </span>
                </div>
              </div>

              {/* Search Section */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                    Search for ad
                  </label>
                  <input
                    id="search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter search term..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleSearch}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        ID
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      WEBSITE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      USER
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ADDED
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CLICKS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      VIEWS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {advertisements.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        No advertisements found
                      </td>
                    </tr>
                  ) : (
                    advertisements.map((ad) => (
                      <tr key={ad.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedAds.includes(ad.id)}
                            onChange={(e) => handleSelectAd(ad.id, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{ad.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{ad.website}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{ad.user}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{ad.added}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{ad.clicks}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{ad.views}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <button
                            onClick={() => handleDeleteAd(ad.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
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

            {/* Footer Section */}
            <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Results Count */}
              <div className="text-sm text-gray-700">
                Showing 1 out of {totalAds}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedAds.length === 0}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedAds.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  }`}
                >
                  Delete Selected
                </button>

                {/* Pagination */}
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    disabled={true}
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    disabled={true}
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
