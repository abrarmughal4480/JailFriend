"use client";
import React, { useState, useEffect } from 'react';
import { Search, Settings, UserPlus, Users, RefreshCw } from 'lucide-react';
import { useSystemThemeOverride } from '@/hooks/useSystemThemeOverride';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface User {
  _id: string;
  name: string;
  avatar: string;
  username: string;
  isOnline: boolean;
  isVerified?: boolean;
}

interface FollowersSidebarProps {
  isAdminPage?: boolean;
}

const FollowersSidebar: React.FC<FollowersSidebarProps> = ({ isAdminPage = false }) => {
  // Ensure system dark mode has no effect
  useSystemThemeOverride();
  
  const { isDarkMode } = useDarkMode();
  
  const [followers, setFollowers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [userStatus, setUserStatus] = useState<'online' | 'offline'>('online');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Fetch following users from API
  useEffect(() => {
    const fetchFollowers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          console.log('🔍 Fetching following users...');
          // Get current user's following list
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/users/following/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('📡 Following API response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Following users fetched:', data);
            setFollowers(data.following || []);
            setDebugInfo({
              status: 'success',
              data: data
            });
          } else {
            const errorData = await response.json();
            console.error('❌ Following API error:', errorData);
            setDebugInfo({
              status: 'error',
              error: errorData,
              statusCode: response.status
            });
            // Fallback to mock data
            setFollowers([
              {
                _id: '1',
                name: 'Sarah Johnson',
                username: 'sarah_j',
                avatar: '/avatars/1.png.png',
                isOnline: true,
                isVerified: true
              },
              {
                _id: '2',
                name: 'Mike Chen',
                username: 'mike_chen',
                avatar: '/avatars/2.png.png',
                isOnline: false
              },
              {
                _id: '3',
                name: 'Emma Wilson',
                username: 'emma_w',
                avatar: '/avatars/3.png.png',
                isOnline: true
              },
              {
                _id: '4',
                name: 'David Brown',
                username: 'david_b',
                avatar: '/avatars/4.png.png',
                isOnline: true,
                isVerified: true
              },
              {
                _id: '5',
                name: 'Lisa Garcia',
                username: 'lisa_g',
                avatar: '/avatars/5.pmg.png',
                isOnline: false
              }
            ]);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching followers:', error);
        // Fallback to mock data
        setFollowers([
          {
            _id: '1',
            name: 'Sarah Johnson',
            username: 'sarah_j',
            avatar: '/avatars/1.png.png',
            isOnline: true,
            isVerified: true
          },
          {
            _id: '2',
            name: 'Mike Chen',
            username: 'mike_chen',
            avatar: '/avatars/2.png.png',
            isOnline: false
          },
          {
            _id: '3',
            name: 'Emma Wilson',
            username: 'emma_w',
            avatar: '/avatars/3.png.png',
            isOnline: true
          },
          {
            _id: '4',
            name: 'David Brown',
            username: 'david_b',
            avatar: '/avatars/4.png.png',
            isOnline: true,
            isVerified: true
          },
          {
            _id: '5',
            name: 'Lisa Garcia',
            username: 'lisa_g',
            avatar: '/avatars/5.pmg.png',
            isOnline: false
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, []);

  const refreshFollowing = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('🔄 Refreshing following users...');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/users/following/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Following users refreshed:', data);
          setFollowers(data.following || []);
        } else {
          console.error('❌ Failed to refresh following users');
        }
      }
    } catch (error) {
      console.error('❌ Error refreshing following users:', error);
    } finally {
      setRefreshing(false);
    }
  };
  const filteredFollowers = followers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusChange = (status: 'online' | 'offline') => {
    setUserStatus(status);
    setShowStatusMenu(false);
    // Here you would typically make an API call to update user status
  };

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedUsers.length > 0) {
      // Here you would make an API call to create the group
      console.log('Creating group:', groupName, 'with users:', selectedUsers);
      setShowCreateGroup(false);
      setGroupName('');
      setSelectedUsers([]);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/users/search?q=${encodeURIComponent(query)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
        }
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Don't show sidebar on admin pages
  if (isAdminPage) {
    return null;
  }

  return (
    <>
      {/* Followers Sidebar - Hidden on mobile */}
      <div className={`fixed right-0 top-16 h-[calc(100vh-4rem)] w-20 border-l z-10 flex flex-col items-center py-6 shadow-lg hidden md:flex ${
        isDarkMode 
          ? 'bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700' 
          : 'bg-gradient-to-b from-blue-50 to-indigo-100 border-blue-200'
      }`}>
        {/* Settings Icon */}
        <div className="relative mb-6">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-all duration-200 border-2 ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 border-gray-600' 
                : 'bg-white hover:bg-blue-50 border-blue-200'
            }`}
          >
            <Settings className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </button>
          {/* Status Dropdown */}
          {showStatusMenu && (
            <div className={`absolute right-14 top-0 rounded-xl shadow-2xl border p-3 min-w-[140px] animate-in slide-in-from-right-2 transition-colors duration-200 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-blue-200'
            }`}>
              <div className={`text-xs font-semibold mb-2 transition-colors duration-200 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>Status</div>
              <div className="space-y-1">
                <button
                  onClick={() => handleStatusChange('online')}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 text-left rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-green-50'
                  }`}
                >
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className={`text-sm font-medium transition-colors duration-200 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Online</span>
                </button>
                <button
                  onClick={() => handleStatusChange('offline')}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 text-left rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className={`text-sm font-medium transition-colors duration-200 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Offline</span>
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Removed Add User Icon and Brand Logo (red J avatar) from right sidebar */}

        {/* Followers List */}
        <div className="flex-1 overflow-y-auto space-y-4 px-2 scrollbar-hide">
          {loading ? (
            <div className="flex justify-center">
              <div className={`animate-spin rounded-full h-6 w-6 border-b-2 transition-colors duration-200 ${
                isDarkMode ? 'border-gray-400' : 'border-gray-600'
              }`}></div>
            </div>
          ) : filteredFollowers.length === 0 ? (
            <div className="text-center py-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors duration-200 ${
                isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
              }`}>
                <Users className={`w-6 h-6 transition-colors duration-200 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <div className={`text-xs mb-2 font-medium transition-colors duration-200 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                No following users
              </div>
              <div className={`text-xs mb-3 transition-colors duration-200 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                Follow people to see them here
              </div>
              <button
                onClick={() => window.open('/dashboard/explore', '_blank')}
                className={`text-xs underline px-3 py-1.5 rounded-full transition-colors duration-200 ${
                  isDarkMode 
                    ? 'text-blue-400 hover:text-blue-300 bg-blue-900' 
                    : 'text-blue-500 hover:text-blue-600 bg-blue-50'
                }`}
              >
                Find people to follow
              </button>
            </div>
          ) : (
            filteredFollowers.map((user) => (
              <div
                key={user._id}
                className="relative group cursor-pointer"
                title={`${user.name} (@${user.username})`}
                onClick={() => window.open(`/dashboard/profile/${user._id}`, '_blank')}
              >
                <div className={`w-12 h-12 rounded-full shadow-lg overflow-hidden relative border-2 hover:scale-105 transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 hover:border-gray-500' 
                    : 'bg-white border-blue-200 hover:border-blue-400'
                }`}>
                  <img
                    src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/${user.avatar}`) : '/default-avatar.svg'}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('❌ FollowersSidebar avatar load failed for user:', user.name, 'URL:', user.avatar);
                      e.currentTarget.src = '/default-avatar.svg';
                    }}
                  />
                  {/* Online Status Indicator */}
                  {user.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                  )}
                  {/* Verified Badge */}
                  {user.isVerified && (
                    <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                </div>
                
                {/* Hover Tooltip */}
                <div className={`absolute left-14 top-0 text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl border transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-800 text-white border-gray-700' 
                    : 'bg-gray-900 text-white border-gray-700'
                }`}>
                  <div className={`font-semibold text-sm transition-colors duration-200 ${
                    isDarkMode ? 'text-white' : 'text-white'
                  }`}>{user.name}</div>
                  <div className={`text-xs transition-colors duration-200 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>@{user.username}</div>
                  {user.isOnline && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-400">Online</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Refresh Button */}
        <button 
          onClick={refreshFollowing}
          disabled={refreshing}
          className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-all duration-200 disabled:opacity-50 border-2 mb-4 transition-colors duration-200 ${
            isDarkMode 
              ? 'bg-gray-700 hover:bg-gray-600 border-gray-600' 
              : 'bg-white hover:bg-blue-50 border-blue-200'
          }`}
          title="Refresh following list"
        >
          <RefreshCw className={`w-5 h-5 transition-colors duration-200 ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          } ${refreshing ? 'animate-spin' : ''}`} />
        </button>

        {/* Search Icon */}
        <button 
          onClick={() => setShowSearchModal(true)}
          className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-all duration-200 border-2 transition-colors duration-200 ${
            isDarkMode 
              ? 'bg-gray-700 hover:bg-gray-600 border-gray-600' 
              : 'bg-white hover:bg-blue-50 border-blue-200'
          }`}
        >
          <Search className={`w-5 h-5 transition-colors duration-200 ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`} />
        </button>
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 w-96 max-w-[90vw] transition-colors duration-200 ${
            isDarkMode 
              ? 'bg-gray-800' 
              : 'bg-white'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 transition-colors duration-200 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Create a group chat</h3>
            
            {/* Group Avatar */}
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-200 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <span className={`transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>📷</span>
              </div>
              
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                    isDarkMode 
                      ? 'border-gray-600 text-white placeholder-gray-400 bg-gray-700' 
                      : 'border-gray-300 text-gray-900 placeholder-gray-500 bg-white'
                  }`}
                />
              </div>
            </div>
            
            {/* Participants */}
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Add participant ({selectedUsers.length})
              </label>
              <div className="max-h-32 overflow-y-auto space-y-2 scrollbar-hide">
                {followers.map((user) => (
                  <label key={user._id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => toggleUserSelection(user._id)}
                      className={`rounded transition-colors duration-200 ${
                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      }`}
                    />
                    <img
                      src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/${user.avatar}`) : '/default-avatar.svg'}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover"
                      onError={(e) => {
                        console.log('❌ Group creation avatar load failed for user:', user.name, 'URL:', user.avatar);
                        e.currentTarget.src = '/default-avatar.svg';
                      }}
                    />
                    <span className={`text-sm transition-colors duration-200 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>{user.name}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreateGroup(false)}
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || selectedUsers.length === 0}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-xl p-6 w-96 max-w-[90vw] shadow-2xl border transition-colors duration-200 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-blue-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold transition-colors duration-200 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Search for users</h3>
              <button
                onClick={() => setShowSearchModal(false)}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200 border-gray-600 hover:bg-gray-700' 
                    : 'text-gray-400 hover:text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Search Input */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className={`h-5 w-5 transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-400'
                }`} />
              </div>
              <input
                type="text"
                placeholder="Search for users"
                onChange={(e) => handleSearch(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  isDarkMode 
                    ? 'border-gray-600 text-white placeholder-gray-400 bg-gray-700' 
                    : 'border-gray-300 text-gray-900 placeholder-gray-500 bg-gray-50'
                }`}
                autoFocus
              />
            </div>
            
            {/* Search Results */}
            <div className="max-h-64 overflow-y-auto scrollbar-hide">
              {searchLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600"></div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((user) => (
                    <div
                      key={user._id}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border border-transparent hover:border-blue-200 transition-all duration-200 ${
                        isDarkMode 
                          ? 'hover:bg-gray-700' 
                          : 'hover:bg-blue-50'
                      }`}
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full border-2 border-blue-200"
                      />
                      <div className="flex-1">
                        <div className={`font-semibold text-sm transition-colors duration-200 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{user.name}</div>
                        <div className={`text-xs transition-colors duration-200 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>@{user.username}</div>
                      </div>
                      {user.isOnline && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-500">Online</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : searchQuery && !searchLoading ? (
                <div className={`text-center py-8 transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  No users found
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FollowersSidebar; 
