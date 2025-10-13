"use client";
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Users, FileText, Group, Gamepad2, Plus, Filter, X, Loader2 } from 'lucide-react';
import Popup, { PopupState } from '../../../components/Popup';
const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://jailfriend-1.onrender.com');
import { getToken } from '../../../utils/auth';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { 
  searchUsersApi, 
  getSuggestedUsersApi, 
  followUserApi, 
  getPagesApi, 
  likePageApi, 
  getPublicGroupsApi, 
  joinGroupApi, 
  searchGroupsApi 
} from '../../../utils/api';

// Type definitions
interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isVerified: boolean;
  isFollowing: boolean;
  followers: number;
  bio?: string;
  location?: string;
}

interface Page {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  likes: number;
  isLiked: boolean;
  createdBy: {
    name: string;
    username: string;
    avatar: string;
  };
  createdAt: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  avatar: string;
  privacy: string;
  membersCount: number;
  isMember: boolean;
  creator: {
    name: string;
    username: string;
    avatar: string;
  };
  createdAt: string;
}

interface Tab {
  name: string;
  icon: React.ComponentType<any>;
  active: boolean;
}

interface Filters {
  all: string;
  age: string;
  verified: string;
  status: string;
  gender: string;
  avatar: string;
}

const SocialExplorePage = () => {
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState<string>('Users');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({
    all: 'All',
    age: 'Age',
    verified: 'Verified',
    status: 'Status',
    gender: 'Gender',
    avatar: 'Avatar'
  });
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [userLoading, setUserLoading] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [groupLoading, setGroupLoading] = useState<boolean>(false);

  const showPopup = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    setPopup({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closePopup = () => {
    setPopup(prev => ({ ...prev, isOpen: false }));
  };

  // Fetch users data
  const fetchUsers = async (searchQuery?: string) => {
    try {
      setUserLoading(true);
      const token = getToken();
      if (!token) {
        showPopup('error', 'Authentication Error', 'Please login to view users');
        return;
      }


      let usersData;
      if (searchQuery && searchQuery.trim()) {
        usersData = await searchUsersApi(token, searchQuery);
      } else {
        usersData = await getSuggestedUsersApi(token);
      }
      
      
      // Handle different response formats
      let usersArray = [];
      if (Array.isArray(usersData)) {
        usersArray = usersData;
      } else if (usersData && usersData.users) {
        usersArray = usersData.users;
      } else if (usersData && usersData.data) {
        usersArray = usersData.data;
      } else {
        usersArray = [];
      }
      
      // Map backend data to frontend interface
      const mappedUsers = usersArray.map((user: any) => ({
        id: user._id || user.id,
        name: user.name || user.fullName || user.username || 'Unknown User',
        username: user.username || `@${(user._id || user.id).toString().slice(-8)}`,
        avatar: user.avatar || user.profilePicture || '/default-avatar.svg',
        isVerified: user.isVerified || user.verified || false,
        isFollowing: user.isFollowing || user.following || false,
        followers: user.followers || user.followersCount || 0,
        bio: user.bio || user.description || '',
        location: user.location || user.address || ''
      }));
      
      setUsers(mappedUsers);
      
      if (mappedUsers.length === 0) {
        showPopup('info', 'No Users Found', 'No users match your search criteria. Try adjusting your search or check back later.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to fetch users';
      showPopup('error', 'Error', errorMessage);
      setUsers([]);
    } finally {
      setUserLoading(false);
    }
  };

  // Fetch pages data
  const fetchPages = async () => {
    try {
      setPageLoading(true);
      const token = getToken();
      const pagesData = await getPagesApi(token || undefined);
      
      
      // Map backend data to frontend interface
      const mappedPages = (pagesData || []).map((page: any) => ({
        id: page._id || page.id,
        name: page.name || 'Untitled Page',
        description: page.description || 'No description available',
        category: page.category || 'General',
        url: page.url || page._id || page.id,
        likes: page.likes || 0,
        isLiked: page.isLiked || false,
        createdBy: {
          name: page.createdBy?.name || page.creatorName || 'Unknown User',
          username: page.createdBy?.username || 'unknown',
          avatar: page.createdBy?.avatar || page.creatorAvatar || '/default-avatar.svg'
        },
        createdAt: page.createdAt || new Date().toISOString()
      }));
      
      setPages(mappedPages);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch pages';
      showPopup('error', 'Error', errorMessage);
      setPages([]); // Set empty array instead of sample data
    } finally {
      setPageLoading(false);
    }
  };

  // Fetch groups data
  const fetchGroups = async () => {
    try {
      setGroupLoading(true);
      const token = getToken();
      const groupsData = await getPublicGroupsApi(token || undefined);
      
      
      // Map backend data to frontend interface
      const mappedGroups = (groupsData || []).map((group: any) => ({
        id: group._id || group.id,
        name: group.name || 'Untitled Group',
        description: group.description || 'No description available',
        category: group.category || 'General',
        avatar: group.avatar || '/default-avatar.svg',
        privacy: group.privacy || 'public',
        membersCount: group.members?.length || group.membersCount || 0,
        isMember: group.isMember || false,
        creator: {
          name: group.creator?.name || 'Unknown User',
          username: group.creator?.username || 'unknown',
          avatar: group.creator?.avatar || '/default-avatar.svg'
        },
        createdAt: group.createdAt || new Date().toISOString()
      }));
      
      setGroups(mappedGroups);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch groups';
      showPopup('error', 'Error', errorMessage);
      setGroups([]); // Set empty array instead of sample data
    } finally {
      setGroupLoading(false);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'Users') {
      fetchUsers();
    } else if (activeTab === 'Pages') {
      fetchPages();
    } else if (activeTab === 'Groups') {
      fetchGroups();
    }
  }, [activeTab]);

  // Handler functions with real API calls
  const handleFollow = async (userId: string) => {
    try {
      const token = getToken();
      if (!token) {
        showPopup('error', 'Authentication Error', 'Please login to follow users');
        return;
      }

      
      const response = await followUserApi(token, userId);
      
      // Update local state based on backend response
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              isFollowing: response.isFollowing, 
              followers: response.isFollowing ? user.followers + 1 : user.followers - 1 
            }
          : user
      ));

      // Refresh the users data to get updated following/followers lists
      setTimeout(() => {
        fetchUsers();
      }, 500);

      const action = response.isFollowing ? 'followed' : 'unfollowed';
      showPopup('success', 'Success!', `User ${action} successfully`);
            } catch (error: any) {
          const errorMessage = error.response?.data?.error || error.message || 'Failed to follow user';
          showPopup('error', 'Error', errorMessage);
        }
  };

  const handleSearch = async () => {
    if (activeTab === 'Users') {
      await fetchUsers(searchKeyword);
    } else if (activeTab === 'Groups') {
      try {
        const token = getToken();
        if (token && searchKeyword.trim()) {
          const groupsData = await searchGroupsApi(token, searchKeyword);
          
          // Map backend data to frontend interface
          const mappedGroups = (groupsData || []).map((group: any) => ({
            id: group._id || group.id,
            name: group.name || 'Untitled Group',
            description: group.description || 'No description available',
            category: group.category || 'General',
            avatar: group.avatar || '/default-avatar.svg',
            privacy: group.privacy || 'public',
            membersCount: group.members?.length || group.membersCount || 0,
            isMember: group.isMember || false,
            creator: {
              name: group.creator?.name || 'Unknown User',
              username: group.creator?.username || 'unknown',
              avatar: group.creator?.avatar || '/default-avatar.svg'
            },
            createdAt: group.createdAt || new Date().toISOString()
          }));
          
          setGroups(mappedGroups);
        }
      } catch (error) {
        showPopup('error', 'Error', 'Failed to search groups');
      }
    }
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleLikePage = async (pageId: string) => {
    try {
      const token = getToken();
      if (!token) {
        showPopup('error', 'Authentication Error', 'Please login to like pages');
        return;
      }

      await likePageApi(token, pageId);
      
      // Update local state
      setPages(prev => prev.map(page => 
        page.id === pageId 
          ? { ...page, isLiked: !page.isLiked, likes: page.isLiked ? page.likes - 1 : page.likes + 1 }
          : page
      ));

      showPopup('success', 'Success!', 'Page liked successfully');
    } catch (error) {
      showPopup('error', 'Error', 'Failed to like page');
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const token = getToken();
      if (!token) {
        showPopup('error', 'Authentication Error', 'Please login to join groups');
        return;
      }

      await joinGroupApi(token, groupId);
      
      // Update local state
      setGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, isMember: !group.isMember, membersCount: group.isMember ? group.membersCount - 1 : group.membersCount + 1 }
          : group
      ));

      showPopup('success', 'Success!', 'Group joined successfully');
    } catch (error) {
      showPopup('error', 'Error', 'Failed to join group');
    }
  };

  const handleLoadMore = () => {
    showPopup('info', 'Loading...', 'Loading more content...');
  };

  const tabs: Tab[] = [
    { name: 'Users', icon: Users, active: false },
    { name: 'Pages', icon: FileText, active: true },
    { name: 'Groups', icon: Group, active: false },
    { name: 'Games', icon: Gamepad2, active: false }
  ];

  // User Card Component with real data
  const UserCard = ({ user }: { user: User }) => (
    <div className={`rounded-lg shadow-sm border overflow-hidden transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Galaxy Background with Avatar */}
      <div className="relative h-24 sm:h-32 bg-gradient-to-br from-purple-900 via-blue-900 to-black overflow-hidden">
        {/* Starry background effect */}
        <div className="absolute inset-0 opacity-60">
          <div className="absolute top-1 sm:top-2 left-2 sm:left-4 w-0.5 sm:w-1 h-0.5 sm:h-1 bg-white rounded-full"></div>
          <div className="absolute top-3 sm:top-6 right-4 sm:right-8 w-0.5 h-0.5 bg-white rounded-full"></div>
          <div className="absolute top-4 sm:top-8 left-6 sm:left-12 w-0.5 sm:w-1 h-0.5 sm:h-1 bg-white rounded-full"></div>
          <div className="absolute top-6 sm:top-12 right-2 sm:right-4 w-0.5 h-0.5 bg-white rounded-full"></div>
          <div className="absolute top-8 sm:top-16 left-4 sm:left-8 w-0.5 sm:w-1 h-0.5 sm:h-1 bg-white rounded-full"></div>
          <div className="absolute top-10 sm:top-20 right-6 sm:right-12 w-0.5 h-0.5 bg-white rounded-full"></div>
          <div className="absolute bottom-4 sm:bottom-8 left-3 sm:left-6 w-0.5 sm:w-1 h-0.5 sm:h-1 bg-white rounded-full"></div>
          <div className="absolute bottom-6 sm:bottom-12 right-3 sm:right-6 w-0.5 h-0.5 bg-white rounded-full"></div>
          <div className="absolute bottom-8 sm:bottom-16 left-8 sm:left-16 w-0.5 sm:w-1 h-0.5 sm:h-1 bg-white rounded-full"></div>
          {/* Nebula effect */}
          <div className="absolute top-2 sm:top-4 right-3 sm:right-6 w-4 sm:w-8 h-4 sm:h-8 bg-purple-400 rounded-full opacity-30 blur-sm"></div>
          <div className="absolute bottom-3 sm:bottom-6 left-4 sm:left-8 w-3 sm:w-6 h-3 sm:h-6 bg-pink-400 rounded-full opacity-20 blur-sm"></div>
        </div>
        
        {/* Centered Avatar */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-orange-200 flex items-center justify-center border-2 border-white shadow-lg">
            <img 
              src={user.avatar || '/avatars/1.png.png'} 
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/avatars/1.png.png';
              }}
            />
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-3 sm:p-4 text-center">
        <div className="flex items-center justify-center gap-1 mb-2">
          <h3 className={`font-medium text-xs sm:text-sm truncate transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {user.name}
          </h3>
          {user.isVerified && (
            <span className="text-blue-500 text-xs">✓</span>
          )}
        </div>
        <p className={`text-xs mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>@{user.username}</p>
        <p className={`text-xs mb-3 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.followers} followers</p>
        <button
          onClick={() => handleFollow(user.id)}
          className={`w-full py-1.5 sm:py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 ${
            user.isFollowing 
              ? isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
          }`}
        >
          {user.isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>
    </div>
  );

  // Page List Item Component with real data
  const PageListItem = ({ page }: { page: Page }) => (
    <div className={`border-b last:border-b-0 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between transition-colors gap-3 sm:gap-4 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
        : 'bg-white border-gray-200 hover:bg-gray-50'
    }`}>
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Page Icon */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-orange-200">
          <span className="font-bold text-base sm:text-lg text-orange-600">
            {page.name.charAt(0).toUpperCase()}
          </span>
        </div>
        
        {/* Page Info */}
        <div className="min-w-0 flex-1">
          <h3 className={`font-medium text-sm sm:text-base mb-1 truncate transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{page.name}</h3>
          <p className={`text-xs mb-2 line-clamp-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{page.description}</p>
          <div className={`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <span className="flex items-center gap-1">
              👍 {page.likes} people like this
            </span>
            <span className="text-blue-600">{page.category}</span>
            <span className={`transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>by @{page.createdBy.username}</span>
          </div>
        </div>
      </div>
      
      {/* Like Button */}
      <button
        onClick={() => handleLikePage(page.id)}
        className={`flex items-center justify-center gap-1 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex-shrink-0 duration-200 ${
          page.isLiked 
            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
            : isDarkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
      >
        👍 {page.isLiked ? 'Liked' : 'Like'}
      </button>
    </div>
  );

  // Group List Item Component
  const GroupListItem = ({ group }: { group: Group }) => (
    <div className={`border-b last:border-b-0 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between transition-colors gap-3 sm:gap-4 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
        : 'bg-white border-gray-200 hover:bg-gray-50'
    }`}>
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Group Avatar */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-200">
          {group.avatar ? (
            <img 
              src={group.avatar} 
              alt={group.name}
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/avatars/1.png.png';
              }}
            />
          ) : (
            <span className="font-bold text-base sm:text-lg text-blue-600">
              {group.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        
        {/* Group Info */}
        <div className="min-w-0 flex-1">
          <h3 className={`font-medium text-sm sm:text-base mb-1 truncate transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{group.name}</h3>
          <p className={`text-xs mb-2 line-clamp-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{group.description}</p>
          <div className={`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <span className="flex items-center gap-1">
              👥 {group.membersCount} members
            </span>
            <span className="text-blue-600">{group.category}</span>
            <span className={`transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>by @{group.creator.username}</span>
          </div>
        </div>
      </div>
      
      {/* Join Button */}
      <button
        onClick={() => handleJoinGroup(group.id)}
        className={`flex items-center justify-center gap-1 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex-shrink-0 duration-200 ${
          group.isMember 
            ? isDarkMode 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
        }`}
      >
        {group.isMember ? 'Joined' : 'Join'}
      </button>
    </div>
  );

  // Pages Tab Component
  const PagesComponent = () => (
    <div className={`rounded-lg shadow-sm border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {pageLoading ? (
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className={`transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading pages...</p>
        </div>
      ) : pages.length > 0 ? (
        <>
          {pages.map((page) => (
            <PageListItem key={page.id} page={page} />
          ))}
          
          {/* Load More Button */}
          <div className="p-3 sm:p-4 text-center border-t">
            <button
              onClick={handleLoadMore}
              className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors mx-auto text-sm"
            >
              <ChevronDown className="w-4 h-4" />
              Load more pages
            </button>
          </div>
        </>
      ) : (
        <div className="p-8 text-center">
          <FileText className={`w-12 h-12 mx-auto mb-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          <p className={`transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>No pages found</p>
        </div>
      )}
    </div>
  );

  // Groups Tab Component
  const GroupsComponent = () => (
    <div className={`rounded-lg shadow-sm border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {groupLoading ? (
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className={`transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading groups...</p>
        </div>
      ) : groups.length > 0 ? (
        <>
          {groups.map((group) => (
            <GroupListItem key={group.id} group={group} />
          ))}
          
          {/* Load More Button */}
          <div className="p-3 sm:p-4 text-center border-t">
            <button
              onClick={handleLoadMore}
              className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors mx-auto text-sm"
            >
              <ChevronDown className="w-4 h-4" />
              Load more groups
            </button>
          </div>
        </>
      ) : (
        <div className="p-8 text-center">
          <Group className={`w-12 h-12 mx-auto mb-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          <p className={`transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>No groups found</p>
        </div>
      )}
    </div>
  );

  // Search and Filters Component
  const SearchFilters = () => (
    <div className={`rounded-lg shadow-sm border p-3 sm:p-4 mb-4 sm:mb-6 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Search Bar */}
      <div className="flex justify-center mb-3 sm:mb-4">
        <div className="relative max-w-md w-full">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Search..."
            className={`w-full pl-3 sm:pl-4 pr-10 sm:pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-sm sm:text-base transition-colors duration-200 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
            }`}
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 bg-blue-500 text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
          >
            <Search className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Mobile Filter Toggle Button */}
      <div className="flex justify-center mb-3 sm:hidden">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
            isDarkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {showFilters ? <X className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Filter Dropdowns */}
      <div className={`flex flex-wrap justify-center gap-2 ${showFilters ? 'block' : 'hidden sm:flex'}`}>
        {Object.entries(filters).map(([key, value]) => (
          <div key={key} className="relative">
            <select
              value={value}
              onChange={(e) => handleFilterChange(key, e.target.value)}
              className={`appearance-none border rounded-md px-2 sm:px-3 py-1 pr-5 sm:pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs min-w-0 transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              <option value={value}>{value}</option>
              {key === 'all' && (
                <>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </>
              )}
              {key === 'age' && (
                <>
                  <option value="18-25">18-25</option>
                  <option value="26-35">26-35</option>
                  <option value="36-50">36-50</option>
                  <option value="50+">50+</option>
                </>
              )}
              {key === 'verified' && (
                <>
                  <option value="Yes">Verified</option>
                  <option value="No">Not Verified</option>
                </>
              )}
              {key === 'status' && (
                <>
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Away">Away</option>
                </>
              )}
              {key === 'gender' && (
                <>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </>
              )}
              {key === 'avatar' && (
                <>
                  <option value="With Photo">With Photo</option>
                  <option value="Without Photo">Without Photo</option>
                </>
              )}
            </select>
            <ChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`w-full h-full overflow-y-auto scrollbar-hide transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      
      {/* Popup Modal */}
      <Popup popup={popup} onClose={closePopup} />
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
        
        {/* Search and Filters - Show for Users and Groups tabs */}
        {(activeTab === 'Users' || activeTab === 'Groups') && <SearchFilters />}

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className={`inline-flex rounded-lg shadow-sm border overflow-x-auto max-w-full transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            {tabs.map((tab, index) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                    index === 0 ? 'rounded-l-lg' : ''
                  } ${
                    index === tabs.length - 1 ? 'rounded-r-lg' : ''
                  } ${
                    activeTab === tab.name
                      ? 'text-orange-600 bg-orange-50 border-orange-200'
                      : isDarkMode 
                        ? 'text-gray-300 hover:text-orange-600 hover:bg-gray-700' 
                        : 'text-gray-600 hover:text-orange-600 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Users Grid */}
        {activeTab === 'Users' && (
          <div>
            {userLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className={`transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading users...</p>
              </div>
            ) : users.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
                {users.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className={`w-12 h-12 mx-auto mb-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <p className={`transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>No users found</p>
              </div>
            )}
          </div>
        )}

        {/* Pages List */}
        {activeTab === 'Pages' && <PagesComponent />}

        {/* Groups List */}
        {activeTab === 'Groups' && <GroupsComponent />}

        {/* Games Tab Placeholder */}
        {activeTab === 'Games' && (
          <div className={`rounded-lg shadow-sm border min-h-64 sm:min-h-96 flex flex-col items-center justify-center p-6 sm:p-8 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center mb-3 sm:mb-4 transition-colors duration-200 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Gamepad2 className={`w-6 h-6 sm:w-8 sm:h-8 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <p className={`font-medium text-sm sm:text-base transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Games coming soon</p>
          </div>
        )}

      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center z-30">
        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
};

export default SocialExplorePage;
