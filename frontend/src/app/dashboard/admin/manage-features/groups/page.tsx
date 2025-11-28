'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { adminApi } from '@/utils/adminApi';

interface Group {
  id: string;
  _id?: string;
  groupName: string;
  name?: string;
  url?: string;
  slug?: string;
  owner: string;
  ownerName?: string;
  createdBy?: any;
  ownerAvatar: string;
  category: string;
  categoryName?: string;
  members: number;
  membersCount?: number;
  followers?: string[];
}

const Groups = () => {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGroupsCount, setTotalGroupsCount] = useState(0);
  const [joinedGroups, setJoinedGroups] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [joinRequests, setJoinRequests] = useState(0);

  useEffect(() => {
    fetchGroups();
  }, [currentPage]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getGroups();
      
      if (data.success && data.groups) {
        // Transform API data to match Group interface
        const transformedGroups: Group[] = data.groups.map((group: any) => ({
          id: group._id?.toString() || group.id || '',
          _id: group._id?.toString() || group.id,
          groupName: group.name || group.groupName || 'Unnamed Group',
          name: group.name || group.groupName,
          url: group.url || group.slug || group._id?.toString() || group.id,
          slug: group.slug || group.url || group._id?.toString() || group.id,
          owner: group.createdBy?.name || group.ownerName || group.owner || 'Unknown',
          ownerName: group.createdBy?.name || group.ownerName || group.owner,
          createdBy: group.createdBy,
          ownerAvatar: group.createdBy?.avatar || group.ownerAvatar || '/default-avatar.svg',
          category: group.categoryName || group.category || 'Other',
          categoryName: group.categoryName || group.category,
          members: group.membersCount || group.members?.length || group.followers?.length || 0,
          membersCount: group.membersCount || group.members?.length || group.followers?.length || 0,
          followers: group.followers || group.members || []
        }));
        
        setGroups(transformedGroups);
        setTotalGroupsCount(data.totalGroups || transformedGroups.length);
        
        // Calculate stats
        // TODO: Fetch these from a separate stats endpoint if available
        setJoinedGroups(0);
        setTotalPosts(0);
        setJoinRequests(0);
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError(err instanceof Error ? err.message : 'Failed to load groups');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter groups based on search term
  const filteredGroups = searchTerm.trim()
    ? groups.filter((group) =>
        group.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.owner.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : groups;

  const handleSearch = () => {
    // Search is handled by filteredGroups computed value
    // For server-side search, you would call fetchGroups with search params here
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedGroups(filteredGroups.map((group: Group) => group.id));
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

  const handleDeleteSelected = async () => {
    if (selectedGroups.length > 0) {
      if (confirm(`Are you sure you want to delete ${selectedGroups.length} selected group(s)?`)) {
        try {
          // TODO: Implement bulk delete API call
          // await adminApi.deleteGroups(selectedGroups);
          setGroups(prev => prev.filter((group: Group) => !selectedGroups.includes(group.id)));
          setSelectedGroups([]);
          alert('Selected groups deleted successfully!');
          fetchGroups(); // Refresh the list
        } catch (error) {
          console.error('Error deleting groups:', error);
          alert('Failed to delete groups. Please try again.');
        }
      }
    } else {
      alert('Please select groups to delete.');
    }
  };

  const handleEditGroup = (groupId: string) => {
    // TODO: Navigate to edit group or open edit modal
    alert(`Edit group with ID: ${groupId}`);
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (confirm('Are you sure you want to delete this group?')) {
      try {
        // TODO: Implement delete API call
        // await adminApi.deleteGroup(groupId);
        setGroups(prev => prev.filter((group: Group) => group.id !== groupId));
        setSelectedGroups(prev => prev.filter((id: string) => id !== groupId));
        alert('Group deleted successfully!');
        fetchGroups(); // Refresh the list
      } catch (error) {
        console.error('Error deleting group:', error);
        alert('Failed to delete group. Please try again.');
      }
    }
  };

  const isAllSelected = selectedGroups.length === filteredGroups.length && filteredGroups.length > 0;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-2 sm:py-4`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
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
                  <span className={`ml-1 text-xs font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    Groups
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Page Title */}
          <h1 className={`text-lg sm:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3 sm:mb-4`}>
            Groups
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-2 sm:p-4`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'} rounded-full flex items-center justify-center`}>
                    <svg className={`w-3 h-3 sm:w-4 sm:h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>TOTAL GROUPS</p>
                  <p className={`text-sm sm:text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{totalGroupsCount}</p>
                </div>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-2 sm:p-4`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'} rounded-full flex items-center justify-center`}>
                    <svg className={`w-3 h-3 sm:w-4 sm:h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                    </svg>
                  </div>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>JOINED GROUPS</p>
                  <p className={`text-sm sm:text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{joinedGroups}</p>
                </div>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-2 sm:p-4`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'} rounded-full flex items-center justify-center`}>
                    <svg className={`w-3 h-3 sm:w-4 sm:h-4 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>TOTAL POSTS</p>
                  <p className={`text-sm sm:text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{totalPosts}</p>
                </div>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-2 sm:p-4`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-100'} rounded-full flex items-center justify-center`}>
                    <svg className={`w-3 h-3 sm:w-4 sm:h-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>JOIN REQUESTS</p>
                  <p className={`text-sm sm:text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{joinRequests}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border`}>
            {/* Header Section */}
            <div className={`p-3 sm:p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2 sm:mb-3`}>
                Manage & Edit Groups
              </h2>

              {/* Search Section */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <label htmlFor="search" className={`block text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Search for group ID, group name, group title.
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
              <table className="w-full min-w-[600px]">
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
                    <th className="px-3 py-2 text-left">
                      <div className="flex items-center gap-1">
                        <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>GROUP NAME</span>
                        <svg className={`w-3 h-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </th>
                    <th className={`px-3 py-2 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>
                      OWNER
                    </th>
                    <th className="px-3 py-2 text-left">
                      <div className="flex items-center gap-1">
                        <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>CATEGORY</span>
                        <svg className={`w-3 h-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </th>
                    <th className={`px-3 py-2 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>
                      MEMBERS
                    </th>
                    <th className={`px-3 py-2 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className={`px-3 py-8 text-center text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div className="flex items-center justify-center">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
                          <span>Loading groups...</span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={7} className={`px-3 py-8 text-center text-xs ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
                        {error}
                      </td>
                    </tr>
                  ) : filteredGroups.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={`px-3 py-8 text-center text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {searchTerm ? 'No groups found matching your search.' : 'No groups available.'}
                      </td>
                    </tr>
                  ) : (
                    filteredGroups.map((group) => (
                      <tr key={group.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selectedGroups.includes(group.id)}
                            onChange={(e) => handleSelectGroup(group.id, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3 w-3"
                          />
                        </td>
                        <td className={`px-3 py-2 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-900'} font-medium`}>{group.id}</td>
                        <td className="px-3 py-2">
                          <span 
                            className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} font-medium cursor-pointer hover:underline`}
                            onClick={() => {
                              const groupIdentifier = group.url || group.slug || group.id;
                              router.push(`/dashboard/groups/${groupIdentifier}`);
                            }}
                          >
                            {group.groupName}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={group.ownerAvatar}
                              alt={group.owner}
                              className="w-5 h-5 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/default-avatar.svg';
                              }}
                            />
                            <span className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{group.owner}</span>
                          </div>
                        </td>
                        <td className={`px-3 py-2`}>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{group.category}</span>
                        </td>
                        <td className={`px-3 py-2 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{group.members}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditGroup(group.id)}
                              className={`text-xs ${isDarkMode ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'} px-2 py-1 rounded transition-colors`}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteGroup(group.id)}
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
                Showing {filteredGroups.length} out of {totalGroupsCount}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedGroups.length === 0}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    selectedGroups.length === 0
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
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || loading}
                    className={`p-1.5 rounded-md border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} ${
                      currentPage === 1 || loading
                        ? 'cursor-not-allowed opacity-50'
                        : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <svg className={`w-3 h-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className={`px-2 py-1 text-xs ${isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'} rounded`}>{currentPage}</span>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || totalPages === 0 || loading}
                    className={`p-1.5 rounded-md border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} ${
                      currentPage === totalPages || totalPages === 0 || loading
                        ? 'cursor-not-allowed opacity-50'
                        : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <svg className={`w-3 h-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
