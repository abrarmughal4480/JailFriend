"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useHeight } from '../app/dashboard/layout';
import { useDarkMode } from '../contexts/DarkModeContext';

interface User {
  _id: string;
  name: string;
  avatar: string;
  username: string;
  isOnline: boolean;
  isVerified?: boolean;
}

interface Group {
  _id: string;
  name: string;
  avatar: string;
  participants: User[];
  isGroup: boolean;
  createdAt: string;
}

interface FollowersSidebarProps {
  isAdminPage?: boolean;
}

const FollowersSidebar: React.FC<FollowersSidebarProps> = ({ isAdminPage = false }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { remainingHeight, headerHeight } = useHeight();
  const { isDarkMode, isSystemMode } = useDarkMode();
  
  // Check if current route is messages page
  const isMessagesPage = pathname.startsWith('/dashboard/messages');
  const [followers, setFollowers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [userStatus, setUserStatus] = useState<'online' | 'offline'>('online');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [participantSearch, setParticipantSearch] = useState('');
  const [showParticipantDropdown, setShowParticipantDropdown] = useState(false);
  
  // Refs for dynamic positioning
  const participantInputRef = useRef<HTMLInputElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});


  // Dynamic dropdown positioning
  useEffect(() => {
    const calculateDropdownPosition = () => {
      if (showParticipantDropdown && participantInputRef.current) {
        const inputRect = participantInputRef.current.getBoundingClientRect();
        setDropdownStyle({
          position: 'fixed',
          top: inputRect.bottom + window.scrollY + 4, // 4px spacing below input
          left: inputRect.left + window.scrollX,
          width: inputRect.width,
          zIndex: 102, // Ensure it's higher than modal and its overlay
          opacity: 1, // Ensure it's visible when positioned
        });
      } else {
        setDropdownStyle({ opacity: 0 });
      }
    };

    // Add small delay to prevent flash
    const timeoutId = setTimeout(() => {
      calculateDropdownPosition();
    }, 10);

    // Recalculate on scroll or resize
    window.addEventListener('resize', calculateDropdownPosition);
    window.addEventListener('scroll', calculateDropdownPosition);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', calculateDropdownPosition);
      window.removeEventListener('scroll', calculateDropdownPosition);
    };
  }, [showParticipantDropdown, participantSearch, followers]);

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Calculate sidebar height and position based on header visibility
  const sidebarHeight = isMessagesPage ? '100vh' : `calc(100vh - ${headerHeight}px)`;
  const sidebarTop = isMessagesPage ? '0' : `${headerHeight}px`;

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showCreateGroup || showSearchModal) {
      // Disable scrolling
      document.body.style.overflow = 'hidden';
      // Prevent scroll on mobile
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      // Re-enable scrolling
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    };
  }, [showCreateGroup, showSearchModal]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Close status menu if clicking outside
      if (showStatusMenu && !target.closest('.status-menu-container')) {
        setShowStatusMenu(false);
      }
      
      // Close search modal if clicking outside
      if (showSearchModal && !target.closest('.search-modal-container')) {
        setShowSearchModal(false);
      }
      
      // Close create group modal if clicking outside (but not on dropdown items)
      if (showCreateGroup && !target.closest('.create-group-container') && !target.closest('.participant-dropdown-container')) {
        setShowCreateGroup(false);
      }
      
      // Close participant dropdown if clicking outside
      // Check if the click is not on the dropdown itself or its items
      if (showParticipantDropdown && 
          !target.closest('.participant-dropdown-container') && 
          !target.closest('[data-dropdown-item]')) {
        setShowParticipantDropdown(false);
      }
    };

    if (showStatusMenu || showSearchModal || showCreateGroup || showParticipantDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusMenu, showSearchModal, showCreateGroup, showParticipantDropdown]);

  // Fetch chat groups from API
  const fetchChatGroups = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // console.log('💬 Fetching chat groups...');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/chat`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const chatGroups = await response.json();
          // console.log('✅ Chat groups fetched:', chatGroups);
          setGroups(chatGroups);
        } else {
          console.error('❌ Error fetching chat groups:', response.status);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching chat groups:', error);
    }
  }, []);

  // Fetch followers and following users from API
  const fetchUsers = useCallback(async (isInitial = false) => {
    // Only show loading skeleton on initial load
    if (isInitial) {
      setLoading(true);
    }
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Fetch both followers and following in parallel
        const [followersResponse, followingResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/followers/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/following/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        ]);
        
        let allUsers: User[] = [];
        
        // Process followers
        if (followersResponse.ok) {
          const followersData = await followersResponse.json();
          const { followers: followersList = [] } = followersData;
          const mappedFollowers = followersList.map((user: any) => ({
            _id: user._id || user.id,
            name: user.name || user.fullName || 'Unknown User',
            username: user.username || `@${(user._id || user.id).toString().slice(-8)}`,
            avatar: user.avatar || '/default-avatar.svg',
            isOnline: user.isOnline || false,
            isVerified: user.isVerified || false
          }));
          allUsers = [...allUsers, ...mappedFollowers];
        }
        
        // Process following
        if (followingResponse.ok) {
          const followingData = await followingResponse.json();
          const { following: followingList = [] } = followingData;
          const mappedFollowing = followingList.map((user: any) => ({
            _id: user._id || user.id,
            name: user.name || user.fullName || 'Unknown User',
            username: user.username || `@${(user._id || user.id).toString().slice(-8)}`,
            avatar: user.avatar || '/default-avatar.svg',
            isOnline: user.isOnline || false,
            isVerified: user.isVerified || false
          }));
          
          // Merge following with followers, avoiding duplicates
          const existingIds = new Set(allUsers.map(u => u._id.toString()));
          const uniqueFollowing = mappedFollowing.filter((user: any) => 
            !existingIds.has(user._id.toString())
          );
          allUsers = [...allUsers, ...uniqueFollowing];
        }
        
        // Remove duplicates based on _id
        const uniqueUsers = allUsers.reduce((acc, user) => {
          const exists = acc.some(u => u._id.toString() === user._id.toString());
          if (!exists) {
            acc.push(user);
          }
          return acc;
        }, [] as User[]);
        
        setFollowers(uniqueUsers);
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      // Silent error handling - don't set fallback data
      setFollowers([]);
    } finally {
      // Only set loading to false on initial load
      if (isInitial) {
        setLoading(false);
        setIsInitialLoad(false);
      }
    }
  }, []);

  // Initial fetch and set up refresh interval
  useEffect(() => {
    // Initial fetch with loading skeleton
    fetchUsers(true);
    fetchChatGroups(); // Also fetch chat groups
    
    // Set up 5-second interval for automatic refresh (silent)
    const interval = setInterval(() => {
      fetchUsers(false);
      fetchChatGroups(); // Refresh chat groups too
    }, 5000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [fetchUsers, fetchChatGroups]);

  // Automatically refresh when system theme changes
  useEffect(() => {
    // Only refresh when in system mode and theme changes
    if (isSystemMode) {
      // Trigger a silent refresh when theme changes
      fetchUsers(false);
      fetchChatGroups();
    }
  }, [isDarkMode, isSystemMode, fetchUsers, fetchChatGroups]);

  const filteredFollowers = followers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusChange = (status: 'online' | 'offline') => {
    setUserStatus(status);
    setShowStatusMenu(false);
    // Here you would typically make an API call to update user status
  };

  const handleCreateGroup = async () => {
    if (groupName.trim() && selectedUsers.length > 0) {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // console.log('💬 Creating chat group:', groupName, 'with users:', selectedUsers);
          
          // Make API call to create the group
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/chat`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: groupName.trim(),
              participants: selectedUsers
            })
          });

          if (response.ok) {
            const data = await response.json();
            // console.log('✅ Group created successfully:', data);
            
            // Add group to the groups list (at the top)
            setGroups(prevGroups => [data.group, ...prevGroups]);
            
            // Show success message
            // console.log('✅ Chat group created successfully!');
          } else {
            const errorData = await response.json();
            console.error('❌ Error creating group:', errorData);
            alert('Failed to create group: ' + (errorData.error || 'Unknown error'));
          }

          // Reset form
          setShowCreateGroup(false);
          setGroupName('');
          setSelectedUsers([]);
          setParticipantSearch('');
          setShowParticipantDropdown(false);
        }
      } catch (error) {
        console.error('❌ Error creating group:', error);
        alert('Failed to create group: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Filter followers based on search query
  const filteredFollowersForGroup = participantSearch.trim() === '' 
    ? followers 
    : followers.filter(user =>
        (user.name && user.name.toLowerCase().includes(participantSearch.toLowerCase())) ||
        (user.username && user.username.toLowerCase().includes(participantSearch.toLowerCase()))
      );

  // Debug: Log followers and filtered results
  // console.log('🔍 All followers:', followers);
  // console.log('🔍 Participant search:', participantSearch);
  // console.log('🔍 Filtered followers for group:', filteredFollowersForGroup);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/search?q=${encodeURIComponent(query)}`, {
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

  // Don't render sidebar on messages page
  if (isMessagesPage) {
    return null;
  }

  return (
    <>
      {/* Followers Sidebar - Hidden on mobile */}
      <div className={`fixed right-0 w-20 z-10 flex flex-col shadow-lg hidden md:flex transition-colors duration-200 ${
        isDarkMode 
          ? 'bg-gray-800 border-l border-gray-700' 
          : 'bg-white border-l border-gray-200'
      }`} style={{ height: sidebarHeight, top: sidebarTop }}>
        
        {/* Section 1: Top Controls */}
        <div className="flex flex-col items-center py-6 space-y-4">
          {/* Settings Icon */}
          <div className="relative status-menu-container">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-all duration-200 ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <svg className={`w-5 h-5 transition-colors duration-200 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M13.5,10A1.5,1.5 0 0,1 12,11.5C11.16,11.5 10.5,10.83 10.5,10A1.5,1.5 0 0,1 12,8.5A1.5,1.5 0 0,1 13.5,10M22,4V16A2,2 0 0,1 20,18H6L2,22V4A2,2 0 0,1 4,2H20A2,2 0 0,1 22,4M16.77,11.32L15.7,10.5C15.71,10.33 15.71,10.16 15.7,10C15.72,9.84 15.72,9.67 15.7,9.5L16.76,8.68C16.85,8.6 16.88,8.47 16.82,8.36L15.82,6.63C15.76,6.5 15.63,6.47 15.5,6.5L14.27,7C14,6.8 13.73,6.63 13.42,6.5L13.23,5.19C13.21,5.08 13.11,5 13,5H11C10.88,5 10.77,5.09 10.75,5.21L10.56,6.53C10.26,6.65 9.97,6.81 9.7,7L8.46,6.5C8.34,6.46 8.21,6.5 8.15,6.61L7.15,8.34C7.09,8.45 7.11,8.58 7.21,8.66L8.27,9.5C8.23,9.82 8.23,10.16 8.27,10.5L7.21,11.32C7.12,11.4 7.09,11.53 7.15,11.64L8.15,13.37C8.21,13.5 8.34,13.53 8.46,13.5L9.7,13C9.96,13.2 10.24,13.37 10.55,13.5L10.74,14.81C10.77,14.93 10.88,15 11,15H13C13.12,15 13.23,14.91 13.25,14.79L13.44,13.47C13.74,13.34 14,13.18 14.28,13L15.53,13.5C15.65,13.5 15.78,13.5 15.84,13.37L16.84,11.64C16.9,11.53 16.87,11.4 16.77,11.32Z" />
            </svg>
          </button>
          {/* Status Dropdown */}
          {showStatusMenu && (
            <div className={`absolute right-14 top-0 rounded-lg shadow-2xl border p-2 min-w-[120px] animate-in slide-in-from-right-2 transition-colors duration-200 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="space-y-1">
                <button
                  onClick={() => handleStatusChange('online')}
                  className={`flex items-center gap-2 w-full px-2 py-1.5 text-left rounded transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className={`text-xs font-medium transition-colors duration-200 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Online</span>
                </button>
                <button
                  onClick={() => handleStatusChange('offline')}
                  className={`flex items-center gap-2 w-full px-2 py-1.5 text-left rounded transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="w-2.5 h-2.5 bg-gray-400 rounded-full"></div>
                  <span className={`text-xs font-medium transition-colors duration-200 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Offline</span>
                </button>
              </div>
            </div>
          )}
          </div>
          
          {/* Create Group Chat Button */}
          <button 
            onClick={() => setShowCreateGroup(true)}
            className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800 transition-all duration-200 cursor-pointer"
            title="Create a group chat"
          >
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13,13C11,13 7,14 7,16V18H19V16C19,14 15,13 13,13M19.62,13.16C20.45,13.88 21,14.82 21,16V18H24V16C24,14.46 21.63,13.5 19.62,13.16M13,11A3,3 0 0,0 16,8A3,3 0 0,0 13,5A3,3 0 0,0 10,8A3,3 0 0,0 13,11M18,11A3,3 0 0,0 21,8A3,3 0 0,0 18,5C17.68,5 17.37,5.05 17.08,5.14C17.65,5.95 18,6.94 18,8C18,9.06 17.65,10.04 17.08,10.85C17.37,10.95 17.68,11 18,11M8,10H5V7H3V10H0V12H3V15H5V12H8V10Z" />
            </svg>
          </button>

          {/* Groups Section */}
          {groups.length > 0 && (
            <div className="w-full space-y-2">
              {groups.slice(0, 3).map((group) => (
                <div key={group._id} className="flex justify-center">
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => {
                      console.log('Opening group:', group.name);
                    }}
                  >
                  <div className={`w-12 h-12 rounded-full shadow-lg overflow-hidden relative hover:scale-105 transition-all duration-200 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-white'
                  }`}>
                    <img
                      src={group.avatar}
                      alt={group.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/group.png';
                      }}
                    />
                  </div>
                  
                  {/* Hover Tooltip */}
                  <div className={`absolute right-14 top-0 text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 shadow-xl border ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className={`font-semibold text-sm transition-colors duration-200 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{group.name}</div>
                    <div className={`text-xs transition-colors duration-200 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>{group.participants.length} members</div>
                  </div>
                  </div>
                </div>
              ))}
              {groups.length > 3 && (
                <div className={`text-xs text-center transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>+{groups.length - 3} more</div>
              )}
            </div>
          )}
          
        </div>

        {/* Section 2: Followers List */}
        <div className={`flex-1 space-y-4 px-2 py-4 scrollbar-hide max-h-[calc(100vh-200px)] border-t overflow-y-visible transition-colors duration-200 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-300'
        }`}>
          
          {loading && isInitialLoad ? (
            <div className="space-y-4">
              {/* Skeleton Loading Items */}
              {[...Array(7)].map((_, index) => (
                <div key={index} className="flex justify-center">
                  <div className={`w-12 h-12 rounded-full animate-pulse transition-colors duration-200 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                  }`}></div>
                </div>
              ))}
            </div>
          ) : filteredFollowers.length === 0 ? (
            <div className="space-y-4">
              {/* Skeleton Elements */}
              {[...Array(7)].map((_, index) => (
                <div key={index} className="flex justify-center">
                    <div className={`w-12 h-12 rounded-full transition-colors duration-200 ${
                      isDarkMode
                        ? `bg-gray-700 ${index === 0 ? 'opacity-100' : index === 1 ? 'opacity-90' : index === 2 ? 'opacity-80' : index === 3 ? 'opacity-70' : index === 4 ? 'opacity-60' : index === 5 ? 'opacity-50' : 'opacity-40'}`
                        : `bg-gray-300 ${index === 0 ? 'opacity-100' : index === 1 ? 'opacity-90' : index === 2 ? 'opacity-80' : index === 3 ? 'opacity-70' : index === 4 ? 'opacity-60' : index === 5 ? 'opacity-50' : 'opacity-40'}`
                    }`}></div>
                </div>
              ))}
            </div>
          ) : (
            filteredFollowers.map((user) => (
              <div key={user._id} className="flex justify-center">
                <div
                  className="relative group cursor-pointer"
                  onClick={() => {
                    // Navigate to user profile using Next.js router (no page reload)
                    router.push(`/dashboard/profile/${user._id}`);
                  }}
                >
                  <div className={`w-12 h-12 rounded-full shadow-lg overflow-hidden relative hover:scale-105 transition-all duration-200 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-white'
                  }`}>
                    <img
                      src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL}${user.avatar.startsWith('/') ? user.avatar : '/' + user.avatar}`) : '/default-avatar.svg'}
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
                  <div className={`absolute right-14 top-0 text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 shadow-xl border ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className={`font-semibold text-sm transition-colors duration-200 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{user.name}</div>
                    <div className={`text-xs transition-colors duration-200 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>@{user.username}</div>
                    {user.isOnline && (
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className={`text-xs transition-colors duration-200 ${
                          isDarkMode ? 'text-green-400' : 'text-green-600'
                        }`}>Online</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Section 3: Bottom Controls */}
        <div className="flex flex-col items-center py-6">
          {/* Search Icon */}
          <button 
            onClick={() => setShowSearchModal(true)}
            className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-all duration-200 ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <svg className={`w-5 h-5 transition-colors duration-200 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.5,12C18,12 20,14 20,16.5C20,17.38 19.75,18.21 19.31,18.9L22.39,22L21,23.39L17.88,20.32C17.19,20.75 16.37,21 15.5,21C13,21 11,19 11,16.5C11,14 13,12 15.5,12M15.5,14A2.5,2.5 0 0,0 13,16.5A2.5,2.5 0 0,0 15.5,19A2.5,2.5 0 0,0 18,16.5A2.5,2.5 0 0,0 15.5,14M10,4A4,4 0 0,1 14,8C14,8.91 13.69,9.75 13.18,10.43C12.32,10.75 11.55,11.26 10.91,11.9L10,12A4,4 0 0,1 6,8A4,4 0 0,1 10,4M2,20V18C2,15.88 5.31,14.14 9.5,14C9.18,14.78 9,15.62 9,16.5C9,17.79 9.38,19 10,20H2Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <>
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-2 sm:p-4 bg-black/20 backdrop-blur-md">
            <div className={`create-group-container rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md mx-2 sm:mx-4 transform transition-all duration-300 scale-100 max-h-[95vh] overflow-y-auto border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="p-4 sm:p-6">
                <h3 className={`text-lg sm:text-xl font-semibold mb-2 break-words transition-colors duration-200 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Create a group chat</h3>
            
            {/* Group Avatar */}
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-200 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <svg className={`w-6 h-6 transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.02 5H19V2.98c0-.54-.44-.98-.98-.98h-.03c-.55 0-.99.44-.99.98V5h-2.01c-.54 0-.98.44-.99.98v.03c0 .55.44.99.99.99H17v2.01c0 .54.44.99.99.98h.03c.54 0 .98-.44.98-.98V7h2.02c.54 0 .98-.44.98-.98v-.04c0-.54-.44-.98-.98-.98zM16 9.01V8h-1.01c-.53 0-1.03-.21-1.41-.58-.37-.38-.58-.88-.58-1.44 0-.36.1-.69.27-.98H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8.28c-.3.17-.64.28-1.02.28-1.09-.01-1.98-.9-1.98-1.99zM15.96 19H6c-.41 0-.65-.47-.4-.8l1.98-2.63c.21-.28.62-.26.82.02L10 18l2.61-3.48c.2-.26.59-.27.79-.01l2.95 3.68c.26.33.03.81-.39.81z"/>
                </svg>
              </div>
              
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-opacity-80 transition-colors duration-200 ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
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
              
              {/* Search Field */}
              <div className="relative participant-dropdown-container">
                <input
                  ref={participantInputRef}
                  type="text"
                  placeholder="Search followers..."
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  onFocus={() => setShowParticipantDropdown(true)}
                  className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm hover:bg-opacity-80 transition-colors duration-200 ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              
              {/* Selected Users Display */}
              {selectedUsers.length > 0 && (
                <div className="mt-3">
                  <p className={`text-xs mb-2 transition-colors duration-200 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Selected participants:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map(userId => {
                      const user = followers.find(f => f._id === userId);
                      return user ? (
                        <div key={userId} className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors duration-200 ${
                          isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
                        }`}>
                          <img
                            src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL}${user.avatar.startsWith('/') ? user.avatar : '/' + user.avatar}`) : '/default-avatar.svg'}
                            alt={user.name}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span className={`transition-colors duration-200 ${
                            isDarkMode ? 'text-blue-200' : 'text-blue-800'
                          }`}>{user.name}</span>
                          <button
                            onClick={() => toggleUserSelection(userId)}
                            className={`transition-colors duration-200 ${
                              isDarkMode 
                                ? 'text-blue-400 hover:text-blue-200' 
                                : 'text-blue-600 hover:text-blue-800'
                            }`}
                          >
                            ×
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setShowCreateGroup(false)}
                className={`py-3 px-4 rounded-full font-medium transition-all duration-200 text-sm sm:text-base touch-manipulation ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || selectedUsers.length === 0}
                className={`py-3 px-4 rounded-full font-medium transition-all duration-200 text-sm sm:text-base touch-manipulation text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                Create
              </button>
            </div>
            </div>
          </div>
        </div>
        
        {/* Participant Dropdown - Below Field */}
        {showParticipantDropdown && (
          <div className="fixed inset-0 z-[101] pointer-events-none">
            <div 
              className={`participant-dropdown-container border rounded-xl shadow-2xl max-h-48 overflow-y-auto pointer-events-auto transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-300'
              }`}
              style={{ ...dropdownStyle }}
            >
              {filteredFollowersForGroup.length === 0 ? (
                <div className="p-4 text-center">
                  <p className={`text-sm transition-colors duration-200 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {participantSearch.trim() === '' 
                      ? 'No followers found' 
                      : 'No followers match your search'
                    }
                  </p>
                </div>
              ) : (
                filteredFollowersForGroup.map((user) => (
                  <div
                    key={user._id}
                    data-dropdown-item
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent event bubbling
                      toggleUserSelection(user._id);
                      setParticipantSearch('');
                      setShowParticipantDropdown(false);
                    }}
                    className={`flex items-center gap-3 p-3 cursor-pointer border-b last:border-b-0 transition-all duration-200 ${
                      isDarkMode 
                        ? 'border-gray-700 hover:bg-blue-900/20' 
                        : 'border-gray-100 hover:bg-blue-50'
                    }`}
                  >
                    <img
                      src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL}${user.avatar.startsWith('/') ? user.avatar : '/' + user.avatar}`) : '/default-avatar.svg'}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        console.log('❌ Group creation avatar load failed for user:', user.name, 'URL:', user.avatar);
                        e.currentTarget.src = '/default-avatar.svg';
                      }}
                    />
                    <div className="flex-1">
                      <p className={`text-sm font-medium transition-colors duration-200 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{user.name}</p>
                      <p className={`text-xs transition-colors duration-200 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>@{user.username}</p>
                    </div>
                    {selectedUsers.includes(user._id) && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        </>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-2 sm:p-4 bg-black/20 backdrop-blur-md">
          <div className={`search-modal-container rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md mx-2 sm:mx-4 transform transition-all duration-300 scale-100 max-h-[95vh] overflow-y-auto border ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg sm:text-xl font-semibold break-words transition-colors duration-200 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Search for users</h3>
                <button
                  onClick={() => setShowSearchModal(false)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
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
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.5,12C18,12 20,14 20,16.5C20,17.38 19.75,18.21 19.31,18.9L22.39,22L21,23.39L17.88,20.32C17.19,20.75 16.37,21 15.5,21C13,21 11,19 11,16.5C11,14 13,12 15.5,12M15.5,14A2.5,2.5 0 0,0 13,16.5A2.5,2.5 0 0,0 15.5,19A2.5,2.5 0 0,0 18,16.5A2.5,2.5 0 0,0 15.5,14M10,4A4,4 0 0,1 14,8C14,8.91 13.69,9.75 13.18,10.43C12.32,10.75 11.55,11.26 10.91,11.9L10,12A4,4 0 0,1 6,8A4,4 0 0,1 10,4M2,20V18C2,15.88 5.31,14.14 9.5,14C9.18,14.78 9,15.62 9,16.5C9,17.79 9.38,19 10,20H2Z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search for users"
                onChange={(e) => handleSearch(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-opacity-80 transition-colors duration-200 ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
                autoFocus
              />
            </div>
            
            {/* Search Results */}
            <div className="max-h-64 overflow-y-auto scrollbar-hide">
              {searchLoading ? (
                <div className="space-y-3">
                  {/* Skeleton Loading Items */}
                  {[...Array(7)].map((_, index) => (
                    <div key={index} className="flex items-center gap-3 p-3">
                      <div className={`w-10 h-10 rounded-full animate-pulse transition-colors duration-200 ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                      }`}></div>
                      <div className="flex-1 space-y-2">
                        <div className={`h-4 rounded animate-pulse w-3/4 transition-colors duration-200 ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                        }`}></div>
                        <div className={`h-3 rounded animate-pulse w-1/2 transition-colors duration-200 ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                        }`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((user) => (
                    <div
                      key={user._id}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border border-transparent transition-all duration-200 ${
                        isDarkMode 
                          ? 'hover:bg-gray-700 hover:border-gray-600' 
                          : 'hover:bg-blue-50 hover:border-blue-200'
                      }`}
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
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
                          <span className={`text-xs transition-colors duration-200 ${
                            isDarkMode ? 'text-green-400' : 'text-green-600'
                          }`}>Online</span>
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
        </div>
      )}
    </>
  );
};

export default FollowersSidebar; 
