'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface User {
  _id: string;
  name: string;
  username?: string;
  avatar?: string;
  isVerified?: boolean;
  followers?: number;
  following?: number;
  isOnline?: boolean;
  lastSeen?: string;
  bio?: string;
}

interface PeopleYouMayKnowProps {
  onFollow?: (userId: string) => void;
}

const PeopleYouMayKnow: React.FC<PeopleYouMayKnowProps> = ({ onFollow }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const router = useRouter();
  const { isDarkMode } = useDarkMode();

  // Add custom styles for horizontal scrolling
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .people-scroll-container::-webkit-scrollbar {
        display: none;
      }
      .people-scroll-container {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .people-card {
        scroll-snap-align: start;
      }
      .people-scroll-container {
        scroll-snap-type: x mandatory;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Fetch suggested users
  const fetchSuggestedUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUsers([]);
        return;
      }

      // Try suggested users endpoint first
      let apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/users/suggested`;
      let response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // If suggested endpoint fails, try getting all users
      if (!response.ok) {
        apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/users`;
        response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      if (response.ok) {
        const data = await response.json();
        const usersArray = Array.isArray(data) ? data : (data.users || []);
        
        if (usersArray && usersArray.length > 0) {
          // Get current user to exclude from suggestions
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          const currentUserId = currentUser._id || currentUser.id;
          
          // Filter out current user and map user data
          const filteredUsers = usersArray.filter((user: any) => user._id !== currentUserId);
          
          const mappedUsers = filteredUsers.map((user: any) => ({
            _id: user._id,
            name: user.name || user.fullName || 'User',
            username: user.username || `@${user._id?.toString().slice(-8) || 'user'}`,
            avatar: user.avatar || '/default-avatar.svg',
            bio: user.bio || '',
            isOnline: user.isOnline || false,
            lastSeen: user.lastSeen,
            isVerified: user.isVerified || false,
            followers: Array.isArray(user.followers) ? user.followers.length : (user.followers || 0),
            following: Array.isArray(user.following) ? user.following.length : (user.following || 0)
          }));

          // Sort users by verification status first, then by followers count
          const sortedUsers = mappedUsers.sort((a: any, b: any) => {
            if (a.isVerified && !b.isVerified) return -1;
            if (!a.isVerified && b.isVerified) return 1;
            return (b.followers || 0) - (a.followers || 0);
          });
          
          // Limit to 10 users
          const limitedUsers = sortedUsers.slice(0, 10);
          setUsers(limitedUsers);
          setLastUpdated(new Date());
        } else {
          setUsers([]);
        }
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching suggested users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle follow/unfollow
  const handleFollow = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to follow users');
        return;
      }

      const isFollowing = followedUsers.has(userId);
      
      // Optimistically update UI
      setFollowedUsers(prev => {
        const newSet = new Set(prev);
        if (isFollowing) {
          newSet.delete(userId);
        } else {
          newSet.add(userId);
        }
        return newSet;
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update user followers count in the UI
        setUsers(prev => prev.map(user => 
          user._id === userId 
            ? { 
                ...user, 
                followers: isFollowing 
                  ? Math.max(0, (user.followers || 0) - 1)
                  : (user.followers || 0) + 1
              }
            : user
        ));
        
        if (onFollow) {
          onFollow(userId);
        }
      } else {
        // Revert optimistic update on failure
        setFollowedUsers(prev => {
          const newSet = new Set(prev);
          if (isFollowing) {
            newSet.add(userId);
          } else {
            newSet.delete(userId);
          }
          return newSet;
        });
        alert('Failed to follow user. Please try again.');
      }
    } catch (error) {
      console.error('Error following user:', error);
      // Revert optimistic update on error
      setFollowedUsers(prev => {
        const newSet = new Set(prev);
        if (followedUsers.has(userId)) {
          newSet.delete(userId);
        } else {
          newSet.add(userId);
        }
        return newSet;
      });
      alert('Error following user. Please try again.');
    }
  };

  // Navigate to user profile
  const navigateToProfile = (userId: string) => {
    router.push(`/dashboard/profile/${userId}`);
  };

  // Load users on component mount
  useEffect(() => {
    fetchSuggestedUsers();
  }, []);

  if (users.length === 0 && !loading) {
    return null;
  }

  const containerClasses = isDarkMode
    ? 'bg-[#0f1729] text-white border-gray-700'
    : 'bg-white text-gray-900 border-gray-200';
  const headerSubText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const cardClasses = isDarkMode
    ? 'bg-[#182238] hover:bg-[#1f2c45]'
    : 'bg-gray-50 hover:bg-gray-100';
  const cardText = isDarkMode ? 'text-white' : 'text-gray-900';
  const secondaryText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const tertiaryText = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const followBtnDefault = 'bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg';
  const followBtnFollowing = isDarkMode
    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
    : 'bg-gray-200 text-gray-700 hover:bg-gray-300';

  return (
    <div className={`rounded-xl shadow-sm border mb-4 transition-colors duration-200 ${containerClasses}`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            People You May Know
          </h3>
          <button
            onClick={fetchSuggestedUsers}
            disabled={loading}
            className={`p-2 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
            title="Refresh suggestions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {lastUpdated && (
          <p className={`text-xs mt-1 ${headerSubText}`}>
            Updated {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Users List - Horizontal Scroll */}
      <div className="p-4">
        <div className="people-scroll-container flex space-x-4 overflow-x-auto pb-2">
          {users.map((user) => {
            const isFollowing = followedUsers.has(user._id);
            
            return (
              <div
                key={user._id}
                className={`people-card flex-shrink-0 w-48 rounded-lg p-4 transition-colors cursor-pointer ${cardClasses}`}
                onClick={() => navigateToProfile(user._id)}
              >
                {/* Avatar */}
                <div className="flex justify-center mb-3">
                  <div className="relative">
                    <img
                      src={user.avatar || '/default-avatar.svg'}
                      alt={user.name}
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/default-avatar.svg';
                      }}
                    />
                    {user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-700"></div>
                    )}
                  </div>
                </div>

                {/* User Info */}
                <div className="text-center mb-3">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <h4 className={`text-sm font-semibold truncate ${cardText}`}>
                      {user.name}
                    </h4>
                    {user.isVerified && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  <p className={`text-xs truncate ${secondaryText}`}>
                    {user.username}
                  </p>
                  <p className={`text-xs mt-1 ${tertiaryText}`}>
                    {user.followers} followers
                  </p>
                </div>
                
                {/* Follow Button */}
                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFollow(user._id);
                    }}
                  disabled={loading}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                    isFollowing ? followBtnFollowing : followBtnDefault
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    </div>
                  ) : (
                    isFollowing ? 'Following' : 'Follow'
                  )}
                </button>
              </div>
            );
          })}
          </div>
          
          {/* Scroll Indicator */}
          {users.length > 4 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
          )}
        </div>
    </div>
  );
};

export default PeopleYouMayKnow;
