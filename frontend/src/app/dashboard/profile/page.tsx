"use client";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Search, Camera, Video, Music, FileText, Plus, MapPin, Globe, Calendar, Users, Eye, Phone } from 'lucide-react';
import PostDisplay from '@/components/PostDisplay';
import Popup, { PopupState } from '@/components/Popup';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  email: string;
  followers: string[];
  following: string[];
  bio?: string;
  location?: string;
  website?: string;
  workplace?: string;
  address?: string;
  country?: string;
  education?: string;
  isOnline?: boolean;
  joinedDate?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
}

interface UserImages {
  avatar: string | null;
  cover: string | null;
}

interface Post {
  _id: string;
  content: string;
  media: any[];
  likes: string[];
  comments: any[];
  shares: string[];
  views: string[];
  createdAt: string;
  user: {
    name: string;
    avatar: string;
    userId: string;
  };
}

interface Album {
  _id: string;
  name: string;
  media: any[];
  createdAt: string;
  user: string;
}

const ProfilePage = () => {
  const { isDarkMode } = useDarkMode();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userImages, setUserImages] = useState<UserImages>({ avatar: null, cover: null });
  const [posts, setPosts] = useState<Post[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const tabs = [
    { id: 'timeline', label: 'Timeline', count: posts.length },
    { id: 'albums', label: 'Albums', count: albums.length }
  ];

  const filters = [
    { id: 'all', label: 'All', icon: <FileText className="w-4 h-4" /> },
    { id: 'text', label: 'Text', icon: <FileText className="w-4 h-4" /> },
    { id: 'photos', label: 'Photos', icon: <Camera className="w-4 h-4" /> },
    { id: 'videos', label: 'Videos', icon: <Video className="w-4 h-4" /> },
    { id: 'sounds', label: 'Sounds', icon: <Music className="w-4 h-4" /> }
  ];

  useEffect(() => {
    fetchUserProfile();
    fetchUserImages();
    fetchUserPosts();
    fetchUserAlbums();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/register');
        return;
      }

  const response = await fetch(`${API_URL}/api/profile/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setLoading(false);
      } else {
        console.error('Failed to fetch user profile:', response.status);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setLoading(false);
    }
  };

  const fetchUserImages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

  const response = await fetch(`${API_URL}/api/userimages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const imagesData = await response.json();
        setUserImages(imagesData);
      }
    } catch (error) {
      console.error('Error fetching user images:', error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

  const response = await fetch(`${API_URL}/api/posts/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const postsData = await response.json();
        setPosts(postsData);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const fetchUserAlbums = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

  const response = await fetch(`${API_URL}/api/albums/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const albumsData = await response.json();
        setAlbums(albumsData);
      }
    } catch (error) {
      console.error('Error fetching user albums:', error);
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setEditContent(post.content);
    setShowEditModal(true);
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setPosts(prev => prev.filter(post => post._id !== postId));
        showPopup('success', 'Post Deleted', 'Post has been deleted successfully!');
      } else {
        showPopup('error', 'Error', 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      showPopup('error', 'Error', 'Failed to delete post');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingPost || !editContent.trim()) return;

    try {
      const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/api/posts/${editingPost._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: editContent })
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(prev => prev.map(post => 
          post._id === editingPost._id ? updatedPost : post
        ));
        setShowEditModal(false);
        setEditingPost(null);
        setEditContent('');
        showPopup('success', 'Post Updated', 'Post has been updated successfully!');
      } else {
        showPopup('error', 'Error', 'Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      showPopup('error', 'Error', 'Failed to update post');
    }
  };

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

  const getMediaUrl = (url: string) => {
    if (!url) return '/default-avatar.svg';
    if (url.startsWith('http')) return url;
    // Remove leading slash to avoid double slashes
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    return `${API_URL}/${cleanUrl}`;
  };

  const getFilteredContent = () => {
    let combinedContent = [
      ...posts.map((post: any) => ({ ...post, type: 'post' })),
      ...albums.map((album: any) => ({ ...album, type: 'album' }))
    ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (searchQuery) {
      combinedContent = combinedContent.filter(item => {
        if (item.type === 'post') {
          return item.content.toLowerCase().includes(searchQuery.toLowerCase());
        } else if (item.type === 'album') {
          return item.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return false;
      });
    }

    switch (activeFilter) {
      case 'text':
        combinedContent = combinedContent.filter(item => {
          if (item.type === 'post') {
            return !item.media || item.media.length === 0;
          }
          return false;
        });
        break;
      case 'photos':
        combinedContent = combinedContent.filter(item => {
          if (item.type === 'post') {
            return item.media && item.media.some((media: any) =>
              media.type?.startsWith('image/') || media.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
            );
          } else if (item.type === 'album') {
            return item.media && item.media.length > 0;
          }
          return false;
        });
        break;
      case 'videos':
        combinedContent = combinedContent.filter(item => {
          if (item.type === 'post') {
            return item.media && item.media.some((media: any) =>
              media.type?.startsWith('video/') || media.url?.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i)
            );
          }
          return false;
        });
        break;
      case 'sounds':
        combinedContent = combinedContent.filter(item => {
          if (item.type === 'post') {
            return item.media && item.media.some((media: any) =>
              media.type?.startsWith('audio/') || media.url?.match(/\.(mp3|wav|ogg|aac|flac)$/i)
            );
          }
          return false;
        });
        break;
      default:
        break;
    }

    return combinedContent;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className={`mt-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <p className={`transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen overflow-x-hidden max-w-full transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Cover Photo Section */}
      <div className="relative h-48 md:h-64 lg:h-72 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 overflow-hidden">
        {userImages.cover && (
          <img
            src={getMediaUrl(userImages.cover)}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Profile Header */}
      <div className="relative px-4 sm:px-6 lg:px-8 pb-6 -mt-20">
        <div className="w-full max-w-7xl mx-auto">
          {/* Profile Picture and Actions */}
          <div className="flex flex-col items-center gap-4 mb-6">
            {/* Profile Picture */}
            <div className="relative">
              <img
                src={userImages.avatar ? getMediaUrl(userImages.avatar) : '/default-avatar.svg'} onError={(e) => { ('❌ Avatar load failed for user:', userImages.avatar ? getMediaUrl(userImages.avatar) : '/default-avatar.svg'); e.currentTarget.src = '/default-avatar.svg'; }}
                alt={user.name}
                className="w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-full border-4 border-white shadow-xl object-cover bg-gray-200"
              />
            </div>

            {/* User Info */}
            <div className="text-center">
              <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</h1>
              <p className={`text-base sm:text-lg mb-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>@{user.username}</p>
              
              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <button className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                  <span className="text-lg">〰️</span>
                  <span className="text-sm font-medium">Wave</span>
                </button>
                
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                  <span className="text-lg">✏️</span>
                  <span className="text-sm font-medium">Edit</span>
                </button>
                
                <button className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                  <span className="text-lg">📋</span>
                  <span className="text-sm font-medium">Activities</span>
                </button>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="mb-6 text-center">
            {user.bio && (
              <p className={`mb-4 text-sm sm:text-base transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{user.bio}</p>
            )}

            <div className={`flex flex-wrap gap-3 text-sm mb-4 justify-center transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.website && (
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {user.website}
                  </a>
                </div>
              )}
              {user.joinedDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user.joinedDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`border-b sticky top-0 z-30 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-6 border-b-2 transition-colors whitespace-nowrap min-w-fit ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 font-medium'
                    : isDarkMode 
                      ? 'border-transparent text-gray-300 hover:text-white hover:border-gray-500'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <span className="text-sm font-medium">{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            {/* Content Layout - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
              {/* Left Sidebar - User Information */}
              <div className="lg:col-span-1 space-y-6">
                {/* Search Box */}
                <div className={`rounded-xl shadow-sm p-4 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      placeholder="Search for posts"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-colors duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700 text-white placeholder-gray-400' 
                          : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                </div>

                {/* User Details Card */}
                <div className={`rounded-xl shadow-sm p-4 space-y-4 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  {/* Status */}
                  <div className="text-center">
                    <p className={`font-medium text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{user.bio || 'No bio added yet'}</p>
                  </div>

                  {/* Online Status */}
                  <div className="flex items-center justify-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{user.isOnline ? 'Online' : 'Offline'}</span>
                  </div>

                  {/* Connections */}
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <h4 className={`text-sm font-semibold transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Connections</h4>
                    </div>
                    <div className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      isDarkMode 
                        ? 'bg-blue-900/20 border-blue-700 hover:bg-blue-900/30' 
                        : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                    }`}>
                      <div className={`flex items-center gap-2 transition-colors duration-200 ${
                        isDarkMode ? 'text-blue-300' : 'text-blue-700'
                      }`}>
                        <Users className={`w-5 h-5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                        <span className="text-lg font-bold">{user.following?.length || 0}</span>
                        <span className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Following</span>
                      </div>
                    </div>
                    <div className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      isDarkMode 
                        ? 'bg-green-900/20 border-green-700 hover:bg-green-900/30' 
                        : 'bg-green-50 border-green-200 hover:bg-green-100'
                    }`}>
                      <div className={`flex items-center gap-2 transition-colors duration-200 ${
                        isDarkMode ? 'text-green-300' : 'text-green-700'
                      }`}>
                        <Users className={`w-5 h-5 flex-shrink-0 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
                        <span className="text-lg font-bold">{user.followers?.length || 0}</span>
                        <span className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Followers</span>
                      </div>
                    </div>
                  </div>

                  {/* Posts Count */}
                  <div className={`flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span>{posts.length} posts</span>
                  </div>

                  {/* Additional User Details */}
                  {user.gender && (
                    <div className={`flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="text-lg">👤</span>
                      <span>{user.gender}</span>
                    </div>
                  )}

                  {user.workplace && (
                    <div className={`flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="text-lg">💼</span>
                      <span>{user.workplace}</span>
                    </div>
                  )}

                  {user.education && (
                    <div className={`flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="text-lg">🎓</span>
                      <span>{user.education}</span>
                    </div>
                  )}

                  {user.location && (
                    <div className={`flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="text-lg">🏠</span>
                      <span>{user.location}</span>
                    </div>
                  )}

                  {user.address && (
                    <div className={`flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span>{user.address}</span>
                    </div>
                  )}

                  {user.country && (
                    <div className={`flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="text-lg">🌍</span>
                      <span>{user.country}</span>
                    </div>
                  )}

                  {user.phone && (
                    <div className={`flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  )}

                  {user.dateOfBirth && (
                    <div className={`flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="text-lg">🎂</span>
                      <span>{new Date(user.dateOfBirth).toLocaleDateString()}</span>
                    </div>
                  )}

                  {user.joinedDate && (
                    <div className={`flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>Joined {new Date(user.joinedDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  {user.website && (
                    <div className={`flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <Globe className="w-4 h-4 flex-shrink-0" />
                      <a
                        href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate"
                      >
                        {user.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Content Area - Posts and Content */}
              <div className="lg:col-span-3 space-y-6">
                {/* Content Filter Buttons */}
                <div className={`rounded-xl shadow-sm p-5 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <style jsx>{`
                      .filter-scroll::-webkit-scrollbar {
                        display: none;
                      }
                    `}</style>
                    <div className="filter-scroll flex items-center gap-3">
                      {filters.map((filter) => (
                        <button
                          key={filter.id}
                          onClick={() => setActiveFilter(filter.id)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap ${
                            activeFilter === filter.id
                              ? 'bg-red-100 text-red-600 border border-red-200'
                              : isDarkMode 
                                ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {filter.icon}
                          <span className="text-sm font-medium">{filter.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Posts Feed */}
                <div className="space-y-6">
                  {(() => {
                    const filteredContent = getFilteredContent();

                    if (filteredContent.length === 0) {
                      return (
                        <div className={`rounded-xl shadow-sm p-8 text-center transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                          <div className="text-gray-400 mb-4">
                            <FileText className="w-16 h-16 mx-auto" />
                          </div>
                          <h3 className={`text-lg font-semibold mb-3 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No content found</h3>
                          <p className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {searchQuery ? 'Try adjusting your search terms' : 'This user hasn\'t shared anything yet'}
                          </p>
                        </div>
                      );
                    }

                    return filteredContent.map((item: any) => {
                      if (item.type === 'album') {
                        return (
                          <div key={item._id} className={`rounded-xl shadow-sm overflow-hidden transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="p-5">
                              <div className="flex items-center gap-3 mb-4">
                                <img
                                  src={user?.avatar ? getMediaUrl(user.avatar) : '/default-avatar.svg'} onError={(e) => { ('❌ Avatar load failed for user:', user?.avatar ? getMediaUrl(user.avatar) : '/default-avatar.svg'); e.currentTarget.src = '/default-avatar.svg'; }}
                                  alt={user?.name || 'User'}
                                  className="w-10 h-10 rounded-full border-2 border-blue-400"
                                />
                                <div>
                                  <h4 className={`font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user?.name || 'User'}</h4>
                                  <p className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Created an album • {new Date(item.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              
                              <h3 className={`text-lg font-semibold mb-4 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</h3>
                              
                              {/* Album Media Grid */}
                              {item.media && item.media.length > 0 && (
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                  {item.media.slice(0, 6).map((media: any, index: number) => (
                                    <img
                                      key={index}
                                      src={getMediaUrl(media.url)}
                                      alt={`Album media ${index + 1}`}
                                      className="w-full aspect-square object-cover rounded-lg"
                                    />
                                  ))}
                                  {item.media.length > 6 && (
                                    <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-500">
                                      +{item.media.length - 6}
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Album Actions */}
                              <div className={`flex items-center gap-4 pt-4 border-t transition-colors duration-200 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                <button className={`flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`}>
                                  <span>❤️</span>
                                  <span className="text-sm">{item.likes?.length || 0}</span>
                                </button>
                                <button className={`flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-500'}`}>
                                  <span>💬</span>
                                  <span className="text-sm">{item.comments?.length || 0}</span>
                                </button>
                                <button className={`flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-400 hover:text-green-400' : 'text-gray-500 hover:text-green-500'}`}>
                                  <span>📤</span>
                                  <span className="text-sm">{item.shares?.length || 0}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div key={item._id} className={`rounded-xl shadow-sm overflow-hidden transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <PostDisplay
                              post={item}
                              onPostUpdate={(updatedPost) => {
                                // Update the post in the local state
                                setPosts(prevPosts => 
                                  prevPosts.map(post => 
                                    post._id === updatedPost._id ? updatedPost : post
                                  )
                                );
                              }}
                              onLike={async (postId) => {
                                try {
                                  const token = localStorage.getItem('token');
                                  if (!token) return;
                                  
                                  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/posts/${postId}/like`, {
                                    method: 'POST',
                                    headers: {
                                      'Authorization': `Bearer ${token}`
                                    }
                                  });
                                  
                                  if (response.ok) {
                                    fetchUserPosts();
                                  }
                                } catch (error) {
                                  console.error('Error liking post:', error);
                                }
                              }}
                              onReaction={async (postId, reactionType) => {
                                try {
                                  const token = localStorage.getItem('token');
                                  if (!token) return;
                                  
                                  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/posts/${postId}/reaction`, {
                                    method: 'POST',
                                    headers: {
                                      'Authorization': `Bearer ${token}`,
                                      'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ reactionType })
                                  });
                                  
                                  if (response.ok) {
                                    fetchUserPosts();
                                  }
                                } catch (error) {
                                  console.error('Error adding reaction:', error);
                                }
                              }}
                              onComment={async (postId, comment) => {
                                try {
                                  const token = localStorage.getItem('token');
                                  if (!token) return;
                                  
                                  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/posts/${postId}/comment`, {
                                    method: 'POST',
                                    headers: {
                                      'Authorization': `Bearer ${token}`,
                                      'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ content: comment })
                                  });
                                  
                                  if (response.ok) {
                                    fetchUserPosts();
                                  }
                                } catch (error) {
                                  console.error('Error commenting on post:', error);
                                }
                              }}
                              onSave={async (postId) => {
                                try {
                                  const token = localStorage.getItem('token');
                                  if (!token) return;
                                  
                                  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/posts/${postId}/save`, {
                                    method: 'POST',
                                    headers: {
                                      'Authorization': `Bearer ${token}`
                                    }
                                  });
                                  
                                  if (response.ok) {
                                    fetchUserPosts();
                                  }
                                } catch (error) {
                                  console.error('Error saving post:', error);
                                }
                              }}
                              onShare={async (postId, shareOptions) => {
                                try {
                                  const token = localStorage.getItem('token');
                                  if (!token) return;
                                  
                                  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/posts/${postId}/share`, {
                                    method: 'POST',
                                    headers: {
                                      'Authorization': `Bearer ${token}`,
                                      'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(shareOptions)
                                  });
                                  
                                  if (response.ok) {
                                    showPopup('success', 'Post Shared', 'Post has been shared successfully!');
                                    fetchUserPosts();
                                  }
                                } catch (error) {
                                  console.error('Error sharing post:', error);
                                  showPopup('error', 'Share Failed', 'Failed to share post');
                                }
                              }}
                              onDelete={handleDeletePost}
                              onEdit={handleEditPost}
                              onToggleComments={async (postId) => {
('Toggle comments for post:', postId);
                              }}
                              isOwner={true}
                              showEditDelete={true}
                            />
                          </div>
                        );
                      }
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other Tabs */}
        {activeTab !== 'timeline' && (
          <div className={`rounded-xl shadow-sm p-8 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {activeTab === 'albums' ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Albums</h3>
                  <button
                    onClick={() => router.push('/dashboard/albums')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Create Album
                  </button>
                </div>
                
                {albums.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {albums.map((album) => (
                      <div key={album._id} className={`rounded-lg p-5 border transition-colors duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600' 
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <h4 className={`font-semibold mb-3 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{album.name}</h4>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          {album.media && album.media.length > 0 ? (
                            album.media.slice(0, 6).map((media: any, index: number) => (
                              <img
                                key={index}
                                src={getMediaUrl(media.url)}
                                alt="album media"
                                className="w-full aspect-square object-cover rounded"
                              />
                            ))
                          ) : (
                            <div className="col-span-3 text-xs text-gray-400 py-4 text-center">No media</div>
                          )}
                          {album.media && album.media.length > 6 && (
                            <div className="aspect-square bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                              +{album.media.length - 6}
                            </div>
                          )}
                        </div>
                        <p className={`text-xs transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Created: {new Date(album.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-200 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className={`text-lg font-medium mb-3 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No albums yet</h4>
                    <p className={`mb-6 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Create your first album to share your photos and videos</p>
                    <button
                      onClick={() => router.push('/dashboard/albums')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Create Album
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className={`text-xl font-semibold mb-3 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h3>
                <p className={`transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>This section is coming soon!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Post Modal */}
      {showEditModal && editingPost && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-6 bg-black bg-opacity-50">
          <div className={`rounded-lg shadow-xl max-w-md w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-4 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit Post</h3>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className={`w-full h-32 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="What's on your mind?"
            />
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPost(null);
                  setEditContent('');
                }}
                className={`flex-1 px-4 py-2.5 border rounded-lg transition-colors text-base ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-base"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup */}
      <Popup popup={popup} onClose={closePopup} />
    </div>
  );
};

export default ProfilePage;
