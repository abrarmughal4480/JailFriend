'use client';

import { useState } from 'react';


interface App {
  id: string;
  avatar: string;
  name: string;
  website: string;
  callbackUrl: string;
  description: string;
}

const ManageApps = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [apps, setApps] = useState<App[]>([
    // Sample data - replace with actual data from API
    // {
    //   id: '1',
    //   avatar: '/api/placeholder/32/32',
    //   name: 'Sample App',
    //   website: 'https://example.com',
    //   callbackUrl: 'https://example.com/callback',
    //   description: 'This is a sample app description'
    // }
  ]);

  const handleSearch = () => {
    // Implement search functionality here
    console.log('Searching for:', searchTerm);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedApps(apps.map((app: App) => app.id));
    } else {
      setSelectedApps([]);
    }
  };

  const handleSelectApp = (appId: string, checked: boolean) => {
    if (checked) {
      setSelectedApps(prev => [...prev, appId]);
    } else {
      setSelectedApps(prev => prev.filter((id: string) => id !== appId));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedApps.length > 0) {
      if (confirm(`Are you sure you want to delete ${selectedApps.length} selected app(s)?`)) {
        setApps(prev => prev.filter((app: App) => !selectedApps.includes(app.id)));
        setSelectedApps([]);
        alert('Selected apps deleted successfully!');
      }
    } else {
      alert('Please select apps to delete.');
    }
  };

  const handleDeleteApp = (appId: string) => {
    if (confirm('Are you sure you want to delete this app?')) {
      setApps(prev => prev.filter((app: App) => app.id !== appId));
      setSelectedApps(prev => prev.filter((id: string) => id !== appId));
      alert('App deleted successfully!');
    }
  };

  const totalApps = apps.length;
  const isAllSelected = selectedApps.length === totalApps && totalApps > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-2 sm:py-4 lg:py-6">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex mb-4 sm:mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-3">
              <li>
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-orange-500 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L8 5.414V17a1 1 0 102 0V5.414l6.293 6.293a1 1 0 001.414-1.414l-9-9z"/>
                  </svg>
                  <a href="#" className="ml-1 text-xs font-medium text-orange-500 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300">
                    Home
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                  <a href="#" className="ml-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                    Manage Features
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="ml-1 text-xs font-medium text-red-500 dark:text-red-400">
                    Manage Apps
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Page Title */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Manage Apps
          </h1>

          {/* Main Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Header Section */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Manage Apps
                  </h2>
                </div>
              </div>

              {/* Search Section */}
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label htmlFor="search" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Search for app
                  </label>
                  <input
                    id="search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter search term..."
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleSearch}
                    className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium py-1.5 px-4 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-4 py-2 text-left">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 h-3 w-3 bg-white dark:bg-gray-700"
                      />
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        ID
                        <svg className="w-2 h-2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      AVATAR
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        NAME
                        <svg className="w-2 h-2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      WEBSITE
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      CALLBACK URL
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      DESCRIPTION
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {apps.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
                        No apps found
                      </td>
                    </tr>
                  ) : (
                    apps.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={selectedApps.includes(app.id)}
                            onChange={(e) => handleSelectApp(app.id, e.target.checked)}
                            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 h-3 w-3 bg-white dark:bg-gray-700"
                          />
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-900 dark:text-gray-300">{app.id}</td>
                        <td className="px-4 py-2">
                          <img
                            src={app.avatar || '/api/placeholder/24/24'} onError={(e) => { console.log('❌ Avatar load failed for user:', app.avatar || '/api/placeholder/24/24'); e.currentTarget.src = '/default-avatar.svg'; }}
                            alt={app.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-900 dark:text-gray-300">{app.name}</td>
                        <td className="px-4 py-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                          <a href={app.website} target="_blank" rel="noopener noreferrer">
                            {app.website}
                          </a>
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-900 dark:text-gray-300 truncate max-w-xs">
                          {app.callbackUrl}
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-900 dark:text-gray-300 truncate max-w-xs">
                          {app.description}
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-900 dark:text-gray-300">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => alert(`Edit app: ${app.name}`)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteApp(app.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
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
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Results Count */}
              <div className="text-xs text-gray-700 dark:text-gray-300">
                Showing 1 out of {totalApps}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedApps.length === 0}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    selectedApps.length === 0
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
                  }`}
                >
                  Delete Selected
                </button>

                {/* Pagination */}
                <div className="flex items-center gap-1">
                  <button
                    className="p-1.5 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    disabled={true}
                  >
                    <svg className="w-3 h-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    className="p-1.5 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    disabled={true}
                  >
                    <svg className="w-3 h-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
};

export default ManageApps;
