'use client';

import { useState } from 'react';

interface Group {
  id: string;
  groupName: string;
  owner: string;
  ownerAvatar: string;
  category: string;
  members: number;
}

const Groups = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [groups, setGroups] = useState<Group[]>([
    // Sample data - replace with actual data from API
    // {
    //   id: '1',
    //   groupName: 'Sample Group',
    //   owner: 'john_doe',
    //   ownerAvatar: '/api/placeholder/24/24',
    //   category: 'General',
    //   members: 150
    // }
  ]);

  const handleSearch = () => {
    console.log('Searching for:', searchTerm);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedGroups(groups.map((group: Group) => group.id));
    } else {
      setSelectedGroups([]);
    }
  };

  const handleSelectGroup = (groupId: string, checked: boolean) => {
    if (checked) {
      setSelectedGroups(prev => [...prev, groupId]);
    } else {
      setSelectedGroups(prev => prev.filter((id: string) => id !== groupId));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedGroups.length > 0) {
      if (confirm(`Are you sure you want to delete ${selectedGroups.length} selected group(s)?`)) {
        setGroups(prev => prev.filter((group: Group) => !selectedGroups.includes(group.id)));
        setSelectedGroups([]);
        alert('Selected groups deleted successfully!');
      }
    } else {
      alert('Please select groups to delete.');
    }
  };

  const handleEditGroup = (groupId: string) => {
    alert(`Edit group with ID: ${groupId}`);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (confirm('Are you sure you want to delete this group?')) {
      setGroups(prev => prev.filter((group: Group) => group.id !== groupId));
      setSelectedGroups(prev => prev.filter((id: string) => id !== groupId));
      alert('Group deleted successfully!');
    }
  };

  const totalGroups = groups.length;
  const isAllSelected = selectedGroups.length === totalGroups && totalGroups > 0;

  // Stats
  const totalGroupsCount = 0;
  const joinedGroups = 0;
  const totalPosts = 0;
  const joinRequests = 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-2 sm:py-4">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
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
                  <span className="ml-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                    Groups
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Page Title */}
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Groups
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2 sm:p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">TOTAL GROUPS</p>
                  <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">{totalGroupsCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2 sm:p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                    </svg>
                  </div>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">JOINED GROUPS</p>
                  <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">{joinedGroups}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2 sm:p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">TOTAL POSTS</p>
                  <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">{totalPosts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2 sm:p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">JOIN REQUESTS</p>
                  <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">{joinRequests}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Header Section */}
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                Manage & Edit Groups
              </h2>

              {/* Search Section */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <label htmlFor="search" className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
                    Search for group ID, group name, group title.
                  </label>
                  <input
                    id="search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleSearch}
                    className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium py-1.5 px-4 text-xs rounded-md transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-3 py-2 text-left">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 h-3 w-3 bg-white dark:bg-gray-700"
                      />
                    </th>
                    <th className="px-3 py-2 text-left">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ID</span>
                        <svg className="w-3 h-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">GROUP NAME</span>
                        <svg className="w-3 h-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      OWNER
                    </th>
                    <th className="px-3 py-2 text-left">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">CATEGORY</span>
                        <svg className="w-3 h-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      MEMBERS
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {groups.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-xs text-gray-500">
                        No groups found
                      </td>
                    </tr>
                  ) : (
                    groups.map((group) => (
                      <tr key={group.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selectedGroups.includes(group.id)}
                            onChange={(e) => handleSelectGroup(group.id, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3 w-3"
                          />
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-900 font-medium">{group.id}</td>
                        <td className="px-3 py-2">
                          <span className="text-xs text-blue-600 font-medium">{group.groupName}</span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={group.ownerAvatar}
                              alt={group.owner}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="text-xs text-blue-600">{group.owner}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-xs text-gray-600">{group.category}</span>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-900">{group.members}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditGroup(group.id)}
                              className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteGroup(group.id)}
                              className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 transition-colors"
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
            <div className="px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
              {/* Results Count */}
              <div className="text-xs text-gray-700">
                Showing 1 out of 0
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedGroups.length === 0}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    selectedGroups.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Delete Selected
                </button>

                {/* Pagination */}
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-50" disabled>
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-50" disabled>
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default Groups;
