"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AlbumDisplay from '@/components/AlbumDisplay';
import SharePopup, { ShareOptions } from '@/components/SharePopup';
import LatestProducts from '@/components/LatestProducts';
import Popup from '@/components/Popup';
import type { PopupState } from '@/components/Popup';
import PostOptionsDropdown from '@/components/PostOptionsDropdown';
import FeedPost from '@/components/FeedPost';
import ReelsCreationModal from '@/components/ReelsCreationModal';
import StoryCreationModal from '@/components/StoryCreationModal';
import StoryViewer from '@/components/StoryViewer';
import PeopleYouMayKnow from '@/components/PeopleYouMayKnow';
import LocationDetector from '@/components/LocationDetector';
import LocationDisplay from '@/components/LocationDisplay';

import { isAuthenticated, clearAuth, getCurrentUserId } from '@/utils/auth';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
import {
  searchGifsApi,
  getTrendingGifsApi,
  uploadFileApi,
  uploadMultipleFilesApi
} from '@/utils/api';

function getUserAvatar() {
  try {
    // First check userImages (prioritize this as it's more up-to-date)
    const userImages = JSON.parse(localStorage.getItem('userImages') || '{}');

    if (userImages.avatar) {
      if (userImages.avatar.includes('localhost:3000')) {
        const correctedUrl = userImages.avatar.replace('http://localhost:3000', 'https://jaifriend.hgdjlive.com');
        return correctedUrl;
      }

      // Handle avatar URLs properly
      if (userImages.avatar.includes('/avatars/') || userImages.avatar.includes('/covers/')) {
        // For avatar paths, construct the full URL
        const baseUrl = API_URL;
        if (userImages.avatar.startsWith('http')) {
          return userImages.avatar;
        }
        // Remove leading slash to avoid double slashes
        const cleanUrl = userImages.avatar.startsWith('/') ? userImages.avatar.substring(1) : userImages.avatar;
        const fullUrl = `${baseUrl}/${cleanUrl}`;
        return fullUrl;
      }

      const baseUrl = API_URL;
      if (userImages.avatar.startsWith('http')) {
        return userImages.avatar;
      }
      // Remove leading slash to avoid double slashes
      const cleanUrl = userImages.avatar.startsWith('/') ? userImages.avatar.substring(1) : userImages.avatar;
      const fullUrl = `${baseUrl}/${cleanUrl}`;
      return fullUrl;
    }

    // Fallback to user data
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (user.avatar) {
      if (user.avatar.includes('localhost:3000')) {
        const correctedUrl = user.avatar.replace('http://localhost:3000', 'https://jaifriend-frontend-n6zr.vercel.app');
        return correctedUrl;
      }

      // Handle avatar URLs properly
      if (user.avatar.includes('/avatars/') || user.avatar.includes('/covers/')) {
        // For avatar paths, construct the full URL
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
        if (user.avatar.startsWith('http')) {
          return user.avatar;
        }
        // Remove leading slash to avoid double slashes
        const cleanUrl = user.avatar.startsWith('/') ? user.avatar.substring(1) : user.avatar;
        const fullUrl = `${baseUrl}/${cleanUrl}`;
        return fullUrl;
      }

      const baseUrl = API_URL;
      if (user.avatar.startsWith('http')) {
        return user.avatar;
      }
      // Remove leading slash to avoid double slashes
      const cleanUrl = user.avatar.startsWith('/') ? user.avatar.substring(1) : user.avatar;
      const fullUrl = `${baseUrl}/${cleanUrl}`;
      return fullUrl;
    }

    return '/default-avatar.svg';
  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
    }
    return '/default-avatar.svg';
  }
}

function getUserId(user: any): string {
  if (!user) {
    return '';
  }

  if (user.userId && typeof user.userId === 'object' && user.userId._id) {
    return user.userId._id;
  }

  if (typeof user._id === 'string') {
    return user._id;
  }
  if (typeof user.id === 'string') {
    return user.id;
  }
  if (typeof user.userId === 'string') {
    return user.userId;
  }

  if (user._id && typeof user._id === 'object' && user._id.toString) {
    const id = user._id.toString();
    return id;
  }
  if (user.id && typeof user.id === 'object' && user.id.toString) {
    const id = user.id.toString();
    return id;
  }
  if (user.userId && typeof user.userId === 'object' && user.userId.toString) {
    const id = user.userId.toString();
    return id;
  }

  const fallbackId = String(user._id || user.id || user.userId || '');

  if (!fallbackId || fallbackId === 'undefined' || fallbackId === 'null') {
    return '';
  }

  return fallbackId;
}

export default function Dashboard() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'text' | 'photos' | 'videos' | 'sounds' | 'files' | 'maps'>('all');
  const [deletingComments, setDeletingComments] = useState<{ [key: string]: boolean }>({});
  const [showWatchModal, setShowWatchModal] = useState(false);
  const [selectedPostForWatch, setSelectedPostForWatch] = useState<any>(null);


  // Open watch view for post/album
  const openWatchView = (post: any) => {
    // Set the type based on whether it's a post or album
    const itemWithType = {
      ...post,
      type: post.type || (post.media && Array.isArray(post.media) ? 'album' : 'post')
    };
    setSelectedPostForWatch(itemWithType);
    setShowWatchModal(true);
  };

  // Filter posts based on active filter
  const getFilteredPosts = () => {
    if (activeFilter === 'all') {
      return posts;
    }

    return posts.filter(post => {
      switch (activeFilter) {
        case 'text':
          return !post.media || post.media.length === 0;
        case 'photos':
          return post.media && post.media.some((media: any) => media.type === 'image');
        case 'videos':
          return post.media && post.media.some((media: any) => media.type === 'video');
        case 'sounds':
          return post.voice || (post.media && post.media.some((media: any) => media.type === 'audio'));
        case 'files':
          return post.media && post.media.some((media: any) => media.type === 'file' || media.type === 'application');
        case 'maps':
          return post.location;
        default:
          return true;
      }
    });
  };
  const [newPost, setNewPost] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [posting, setPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editMediaFiles, setEditMediaFiles] = useState<File[]>([]);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [modalMediaFiles, setModalMediaFiles] = useState<File[]>([]);
  const [modalMediaType, setModalMediaType] = useState<string>('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const modalImageInputRef = useRef<HTMLInputElement>(null);
  const modalVideoInputRef = useRef<HTMLInputElement>(null);
  const modalAudioInputRef = useRef<HTMLInputElement>(null);
  const modalFileUploadRef = useRef<HTMLInputElement>(null);

  const [openDropdownPostId, setOpenDropdownPostId] = useState<string | null>(null);

  const [showSharePopup, setShowSharePopup] = useState(false);
  const [selectedPostForShare, setSelectedPostForShare] = useState<any>(null);
  const [showReelsModal, setShowReelsModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [selectedUserStories, setSelectedUserStories] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);

  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const showPopup = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    setPopup({ isOpen: true, type, title, message });

    // Auto-close success popup after 3 seconds
    if (type === 'success') {
      setTimeout(() => {
        setPopup(prev => ({ ...prev, isOpen: false }));
      }, 3000);
    }
  };

  const closePopup = () => {
    setPopup({ ...popup, isOpen: false });
  };

  const logout = () => {
    clearAuth();
    router.push('/login');
  };

  const startEditPost = (post: any) => {
    setEditingPostId(post._id || post.id);
    setEditContent(post.content);
    setEditTitle(post.title || '');
    setEditMediaFiles([]);
  };

  const cancelEditPost = () => {
    setEditingPostId(null);
    setEditContent('');
    setEditTitle('');
    setEditMediaFiles([]);
  };

  const handleEditPost = async (postId: string) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('content', editContent);

    // Add title if provided
    if (editTitle.trim()) {
      formData.append('title', editTitle.trim());
    }

    editMediaFiles.forEach(file => formData.append('media', file));

    const res = await fetch(`${API_URL}/api/posts/${postId}`, {
      method: 'PUT',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });

    if (res.ok) {
      const updatedPost = await res.json();
      setPosts(posts => posts.map(p => (p._id === postId || p.id === postId) ? updatedPost : p));
      cancelEditPost();
      window.dispatchEvent(new CustomEvent('postUpdated'));
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    const token = localStorage.getItem('token');
    const commentKey = `${postId}-${commentId}`;

    setDeletingComments(prev => ({ ...prev, [commentKey]: true }));

    try {
      const url = `${API_URL}/api/posts/${postId}/comment/${commentId}`;

      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(posts => posts.map(p => (p._id === postId || p.id === postId) ? data.post : p));
        showPopup('success', 'Success', 'Comment deleted successfully');
      } else {
        showPopup('error', 'Error', 'Failed to delete comment. Please try again.');
      }
    } catch (error) {
      showPopup('error', 'Error', 'Network error. Please check your connection and try again.');
    } finally {
      setDeletingComments(prev => ({ ...prev, [commentKey]: false }));
    }
  };

  const handleDeleteAlbumComment = async (albumId: string, commentId: string) => {
    const token = localStorage.getItem('token');
    const commentKey = `album-${albumId}-${commentId}`;

    setDeletingComments(prev => ({ ...prev, [commentKey]: true }));

    try {
      const url = `${API_URL}/api/albums/${albumId}/comment/${commentId}`;

      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (res.ok) {
        const data = await res.json();
        setAlbums(albums => albums.map(a => a._id === albumId ? data.album : a));
        showPopup('success', 'Success', 'Comment deleted successfully');
      } else {
        showPopup('error', 'Error', 'Failed to delete comment. Please try again.');
      }
    } catch (error) {
      showPopup('error', 'Error', 'Network error. Please check your connection and try again.');
    } finally {
      setDeletingComments(prev => ({ ...prev, [commentKey]: false }));
    }
  };

  const fetchFeedData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Use the correct posts endpoint that populates user data
      let postsData = [];
      try {
        const postsResponse = await fetch(`${API_URL}/api/posts`, token ? { headers: { 'Authorization': `Bearer ${token}` } } : {});
        if (postsResponse.ok) {
          postsData = await postsResponse.json();
        }
      } catch (error) {
      }

      const albumsResponse = await fetch(`${API_URL}/api/albums`, token ? { headers: { 'Authorization': `Bearer ${token}` } } : {});
      const albumsData = albumsResponse.ok ? await albumsResponse.json() : [];

      // If posts don't have populated user data, try to fetch user info for each post
      if (postsData.length > 0 && !postsData[0].user?.avatar) {
        const postsWithUserData = await Promise.all(
          postsData.map(async (post: any) => {
            try {
              // Check if post has user ID (could be in user field as string or userId field)
              const userId = post.user || post.userId;
              if (userId && typeof userId === 'string') {
                const userResponse = await fetch(`${API_URL}/api/users/${userId}`, {
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                if (userResponse.ok) {
                  const userData = await userResponse.json();
                  return {
                    ...post,
                    user: {
                      _id: userData._id,
                      name: userData.name,
                      username: userData.username,
                      avatar: userData.avatar
                    }
                  };
                }
              }
              return post;
            } catch (error) {
              // Only log errors in development
              if (process.env.NODE_ENV === 'development') {
              }
              return post;
            }
          })
        );
        postsData = postsWithUserData;
      }

      const combinedFeed = [
        ...postsData.map((post: any) => ({ ...post, type: 'post' })),
        ...albumsData.map((album: any) => ({ ...album, type: 'album' }))
      ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setPosts(postsData);
      setAlbums(albumsData);
    } catch (error) {
    } finally {
      setLoadingPosts(false);
      setLoadingAlbums(false);
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');

      if (!token || token === 'null' || token === 'undefined') {
        router.push('/');
        return;
      }

      fetchFeedData();
      fetchStories();
      fetchLatestPages();
      fetchSuggestedPages();
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const handleAlbumCreated = () => fetchFeedData();
    const handleAlbumDeleted = () => fetchFeedData();
    const handleAlbumShared = () => fetchFeedData();
    const handlePostCreated = () => fetchFeedData();
    const handlePostDeleted = () => fetchFeedData();

    // Handle post updates more efficiently
    const handlePostUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.postId && customEvent.detail.updatedPost) {
        // Update specific post instead of refetching all data
        setPosts(posts => posts.map(p =>
          p._id === customEvent.detail.postId ? customEvent.detail.updatedPost : p
        ));
      } else {
        // Fallback to refetching all data if no specific update info
        fetchFeedData();
      }
    };

    window.addEventListener('albumCreated', handleAlbumCreated);
    window.addEventListener('albumDeleted', handleAlbumDeleted);
    window.addEventListener('albumShared', handleAlbumShared);
    window.addEventListener('postCreated', handlePostCreated);
    window.addEventListener('postDeleted', handlePostDeleted);
    window.addEventListener('postUpdated', handlePostUpdated);

    return () => {
      window.removeEventListener('albumCreated', handleAlbumCreated);
      window.removeEventListener('albumDeleted', handleAlbumDeleted);
      window.removeEventListener('albumShared', handleAlbumShared);
      window.removeEventListener('postCreated', handlePostCreated);
      window.removeEventListener('postDeleted', handlePostDeleted);
      window.removeEventListener('postUpdated', handlePostUpdated);
    };
  }, []);

  useEffect(() => {
    const trackViews = async () => {
      const token = localStorage.getItem('token');
      if (token && posts.length > 0) {
        const postsToTrack = posts.slice(0, 5);
        for (const post of postsToTrack) {
          try {
            await fetch(`${API_URL}/api/posts/${post._id}/view`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
          } catch (error) {
            // Silent fail
          }
        }
      }
    };

    if (posts.length > 0) {
      trackViews();
    }
  }, [posts]);

  useEffect(() => {
    const trackAlbumViews = async () => {
      const token = localStorage.getItem('token');
      if (token && albums.length > 0) {
        const albumsToTrack = albums.slice(0, 3);
        for (const album of albumsToTrack) {
          try {
            await fetch(`${API_URL}/api/albums/${album._id}/view`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
          } catch (error) {
            // Silent fail
          }
        }
      }
    };

    if (albums.length > 0) {
      trackAlbumViews();
    }
  }, [albums]);

  const handlePost = async () => {
    if (!newPost.trim() && !mediaFiles.length) {
      showPopup('error', 'Empty Post', 'Please add some content or media to your post');
      return;
    }

    // Check word limit
    const wordCount = newPost.split(/\s+/).filter(word => word && word.length > 0).length;
    if (wordCount > 300) {
      showPopup('error', 'Word Limit Exceeded', 'Your post cannot exceed 300 words. Please shorten your message.');
      return;
    }

    setPosting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showPopup('error', 'Authentication Error', 'Please log in again to create posts');
        return;
      }

      const formData = new FormData();
      // Preserve content exactly as typed/pasted - no trimming to maintain formatting
      formData.append('content', newPost);

      // Add title if provided
      if (newPostTitle.trim()) {
        formData.append('title', newPostTitle.trim());
      }

      mediaFiles.forEach((file, index) => {
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File "${file.name}" is too large. Maximum size is 10MB.`);
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];
        if (!validTypes.includes(file.type)) {
          throw new Error(`File "${file.name}" has an unsupported format. Please use images (JPEG, PNG, GIF, WebP) or videos (MP4, WebM, OGG).`);
        }

        formData.append('media', file);
      });

      const res = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const post = await res.json();

        // Ensure the new post has user data
        let postWithUserData = post;
        if (!post.user?.avatar) {
          try {
            const token = localStorage.getItem('token');
            if (token && post.userId) {
              const userResponse = await fetch(`${API_URL}/api/users/${post.userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (userResponse.ok) {
                const userData = await userResponse.json();
                postWithUserData = {
                  ...post,
                  user: {
                    _id: userData._id,
                    name: userData.name,
                    username: userData.name,
                    avatar: userData.avatar
                  }
                };
              }
            }
          } catch (error) {
            // Only log errors in development
            if (process.env.NODE_ENV === 'development') {
            }
          }
        }

        setPosts([postWithUserData, ...posts]);
        setNewPost('');
        setNewPostTitle('');

        // Clean up object URLs before clearing media files
        mediaFiles.forEach(file => {
          if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
            const tempUrl = URL.createObjectURL(file);
            URL.revokeObjectURL(tempUrl);
          }
        });

        setMediaFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = '';

        showPopup('success', 'Post Created!', 'Your post has been shared successfully!');
        window.dispatchEvent(new CustomEvent('postCreated'));
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || 'Failed to create post. Please try again.';
        showPopup('error', 'Post Failed', errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create post. Please try again.';
      showPopup('error', 'Post Failed', errorMessage);
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setPostToDelete(id);

    setPopup({
      isOpen: true,
      type: 'warning',
      title: 'Delete Post',
      message: 'Are you sure you want to delete this post? This action cannot be undone.',
      showConfirm: true,
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });
  };

  // Handle post updates (for polls, reactions, etc.)
  const handlePostUpdate = (updatedPost: any) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === updatedPost._id || post.id === updatedPost.id ? updatedPost : post
      )
    );
  };

  const handleToggleComments = async (postId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showPopup('error', 'Authentication Error', 'Please login to modify post settings');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/posts/${postId}/toggle-comments`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(posts => posts.map(p =>
          (p._id === postId || p.id === postId) ? { ...p, commentsEnabled: data.commentsEnabled } : p
        ));
        showPopup('success', 'Success', `Comments ${data.commentsEnabled ? 'enabled' : 'disabled'} successfully`);
      } else {
        showPopup('error', 'Error', 'Failed to toggle comments');
      }
    } catch (error) {
      showPopup('error', 'Network Error', 'Failed to connect to server');
    }
  };

  const handleOpenInNewTab = (post: any) => {
    const postUrl = `${window.location.origin}/dashboard/post/${post._id || post.id}`;
    window.open(postUrl, '_blank');
  };

  const handlePinPost = async (postId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showPopup('error', 'Authentication Error', 'Please login to pin posts');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/posts/${postId}/pin`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(posts => posts.map(p =>
          (p._id === postId || p.id === postId) ? { ...p, isPinned: data.isPinned } : p
        ));
        showPopup('success', 'Success', `Post ${data.isPinned ? 'pinned' : 'unpinned'} successfully`);
      } else {
        showPopup('error', 'Error', 'Failed to pin/unpin post');
      }
    } catch (error) {
      showPopup('error', 'Network Error', 'Failed to connect to server');
    }
  };

  const handleBoostPost = async (postId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showPopup('error', 'Authentication Error', 'Please login to boost posts');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/posts/${postId}/boost`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(posts => posts.map(p =>
          (p._id === postId || p.id === postId) ? { ...p, isBoosted: data.isBoosted } : p
        ));
        showPopup('success', 'Success', `Post ${data.isBoosted ? 'boosted' : 'unboosted'} successfully`);
      } else {
        showPopup('error', 'Error', 'Failed to boost/unboost post');
      }
    } catch (error) {
      showPopup('error', 'Network Error', 'Failed to connect to server');
    }
  };

  const handlePopupConfirm = async () => {
    if (popup.title === 'Delete Post' && postToDelete) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          showPopup('error', 'Authentication Error', 'Please log in again to delete posts.');
          return;
        }

        const deletePostId = postToDelete;
        showPopup('info', 'Deleting Post', 'Please wait while we delete your post...');

        const res = await fetch(`${API_URL}/api/posts/${deletePostId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          setPosts(posts.filter(p => (p._id || p.id) !== deletePostId));
          if (editingPostId === deletePostId) cancelEditPost();
          setPostToDelete(null);
          showPopup('success', 'Post Deleted', 'Your post has been successfully deleted.');
          window.dispatchEvent(new CustomEvent('postDeleted'));
        } else {
          const errorData = await res.json().catch(() => ({}));
          const errorMessage = errorData.message || 'Failed to delete post. Please try again.';
          showPopup('error', 'Delete Failed', errorMessage);
        }
      } catch (error) {
        showPopup('error', 'Network Error', 'Failed to connect to server. Please check your internet connection.');
      }
    }
  };

  const handleLike = async (postId: string) => {
    const currentPost = posts.find(p => (p._id === postId || p.id === postId));
    const token = localStorage.getItem('token');

    if (!token) {
      showPopup('error', 'Authentication Error', 'Please login to like posts');
      return;
    }

    // Optimistic update for better UX
    const originalPosts = [...posts];
    setPosts(prevPosts => {
      return prevPosts.map(p => {
        if (p._id === postId || p.id === postId) {
          const currentUserId = getCurrentUserId();
          const isCurrentlyLiked = p.likes?.includes(currentUserId);

          const newLikes = isCurrentlyLiked
            ? p.likes?.filter((id: string) => id !== currentUserId) || []
            : [...(p.likes || []), currentUserId];

          return {
            ...p,
            likes: newLikes
          };
        }
        return p;
      });
    });

    try {
      const apiUrl = `${API_URL}/api/posts/${postId}/like`;

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        // Update with server response
        setPosts(prevPosts => {
          const updatedPosts = prevPosts.map(p => {
            if (p._id === postId || p.id === postId) {
              return data.post;
            }
            return p;
          });
          return updatedPosts;
        });

        // Show success message
        const isLiked = data.post.likes?.includes(getCurrentUserId());
        showPopup('success', 'Success', `Post ${isLiked ? 'liked' : 'unliked'} successfully!`);
      } else {
        // Revert optimistic update on error
        setPosts(originalPosts);

        let errorMessage = 'Unknown error';
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorData.error || 'Unknown error';
        } catch (parseError) {
          try {
            const responseText = await res.text();
            errorMessage = responseText || 'Unknown error';
          } catch (textError) {
            errorMessage = `HTTP ${res.status}: ${res.statusText}`;
          }
        }

        showPopup('error', 'Error', `Failed to like post: ${errorMessage}`);
      }
    } catch (error) {
      // Revert optimistic update on network error
      setPosts(originalPosts);
      showPopup('error', 'Network Error', 'Failed to connect to server. Please check your internet connection.');
    }
  };

  const handleReaction = async (postId: string, reactionType: string) => {
    const token = localStorage.getItem('token');

    if (!token) {
      showPopup('error', 'Authentication Error', 'Please login to add reactions');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/posts/${postId}/reaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reactionType })
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(posts => posts.map(p => (p._id === postId || p.id === postId) ? data.post : p));
      } else {
        showPopup('error', 'Error', 'Failed to add reaction. Please try again.');
      }
    } catch (error) {
      showPopup('error', 'Network Error', 'Failed to connect to server. Please check your internet connection.');
    }
  };



  const handleSave = async (postId: string) => {
    const token = localStorage.getItem('token');

    if (!token) {
      showPopup('error', 'Authentication Error', 'Please login to save posts');
      return;
    }

    try {
      const apiUrl = `${API_URL}/api/posts/${postId}/save`;

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();

        setPosts(posts => posts.map(p => (p._id === postId || p.id === postId) ? {
          ...p,
          savedBy: data.savedBy || p.savedBy,
          saved: data.saved
        } : p));

        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('postSaved', {
          detail: { postId, savedBy: data.savedBy, saved: data.saved }
        }));

        // Show success message
        const isSaved = data.saved || (data.savedBy && data.savedBy.length > 0);
        showPopup('success', 'Success', `Post ${isSaved ? 'saved' : 'removed from saved'} successfully!`);
      } else {
        let errorData: any = {};
        try {
          errorData = await res.json();
        } catch (parseError) {
          // Silent fail
        }

        // Show error message
        showPopup('error', 'Save Failed', errorData.message || `Failed to save post (Status: ${res.status})`);
      }
    } catch (error) {
      showPopup('error', 'Network Error', 'Failed to connect to server');
    }
  };

  const handleAddComment = async (postId: string, commentText: string) => {
    if (!commentText.trim()) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: commentText })
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(posts => posts.map(p => (p._id === postId || p.id === postId) ? {
          ...p,
          comments: [...(p.comments || []), data.comment]
        } : p));
      }
    } catch (error) {
      // Silent fail
    }
  };

  const handleShare = (postId: string, shareOptions: ShareOptions) => {
    setSelectedPostForShare({ id: postId, ...shareOptions });
    setShowSharePopup(true);
  };

  const handleReelShare = async (reelData: any) => {
    try {
      // Here you would typically upload the reel to your backend
      // For now, we'll just redirect to the reels page
      showPopup('success', 'Reel Created!', 'Your reel has been created successfully!');

      // Redirect to reels page (you'll need to create this page)
      router.push('/dashboard/reels');
    } catch (error) {
      showPopup('error', 'Error', 'Failed to create reel. Please try again.');
    }
  };

  const handleView = async (postId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/posts/${postId}/view`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(posts => posts.map(p =>
          (p._id === postId || p.id === postId) ? { ...p, views: data.views } : p
        ));
      }
    } catch (error) {
      // Silent fail
    }
  };

  const handleAlbumDelete = async (albumId: string) => {
    if (!window.confirm('Delete this album?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/api/albums/${albumId}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    if (res.ok) {
      setAlbums(prev => prev.filter(album => album._id !== albumId));
    }
  };

  const handleAlbumLike = async (albumId: string) => {
    const token = localStorage.getItem('token');

    if (!token) {
      showPopup('error', 'Authentication Error', 'Please login to like albums');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/albums/${albumId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        setAlbums(albums => albums.map(a => a._id === albumId ? data.album : a));
      } else {
        showPopup('error', 'Error', 'Failed to like album. Please try again.');
      }
    } catch (error) {
      showPopup('error', 'Network Error', 'Failed to connect to server. Please check your internet connection.');
    }
  };

  const handleAlbumReaction = async (albumId: string, reactionType: string) => {
    const token = localStorage.getItem('token');

    if (!token) {
      showPopup('error', 'Authentication Error', 'Please login to add reactions');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/albums/${albumId}/reaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reactionType })
      });

      if (res.ok) {
        const data = await res.json();
        setAlbums(albums => albums.map(a => a._id === albumId ? data.album : a));
      } else {
        showPopup('error', 'Error', 'Failed to add reaction. Please try again.');
      }
    } catch (error) {
      showPopup('error', 'Network Error', 'Failed to connect to server. Please check your internet connection.');
    }
  };

  const handleAlbumComment = async (albumId: string, comment: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/albums/${albumId}/comment`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: comment })
      });
      if (res.ok) {
        const data = await res.json();
        setAlbums(prev => prev.map(album =>
          album._id === albumId ? { ...album, comments: [...(album.comments || []), data.comment] } : album
        ));
      }
    } catch (error) {
      // Silent fail
    }
  };

  const handleAlbumSave = async (albumId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/albums/${albumId}/save`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAlbums(prev => prev.map(album =>
          album._id === albumId ? { ...album, savedBy: data.savedBy, saved: data.saved } : album
        ));

        window.dispatchEvent(new CustomEvent('albumSaved'));
      }
    } catch (error) {
      // Silent fail
    }
  };

  const handleAlbumShare = async (albumId: string, shareOptions?: ShareOptions) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/albums/${albumId}/share`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: shareOptions?.customMessage || '',
          shareTo: shareOptions?.shareTo || 'friends',
          shareOnTimeline: shareOptions?.shareOnTimeline || false,
          shareToPage: shareOptions?.shareToPage || false,
          shareToGroup: shareOptions?.shareToGroup || false
        })
      });

      if (res.ok) {
        const data = await res.json();

        setAlbums(prev => prev.map(album =>
          album._id === albumId ? { ...album, shares: data.shares, shared: data.shared } : album
        ));

        showPopup('success', 'Album Shared!', 'Your album has been shared successfully!');
        window.dispatchEvent(new CustomEvent('albumShared'));
        fetchFeedData();
      } else {
        const errorData = await res.json();
        showPopup('error', 'Share Failed', errorData.message || 'Failed to share album');
      }
    } catch (error) {
      showPopup('error', 'Network Error', 'Failed to share album. Please try again.');
    }
  };

  const getMediaUrl = (url: string) => {
    if (!url) {
      return '/default-avatar.svg';
    }
    if (url.startsWith('http')) {
      return url;
    }
    // Remove leading slash to avoid double slashes
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    return `${API_URL}/${cleanUrl}`;
  };

  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) setUserEmail(email);

    // Debug: Check what's in localStorage (only in development)
    if (process.env.NODE_ENV === 'development') {
      const user = localStorage.getItem("user");
      const userImages = localStorage.getItem("userImages");
    }
  }, []);


  const [userStory, setUserStory] = useState<string | null>(null);
  const storyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedStory = localStorage.getItem('userStory');
    if (savedStory) setUserStory(savedStory);
  }, []);

  // Listen for avatar updates and refresh the page
  useEffect(() => {
    const handleProfileUpdated = () => {
      if (process.env.NODE_ENV === 'development') {
      }
      window.location.reload();
    };

    const handleImagesUpdated = () => {
      if (process.env.NODE_ENV === 'development') {
      }
      window.location.reload();
    };

    window.addEventListener('profileUpdated', handleProfileUpdated);
    window.addEventListener('imagesUpdated', handleImagesUpdated);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdated);
      window.removeEventListener('imagesUpdated', handleImagesUpdated);
    };
  }, []);

  // Fetch and update current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/users/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const userData = await response.json();

          // Update localStorage with fresh user data
          localStorage.setItem('user', JSON.stringify(userData));

          // Also fetch user images
          const imagesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/userimages`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (imagesResponse.ok) {
            const imagesData = await imagesResponse.json();
            localStorage.setItem('userImages', JSON.stringify(imagesData));
          }
        }
      } catch (error) {
        // Only log errors in development
        if (process.env.NODE_ENV === 'development') {
        }
      }
    };

    fetchCurrentUser();
  }, []);

  const handleStoryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setUserStory(reader.result);
          localStorage.setItem('userStory', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // New story system functions

  // Group stories by user to avoid duplicates
  const groupStoriesByUser = (stories: any[]) => {
    const grouped = new Map();

    stories.forEach(story => {
      const userId = story.user._id || story.user.id;

      if (!grouped.has(userId)) {
        grouped.set(userId, {
          user: story.user,
          stories: [],
          latestStory: story
        });
      }

      grouped.get(userId).stories.push(story);

      // Keep the most recent story as the latest
      if (new Date(story.createdAt) > new Date(grouped.get(userId).latestStory.createdAt)) {
        grouped.get(userId).latestStory = story;
      }
    });

    const result = Array.from(grouped.values());
    return result;
  };

  const fetchStories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/stories/feed`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        let storiesData = data.stories || [];

        // If stories don't have populated user data, try to fetch user info for each story
        if (storiesData.length > 0 && !storiesData[0].user?.avatar) {
          const storiesWithUserData = await Promise.all(
            storiesData.map(async (story: any) => {
              try {
                // Check if story has user ID (could be in user field as string or userId field)
                const userId = story.user || story.userId;
                if (userId && typeof userId === 'string') {
                  const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/users/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  if (userResponse.ok) {
                    const userData = await userResponse.json();
                    return {
                      ...story,
                      user: {
                        _id: userData._id,
                        name: userData.name,
                        username: userData.username,
                        avatar: userData.avatar
                      }
                    };
                  }
                }
                return story;
              } catch (error) {
                // Only log errors in development
                if (process.env.NODE_ENV === 'development') {
                }
                return story;
              }
            })
          );
          storiesData = storiesWithUserData;
        }

        setStories(storiesData);
      }
    } catch (error) {
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
      }
    } finally {
      setLoadingStories(false);
    }
  };

  const fetchLatestPages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      setLoadingPages(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/pages/latest`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLatestPages(data.pages || data || []);
      }
    } catch (error) {
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
      }
    } finally {
      setLoadingPages(false);
    }
  };

  const fetchSuggestedPages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      setLoadingSuggestedPages(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/pages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestedPages(data.pages || data || []);
      }
    } catch (error) {
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
      }
    } finally {
      setLoadingSuggestedPages(false);
    }
  };

  const handleStorySuccess = (storyData: any) => {
    setStories(prev => [storyData, ...prev]);
    showPopup('success', 'Story Created!', 'Your story has been shared successfully!');
  };

  const handleStoryDelete = async (storyId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/stories/${storyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setStories(prev => prev.filter(story => story._id !== storyId));
        showPopup('success', 'Story Deleted', 'Your story has been deleted successfully!');
      }
    } catch (error) {
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
      }
      showPopup('error', 'Error', 'Failed to delete story');
    }
  };

  const handleStoryReact = async (storyId: string, reactionType: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/stories/${storyId}/react`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reactionType })
      });

      if (response.ok) {
        // Update stories state with new reaction
        const updatedStories = stories.map(story => {
          if (story._id === storyId) {
            return { ...story, reactions: [...story.reactions, { userId: 'current', type: reactionType, createdAt: new Date().toISOString() }] };
          }
          return story;
        });
        setStories(updatedStories);
      }
    } catch (error) {
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
      }
    }
  };

  const handleStoryReply = async (storyId: string, content: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/stories/${storyId}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        // Update stories state with new reply
        const updatedStories = stories.map(story => {
          if (story._id === storyId) {
            return { ...story, replies: [...story.replies, { userId: 'current', content, createdAt: new Date().toISOString() }] };
          }
          return story;
        });
        setStories(updatedStories);
      }
    } catch (error) {
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
      }
    }
  };

  const openStoryViewer = (groupedStoryIndex: number) => {
    const groupedStories = groupStoriesByUser(stories);
    const selectedGroupedStory = groupedStories[groupedStoryIndex];

    if (selectedGroupedStory) {
      // Set the selected user's stories and show viewer
      setSelectedUserStories(selectedGroupedStory.stories);
      setSelectedStoryIndex(0); // Always start from first story of the user
      setShowStoryViewer(true);
    }
  };

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  const [latestPages, setLatestPages] = useState<any[]>([]);
  const [suggestedPages, setSuggestedPages] = useState<any[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [loadingSuggestedPages, setLoadingSuggestedPages] = useState(false);

  const navigateToProfile = (userId: string) => {
    window.location.href = `/dashboard/profile/${userId}`;
  };





  // Modal media handlers
  const handleModalImageUpload = () => {
    modalImageInputRef.current?.click();
  };

  const handleModalVideoUpload = () => {
    modalVideoInputRef.current?.click();
  };

  const handleModalAudioUpload = () => {
    modalAudioInputRef.current?.click();
  };

  const handleModalFileUpload = () => {
    modalFileUploadRef.current?.click();
  };

  const handleModalMediaChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);

      const validFiles = fileArray.filter(file => {
        if (file.size > 100 * 1024 * 1024) {
          showPopup('error', 'File Too Large', `File "${file.name}" is too large. Maximum size is 100MB.`);
          return false;
        }

        // Check file type based on the upload type
        let isValid = false;
        switch (type) {
          case 'image':
            isValid = file.type.startsWith('image/');
            break;
          case 'video':
            isValid = file.type.startsWith('video/');
            break;
          case 'audio':
            isValid = file.type.startsWith('audio/') || file.name.toLowerCase().endsWith('.mp3') || file.name.toLowerCase().endsWith('.wav') || file.name.toLowerCase().endsWith('.ogg') || file.name.toLowerCase().endsWith('.aac');
            break;
          case 'file':
            isValid = file.type.startsWith('application/') || file.type.startsWith('text/') || file.name.toLowerCase().endsWith('.pdf') || file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.txt');
            break;
          default:
            isValid = true;
        }

        if (!isValid) {
          showPopup('error', 'Unsupported Format', `File "${file.name}" is not a valid ${type} file.`);
          return false;
        }

        return true;
      });

      if (validFiles.length > 0) {
        setModalMediaFiles(prev => [...prev, ...validFiles]);
        setModalMediaType(type);
        showPopup('success', 'Files Added', `${validFiles.length} ${type} file(s) added successfully!`);
      }
    }
  };

  const removeModalMedia = (index: number) => {
    // Clean up object URL before removing the file
    const fileToRemove = modalMediaFiles[index];
    if (fileToRemove && (fileToRemove.type.startsWith('image/') || fileToRemove.type.startsWith('video/'))) {
      // Create a temporary URL to find and revoke the existing one
      const tempUrl = URL.createObjectURL(fileToRemove);
      URL.revokeObjectURL(tempUrl);
    }

    setModalMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearModalMedia = () => {
    // Clean up all object URLs
    modalMediaFiles.forEach(file => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const tempUrl = URL.createObjectURL(file);
        URL.revokeObjectURL(tempUrl);
      }
    });

    setModalMediaFiles([]);
    setModalMediaType('');
  };

  const handleModalPost = async () => {
    if (!newPost.trim() && modalMediaFiles.length === 0) {
      showPopup('error', 'Empty Post', 'Please add some content or media to your post');
      return;
    }

    try {
      setPosting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        showPopup('error', 'Authentication Error', 'Please log in again');
        return;
      }

      // Separate files by type - now we can send all file types to backend
      const allFiles = modalMediaFiles;

      // Create the post data object
      const postData: any = {
        content: newPost
      };

      // Add new post type data
      if (selectedGif) {
        postData.gif = selectedGif;
      }

      if (voiceRecording) {
        postData.voice = voiceRecording;
        postData.voiceData = {
          duration: recordingTime,
          transcription: 'Voice recording', // In real app, this would use speech-to-text API
          isPublic: true
        };
      }

      if (selectedFeeling) {
        postData.feeling = {
          type: selectedFeeling.type,
          intensity: 5,
          emoji: selectedFeeling.emoji,
          description: selectedFeeling.description
        };
      }

      if (sellData) {
        postData.sell = {
          productName: sellData.productName,
          price: sellData.price,
          currency: 'USD',
          condition: sellData.condition,
          negotiable: sellData.negotiable || false,
          shipping: false,
          pickup: true
        };
      }

      if (pollData) {
        postData.poll = {
          question: pollData.question,
          options: pollData.options.map((opt: string) => ({ text: opt })),
          isMultipleChoice: pollData.isMultipleChoice || false,
          allowCustomOptions: false,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        };
      }

      if (locationData) {
        postData.location = {
          name: locationData.name,
          address: locationData.address,
          category: locationData.category,
          coordinates: null, // In real app, this would use geocoding API
          placeId: null,
          rating: null
        };
      }

      // Create FormData for media files
      const formData = new FormData();

      // Add basic post data
      formData.append('content', newPost);

      // Add new post type data as separate fields
      if (selectedGif) {
        formData.append('gif[url]', selectedGif.url);
        formData.append('gif[source]', selectedGif.source);
        formData.append('gif[tags]', selectedGif.tags.join(','));
        formData.append('gif[width]', selectedGif.width.toString());
        formData.append('gif[height]', selectedGif.height.toString());
      }
      if (voiceRecording) {
        formData.append('voice', voiceRecording);
        formData.append('voiceData[duration]', postData.voiceData.duration.toString());
        formData.append('voiceData[transcription]', postData.voiceData.transcription);
        formData.append('voiceData[isPublic]', postData.voiceData.isPublic.toString());
      }
      if (selectedFeeling) {
        formData.append('feeling[type]', postData.feeling.type);
        formData.append('feeling[intensity]', postData.feeling.intensity.toString());
        formData.append('feeling[emoji]', postData.feeling.emoji);
        formData.append('feeling[description]', postData.feeling.description);
      }
      if (sellData) {
        formData.append('sell[productName]', postData.sell.productName);
        formData.append('sell[price]', postData.sell.price.toString());
        formData.append('sell[currency]', postData.sell.currency);
        formData.append('sell[condition]', postData.sell.condition);
        formData.append('sell[negotiable]', postData.sell.negotiable.toString());
        formData.append('sell[shipping]', postData.sell.shipping.toString());
        formData.append('sell[pickup]', postData.sell.pickup.toString());
      }
      if (pollData) {
        formData.append('poll[question]', postData.poll.question);
        formData.append('poll[isMultipleChoice]', postData.poll.isMultipleChoice.toString());
        formData.append('poll[allowCustomOptions]', postData.poll.allowCustomOptions.toString());
        formData.append('poll[expiresAt]', postData.poll.expiresAt.toISOString());
        // Add poll options
        postData.poll.options.forEach((option: any, index: number) => {
          formData.append(`poll[options][${index}][text]`, option.text);
        });
      }
      if (locationData) {
        formData.append('location[name]', postData.location.name);
        formData.append('location[address]', postData.location.address);
        formData.append('location[category]', postData.location.category);
      }

      // Add all media files (now including documents and audio)
      allFiles.forEach((file, index) => {
        formData.append('media', file);
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      // API response received

      if (response.ok) {
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const newPostData = await response.json();

          // Ensure the new post has user data
          let postWithUserData = newPostData;
          if (!newPostData.user?.avatar) {
            try {
              const token = localStorage.getItem('token');
              if (token && newPostData.userId) {
                const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/users/${newPostData.userId}`, {
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                if (userResponse.ok) {
                  const userData = await userResponse.json();
                  postWithUserData = {
                    ...newPostData,
                    user: {
                      _id: userData._id,
                      name: userData.name,
                      username: userData.username,
                      avatar: userData.avatar
                    }
                  };
                }
              }
            } catch (error) {
            }
          }

          setPosts(prev => [postWithUserData, ...prev]);
          setNewPost('');
          setNewPostTitle('');

          // Clean up object URLs before clearing media files
          mediaFiles.forEach(file => {
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
              const tempUrl = URL.createObjectURL(file);
              URL.revokeObjectURL(tempUrl);
            }
          });

          setMediaFiles([]);
          if (fileInputRef.current) fileInputRef.current.value = '';

          showPopup('success', 'Post Created!', 'Your post has been shared successfully!');
          window.dispatchEvent(new CustomEvent('postCreated'));
        } else {
          // Handle non-JSON response
          const responseText = await response.text();
          showPopup('error', 'API Error', 'Server returned invalid response format');
        }
      } else {
        // Handle error response
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            showPopup('error', 'Error', errorData.message || 'Failed to create post');
          } catch (jsonError) {
            showPopup('error', 'Error', `HTTP ${response.status}: Failed to create post`);
          }
        } else {
          // Handle HTML error response
          const responseText = await response.text();

          // Try to extract meaningful error information
          let errorMessage = 'Server error occurred';
          if (responseText.includes('[object Object]')) {
            errorMessage = 'File upload failed - check file type and size';
          } else if (responseText.includes('Error')) {
            errorMessage = 'Server processing error';
          }

          showPopup('error', 'Server Error', `HTTP ${response.status}: ${errorMessage}`);
        }
      }
    } catch (error) {
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
      }
      showPopup('error', 'Error', 'Failed to create post. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  // State for different modal types
  const [showGifModal, setShowGifModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showFeelingsModal, setShowFeelingsModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // State for modal data
  const [selectedGif, setSelectedGif] = useState<any>(null);
  const [voiceRecording, setVoiceRecording] = useState<Blob | null>(null);
  const [selectedFeeling, setSelectedFeeling] = useState<any>(null);
  const [sellData, setSellData] = useState<any>(null);
  const [pollData, setPollData] = useState<any>(null);
  const [locationData, setLocationData] = useState<any>(null);

  // Form data states
  const [sellFormData, setSellFormData] = useState<{
    productName?: string;
    price?: number;
    condition?: string;
    negotiable?: boolean;
  }>({});
  const [pollFormData, setPollFormData] = useState<{
    question?: string;
    option1?: string;
    option2?: string;
    option3?: string;
    option4?: string;
    isMultipleChoice?: boolean;
  }>({});
  const [locationFormData, setLocationFormData] = useState<{
    name?: string;
    address?: string;
    category?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  }>({});

  // Location search state
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [locationSearchResults, setLocationSearchResults] = useState<any[]>([]);
  const [locationSearchLoading, setLocationSearchLoading] = useState(false);

  // GIF search state
  const [gifResults, setGifResults] = useState<any[]>([]);
  const [gifSearchQuery, setGifSearchQuery] = useState('');
  const [gifSearchLoading, setGifSearchLoading] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingChunks, setRecordingChunks] = useState<Blob[]>([]);

  // Prevent background scrolling when modals are open
  useEffect(() => {
    const isModalOpen = showPostModal || showGifModal || showVoiceModal || showFeelingsModal || showSellModal || showPollModal || showLocationModal || showWatchModal;

    if (isModalOpen) {
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
  }, [showPostModal, showGifModal, showVoiceModal, showFeelingsModal, showSellModal, showPollModal, showLocationModal, showWatchModal]);

  const handleModalGIF = async () => {
    setShowGifModal(true);
    await loadTrendingGifs();
  };

  const handleModalVoice = () => {
    setShowVoiceModal(true);
  };

  const handleModalFeelings = () => {
    setShowFeelingsModal(true);
  };

  const handleModalSell = () => {
    setShowSellModal(true);
  };

  const handleModalPoll = () => {
    setShowPollModal(true);
  };

  const handleModalLocation = () => {
    setShowLocationModal(true);
  };

  // Location search handler for worldwide locations
  const searchWorldwideLocation = async (query: string) => {
    if (query.trim().length < 3) {
      setLocationSearchResults([]);
      return;
    }

    try {
      setLocationSearchLoading(true);

      // Use OpenStreetMap Nominatim API for worldwide location search
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1`
      );

      if (response.ok) {
        const data = await response.json();
        setLocationSearchResults(data);
      } else {
        setLocationSearchResults([]);
      }
    } catch (error) {
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
      }
      setLocationSearchResults([]);
    } finally {
      setLocationSearchLoading(false);
    }
  };

  // GIF search handler
  const handleGifSearch = async (query: string) => {
    setGifSearchQuery(query);

    if (query.trim().length < 2) {
      setGifResults([]);
      return;
    }

    try {
      setGifSearchLoading(true);
      const results = await searchGifsApi(query, 20);
      setGifResults(results.data || []);
    } catch (error) {
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
      }
      setGifResults([]);
    } finally {
      setGifSearchLoading(false);
    }
  };

  // Load trending GIFs when modal opens
  const loadTrendingGifs = async () => {
    try {
      setGifSearchLoading(true);
      const results = await getTrendingGifsApi(20);
      setGifResults(results.data || []);
    } catch (error) {
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
      }
      setGifResults([]);
    } finally {
      setGifSearchLoading(false);
    }
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordingChunks(prev => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(recordingChunks, { type: 'audio/wav' });
        setVoiceRecording(audioBlob);
        setRecordingChunks([]);
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      setRecordingTime(0);
      recorder.onstop = () => {
        clearInterval(timer);
        const audioBlob = new Blob(recordingChunks, { type: 'audio/wav' });
        setVoiceRecording(audioBlob);
        setRecordingChunks([]);
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (error) {
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
      }
      showPopup('error', 'Recording Error', 'Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const addEmojiToPost = (emoji: string) => {
    const textarea = document.querySelector('textarea[placeholder="What\'s happening?"]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(start);
      textarea.value = before + emoji + after;
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      textarea.focus();
      setNewPost(textarea.value);
    }
    setShowEmojiPicker(false);
  };

  const emojiCategories = [
    {
      name: 'Smileys',
      emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳']
    },
    {
      name: 'Animals',
      emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞']
    },
    {
      name: 'Food',
      emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀']
    },
    {
      name: 'Activities',
      emojis: ['⚽', '🏀', '��', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿']
    },
    {
      name: 'Objects',
      emojis: ['💎', '💍', '💐', '💒', '💓', '💔', '💕', '💖', '💗', '💘', '💙', '💚', '💛', '🧡', '💜', '🖤', '💝', '💞', '💟', '❣️', '💕', '💟', '💘', '💝', '💖', '💗', '💓', '💔', '💕', '💖', '💗']
    }
  ];

  const removeMediaFile = (index: number) => {
    // Clean up object URL before removing the file
    const fileToRemove = mediaFiles[index];
    if (fileToRemove && (fileToRemove.type.startsWith('image/') || fileToRemove.type.startsWith('video/'))) {
      // Create a temporary URL to find and revoke the existing one
      const tempUrl = URL.createObjectURL(fileToRemove);
      URL.revokeObjectURL(tempUrl);
    }

    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllMediaFiles = () => {
    // Clean up all object URLs
    mediaFiles.forEach(file => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const tempUrl = URL.createObjectURL(file);
        URL.revokeObjectURL(tempUrl);
      }
    });

    setMediaFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-[#f4f7fb] dark:bg-gray-900 min-h-screen w-full transition-colors duration-200 touch-manipulation md:mr-20">
      <Popup popup={popup} onClose={closePopup} />

      <SharePopup
        isOpen={showSharePopup}
        onClose={() => {
          setShowSharePopup(false);
          setSelectedPostForShare(null);
        }}
        onShare={(shareOptions) => {
          if (selectedPostForShare) {
            handleShare(selectedPostForShare._id || selectedPostForShare.id, shareOptions);
          }
        }}
        postContent={selectedPostForShare?.content}
        postMedia={selectedPostForShare?.media}
        isAlbum={selectedPostForShare?.type === 'album'}
      />

      <div className="px-1 xs:px-2 sm:px-4 lg:px-6 w-full">


        <div className="w-full pt-3 xs:pt-2 mb-2 xs:mb-3 sm:mb-4">
          <div className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide touch-pan-x">
            {/* Your Story */}
            <div
              className="flex-shrink-0 flex flex-col items-center group cursor-pointer touch-manipulation"
              onClick={() => setShowStoryModal(true)}
              onTouchStart={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              style={{ touchAction: 'manipulation' }}
            >
              {userStory ? (
                userStory.startsWith('data:video') ? (
                  <video
                    src={userStory}
                    className="w-16 h-24 xs:w-20 xs:h-28 sm:w-24 sm:h-36 md:w-28 md:h-40 lg:w-32 lg:h-48 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-blue-500 mb-2 sm:mb-3 shadow-lg sm:shadow-xl object-cover transition-transform group-hover:scale-105"
                    controls
                  />
                ) : (
                  <img
                    src={userStory}
                    className="w-16 h-24 xs:w-20 xs:h-28 sm:w-24 sm:h-36 md:w-28 md:h-40 lg:w-32 lg:h-48 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-blue-500 mb-2 sm:mb-3 shadow-lg sm:shadow-xl object-cover transition-transform group-hover:scale-105"
                    alt="Your Story"
                  />
                )
              ) : (
                <div className="w-16 h-24 xs:w-20 xs:h-28 sm:w-24 sm:h-36 md:w-28 md:h-40 lg:w-32 lg:h-48 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-gray-300 mb-2 sm:mb-3 shadow-lg sm:shadow-xl bg-gray-100 dark:bg-gray-200 relative overflow-hidden transition-transform group-hover:scale-105">
                  {/* User Profile Picture */}
                  {(() => {
                    const avatarUrl = getUserAvatar();
                    return avatarUrl && avatarUrl !== '/default-avatar.svg' ? (
                      <img
                        src={avatarUrl}
                        className="w-full h-full object-cover"
                        alt="Your Profile"
                        onError={(e) => {
                          e.currentTarget.src = '/default-avatar.svg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-white text-2xl">👤</span>
                      </div>
                    );
                  })()}

                  {/* Gradient Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-gray-300 to-transparent"></div>

                  {/* Plus Button */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-gray-200 z-10">
                    <span className="text-gray-800 text-lg font-bold">+</span>
                  </div>
                </div>
              )}
              <span className="text-xs xs:text-sm text-gray-700 dark:text-gray-300 font-medium transition-colors duration-200">Create new story</span>
            </div>

            {/* Other Users' Stories */}
            {loadingStories ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-16 h-24 xs:w-20 xs:h-28 sm:w-24 sm:h-36 md:w-28 md:h-40 lg:w-32 lg:h-48 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-gray-300 mb-2 sm:mb-3 shadow-lg sm:shadow-xl bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                </div>
              ))
            ) : (
              groupStoriesByUser(stories).slice(0, 6).map((groupedStory, index) => (
                <div
                  key={groupedStory.user._id || groupedStory.user.id}
                  className="flex-shrink-0 flex flex-col items-center group cursor-pointer touch-manipulation relative"
                  onClick={() => openStoryViewer(index)}
                  onTouchStart={(e) => {
                    e.currentTarget.style.transform = 'scale(0.95)';
                  }}
                  onTouchEnd={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  style={{ touchAction: 'manipulation' }}
                >
                  {/* Story Container with Professional Styling */}
                  <div className="relative w-16 h-24 xs:w-20 xs:h-28 sm:w-24 sm:h-36 md:w-28 md:h-40 lg:w-32 lg:h-48 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl border-2 border-white dark:border-gray-700 group-hover:shadow-2xl transition-all duration-300">
                    {/* Media Content */}
                    {groupedStory.latestStory.mediaType === 'video' ? (
                      <video
                        src={groupedStory.latestStory.media}
                        poster={groupedStory.latestStory.thumbnail}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={groupedStory.latestStory.media}
                        className="w-full h-full object-cover"
                        alt={`${groupedStory.user.username}'s Story`}
                      />
                    )}

                    {/* Gradient Overlay for Better Text Visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Story Count Badge */}
                    {groupedStory.stories.length > 1 && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold z-10 shadow-lg">
                        {groupedStory.stories.length}
                      </div>
                    )}

                    {/* User Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="flex items-center justify-center">
                        {/* User Avatar */}
                        <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full border-2 border-white overflow-hidden flex-shrink-0">
                          {groupedStory.user.avatar ? (
                            <img
                              src={groupedStory.user.avatar}
                              alt={groupedStory.user.username}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/default-avatar.svg';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                              <span className="text-white text-base font-bold">
                                {groupedStory.user.fullName?.charAt(0) || groupedStory.user.username?.charAt(0) || 'U'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Username Below (for better visibility) */}
                  <span className="text-xs xs:text-sm text-[#34495e] dark:text-gray-300 group-hover:text-[#022e8a] dark:group-hover:text-blue-400 font-medium transition-colors duration-200 truncate max-w-[60px] xs:max-w-[80px] text-center mt-2">
                    {groupedStory.user.fullName || groupedStory.user.username}
                  </span>
                </div>
              ))
            )}

          </div>
        </div>

        {/* Content Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-3 sm:p-4 mb-3 sm:mb-4 transition-colors duration-200">
          {/* Filter Count Display */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {getFilteredPosts().length} {activeFilter === 'all' ? 'posts' : activeFilter} posts
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Total: {posts.length} posts
            </div>
          </div>

          <div className="flex items-center gap-1 xs:gap-2 sm:gap-3 overflow-x-auto scrollbar-hide touch-pan-x pb-2">
            {/* Filter Button */}
            <button className="flex-shrink-0 w-8 h-8 xs:w-10 xs:h-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>

            {/* Content Category Buttons */}
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex-shrink-0 flex items-center gap-1 xs:gap-2 px-3 xs:px-4 py-2 xs:py-2.5 rounded-full border transition-colors min-w-fit ${activeFilter === 'all'
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
            >
              <svg className="w-3 xs:w-4 h-3 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs xs:text-xs xs:text-sm font-medium">All</span>
            </button>

            <button
              onClick={() => setActiveFilter('text')}
              className={`flex-shrink-0 flex items-center gap-1 xs:gap-2 px-3 xs:px-4 py-2 xs:py-2.5 rounded-full border transition-colors min-w-fit ${activeFilter === 'text'
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
            >
              <svg className="w-3 xs:w-4 h-3 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="text-xs xs:text-sm font-medium">Text</span>
            </button>

            <button
              onClick={() => setActiveFilter('photos')}
              className={`flex-shrink-0 flex items-center gap-1 xs:gap-2 px-3 xs:px-4 py-2 xs:py-2.5 rounded-full border transition-colors min-w-fit ${activeFilter === 'photos'
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
            >
              <svg className="w-3 xs:w-4 h-3 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs xs:text-sm font-medium">Photos</span>
            </button>

            <button
              onClick={() => setActiveFilter('videos')}
              className={`flex-shrink-0 flex items-center gap-1 xs:gap-2 px-3 xs:px-4 py-2 xs:py-2.5 rounded-full border transition-colors min-w-fit ${activeFilter === 'videos'
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
            >
              <svg className="w-3 xs:w-4 h-3 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-xs xs:text-sm font-medium">Videos</span>
            </button>

            <button
              onClick={() => setActiveFilter('sounds')}
              className={`flex-shrink-0 flex items-center gap-1 xs:gap-2 px-3 xs:px-4 py-2 xs:py-2.5 rounded-full border transition-colors min-w-fit ${activeFilter === 'sounds'
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
            >
              <svg className="w-3 xs:w-4 h-3 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <span className="text-xs xs:text-sm font-medium">Sounds</span>
            </button>

            <button
              onClick={() => setActiveFilter('files')}
              className={`flex-shrink-0 flex items-center gap-1 xs:gap-2 px-3 xs:px-4 py-2 xs:py-2.5 rounded-full border transition-colors min-w-fit ${activeFilter === 'files'
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
            >
              <svg className="w-3 xs:w-4 h-3 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs xs:text-sm font-medium">Files</span>
            </button>

            <button
              onClick={() => setActiveFilter('maps')}
              className={`flex-shrink-0 flex items-center gap-1 xs:gap-2 px-3 xs:px-4 py-2 xs:py-2.5 rounded-full border transition-colors min-w-fit ${activeFilter === 'maps'
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
            >
              <svg className="w-3 xs:w-4 h-3 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span className="text-xs xs:text-sm font-medium">Maps</span>
            </button>
          </div>
        </div>

        {/* Two Section Layout - Feed Left, Pro Members Right */}
        <div className="w-full max-w-full overflow-x-hidden pb-8" style={{
          maxWidth: '100%',
          boxSizing: 'border-box',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '1rem'
        }}>


          {/* Responsive Grid Layout - Works on all screen sizes */}
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] xl:grid-cols-[3fr_1fr] gap-4 w-full max-w-full items-start">
            {/* Left Section - Feed */}
            <div
              id="left-section"
              className="w-full overflow-x-hidden lg:overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 flex flex-col order-1 lg:order-1"
              style={{
                boxSizing: 'border-box',
                height: 'auto'
              }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-1 xs:p-2 sm:p-3 mb-3 sm:mb-4 transition-colors duration-200 pb-6">
                {/* Top Section: Content Type Selection */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 xs:gap-2 sm:gap-3">
                    <button
                      onClick={() => setShowReelsModal(true)}
                      className="flex items-center gap-1 xs:gap-2 bg-pink-50 dark:bg-pink-900/20 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg border border-pink-200 dark:border-pink-700 hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors cursor-pointer"
                    >
                      <span className="text-pink-500 text-lg">💎</span>
                      <span className="text-xs xs:text-sm font-medium text-pink-700 dark:text-pink-300">Reels Video</span>
                    </button>
                    <div className="flex items-center gap-1 xs:gap-2 bg-pink-50 dark:bg-pink-900/20 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg border border-pink-200 dark:border-pink-700">
                      <span className="text-pink-500 text-lg">🕐</span>
                      <span className="text-xs xs:text-sm font-medium text-pink-700 dark:text-pink-300">Free live streams</span>
                    </div>
                  </div>
                </div>

                {/* Content Creation Area */}
                <div className="relative mb-4">
                  <div className="flex items-start gap-2 xs:gap-3">
                    <div className="w-8 h-8 xs:w-10 xs:h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {(() => {
                        const avatarUrl = getUserAvatar();
                        return avatarUrl && avatarUrl !== '/default-avatar.svg' ? (
                          <img
                            src={avatarUrl}
                            alt="Your avatar"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/default-avatar.svg';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        );
                      })()}
                    </div>
                    <div className="flex-1 relative">
                      {/* Content Textarea */}
                      <textarea
                        placeholder="Click to create a new post..."
                        className={`w-full border border-gray-300 dark:border-gray-600 rounded-xl px-2 xs:px-4 py-1.5 xs:py-2 text-xs xs:text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none cursor-pointer ${newPost.trim() ? 'min-h-[60px] xs:min-h-[80px]' : 'min-h-[32px] xs:min-h-[40px]'
                          }`}
                        value=""
                        readOnly
                        onClick={() => setShowPostModal(true)}
                        onFocus={(e) => {
                          e.target.blur();
                          setShowPostModal(true);
                        }}
                        disabled={posting}
                        maxLength={1800}
                      />
                    </div>

                    {/* Camera Icon - Positioned to the right of textarea */}
                    <div className="flex items-center justify-center w-8 h-8 xs:w-10 xs:h-10 flex-shrink-0">
                      <button
                        className="flex items-center justify-center w-8 h-8 xs:w-10 xs:h-10 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        disabled={posting}
                        title="Add photos or videos"
                      >
                        <span className="text-xl">📷</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Character Count and Word Count */}
                {newPost.trim() && (
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span>Words: {newPost.split(/\s+/).filter(word => word && word.length > 0).length}/300</span>
                    <span>Characters: {newPost.length}/1800</span>
                  </div>
                )}



                {/* Hidden file input */}
                <input
                  type="file"
                  accept="*/*"
                  multiple
                  className="hidden"
                  ref={fileInputRef}
                  onChange={e => {
                    const files = e.target.files;
                    if (files) {
                      const fileArray = Array.from(files);

                      const validFiles = fileArray.filter(file => {
                        if (file.size > 10 * 1024 * 1024) {
                          showPopup('error', 'File Too Large', `File "${file.name}" is too large. Maximum size is 10MB.`);
                          return false;
                        }

                        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];
                        if (!validTypes.includes(file.type)) {
                          showPopup('error', 'Unsupported Format', `File "${file.name}" has an unsupported format.`);
                          return false;
                        }

                        return true;
                      });

                      if (validFiles.length > 0) {
                        setMediaFiles(prev => [...prev, ...validFiles]);
                        showPopup('success', 'Files Added', `${validFiles.length} file(s) added successfully!`);
                      }
                    }
                  }}
                />
                {mediaFiles.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-200">Selected files ({mediaFiles.length}):</div>
                    <div className="space-y-3">
                      {mediaFiles.map((file, index) => (
                        <div key={index} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-start gap-3">
                            {/* Image/Video Thumbnail Preview */}
                            {file.type.startsWith('image/') ? (
                              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={file.name}
                                  className="w-full h-full object-cover"
                                  onLoad={(e) => {
                                    // Clean up the object URL after image loads
                                    const target = e.target as HTMLImageElement;
                                    if (target.src.startsWith('blob:')) {
                                      setTimeout(() => URL.revokeObjectURL(target.src), 1000);
                                    }
                                  }}
                                />
                              </div>
                            ) : file.type.startsWith('video/') ? (
                              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0 relative">
                                <video
                                  src={URL.createObjectURL(file)}
                                  className="w-full h-full object-cover"
                                  onLoadedMetadata={(e) => {
                                    const target = e.target as HTMLVideoElement;
                                    if (target.src.startsWith('blob:')) {
                                      setTimeout(() => URL.revokeObjectURL(target.src), 1000);
                                    }
                                  }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                  <span className="text-white text-2xl">▶️</span>
                                </div>
                              </div>
                            ) : (
                              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-3xl sm:text-4xl">
                                  {file.type.startsWith('audio/') ? '🎵' : '📄'}
                                </span>
                              </div>
                            )}

                            {/* File Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 dark:text-white text-sm truncate mb-1">
                                    {file.name}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {(file.size / 1024 / 1024).toFixed(1)}MB
                                  </div>
                                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    {file.type.startsWith('image/') ? 'Image' :
                                      file.type.startsWith('video/') ? 'Video' :
                                        file.type.startsWith('audio/') ? 'Audio' : 'Document'}
                                  </div>
                                </div>

                                {/* Remove Button */}
                                <button
                                  onClick={() => removeMediaFile(index)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20 p-1.5 rounded-full transition-colors flex-shrink-0"
                                  title="Remove file"
                                >
                                  <svg className="w-3 xs:w-4 h-3 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Clear All Button */}
                    <button
                      onClick={clearAllMediaFiles}
                      className="mt-3 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors font-medium"
                    >
                      Clear all files
                    </button>
                  </div>
                )}
              </div>

              <div className="overflow-y-auto scrollbar-hide">
                {loadingPosts && loadingAlbums ? (
                  <div className="text-center py-6 sm:py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                    <p className="text-gray-500 text-sm">Loading your feed...</p>
                  </div>
                ) : posts.length === 0 && albums.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">📱</div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">No posts yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-200">Be the first to share something amazing!</p>
                  </div>
                ) : (
                  <>


                    {(() => {
                      // Get filtered posts based on active filter
                      const filteredPosts = getFilteredPosts();

                      const combinedFeed = [
                        ...filteredPosts.map((post: any) => ({ ...post, type: 'post' })),
                        ...albums.map((album: any) => ({ ...album, type: 'album' }))
                      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                      const renderFeed = () => {
                        const feedItems: React.ReactNode[] = [];
                        let postCount = 0;
                        let peopleSuggestionsAdded = false;

                        // Show message if no posts found for current filter
                        if (combinedFeed.length === 0) {
                          return (
                            <div className="text-center py-8">
                              <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                                📭 No {activeFilter === 'all' ? '' : activeFilter} posts found
                              </div>
                              <div className="text-gray-400 dark:text-gray-500 text-sm">
                                Try changing your filter or create a new post
                              </div>
                            </div>
                          );
                        }

                        combinedFeed.forEach((item: any, index: number) => {
                          // Add post/album
                          if (item.type === 'album') {
                            feedItems.push(
                              <AlbumDisplay
                                key={`album-${item._id}-${index}`}
                                album={item}
                                onDelete={handleAlbumDelete}
                                isOwner={false}
                                onLike={handleAlbumLike}
                                onReaction={handleAlbumReaction}
                                onComment={handleAlbumComment}
                                onDeleteComment={handleDeleteAlbumComment}
                                onSave={handleAlbumSave}
                                onShare={handleAlbumShare}
                                deletingComments={deletingComments}
                                onWatch={openWatchView}
                              />
                            );
                          } else {
                            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

                            const isOwnPost = item.user && (
                              item.user._id === currentUser._id ||
                              item.user.id === currentUser.id ||
                              item.user.userId === currentUser.id
                            );

                            feedItems.push(
                              <FeedPost
                                key={`post-${item._id || item.id}-${index}`}
                                post={item}
                                onLike={handleLike}
                                onReaction={handleReaction}
                                onComment={handleAddComment}
                                onShare={handleShare}
                                onSave={handleSave}
                                onDelete={handleDelete}
                                onEdit={startEditPost}
                                onPostUpdate={handlePostUpdate}
                                isOwnPost={isOwnPost}
                                onWatch={openWatchView}
                              />
                            );
                            postCount++;
                          }

                          // Add "People you may know" component only once after the first 3 posts
                          if (postCount === 3 && !peopleSuggestionsAdded) {
                            feedItems.push(
                              <PeopleYouMayKnow
                                key="people-suggestions"
                                onFollow={(userId: string) => {
                                  // Handle follow logic here if needed
                                }}
                              />
                            );
                            peopleSuggestionsAdded = true;
                          }
                        });

                        return feedItems;
                      };

                      return renderFeed();
                    })()}
                  </>
                )}
              </div>
            </div>

            {/* Right Section - Pro Members and Sidebar */}
            <div
              id="right-section"
              className="flex flex-col gap-3 sm:gap-4 w-full overflow-x-hidden order-2 lg:order-2"
              style={{
                boxSizing: 'border-box',
                height: 'auto'
              }}
            >
              <div className="lg:sticky lg:top-4 space-y-3 sm:space-y-4">
                {/* Pro Members Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-1 xs:p-2 sm:p-3 transition-colors duration-200">
                  <div className="font-semibold mb-2 text-sm text-gray-900 dark:text-white transition-colors duration-200">Pro Members</div>
                  <button className="bg-orange-400 text-white px-2 xs:px-3 py-1.5 xs:py-2 rounded-full w-full mb-2 text-xs xs:text-sm">Upgrade To Pro</button>
                </div>

                {/* Latest Products Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-3 sm:p-4 transition-colors duration-200">
                  <LatestProducts />
                </div>

                {/* Latest Pages Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-3 sm:p-4 transition-colors duration-200">
                  <div className="font-semibold mb-3 text-sm text-gray-900 dark:text-white transition-colors duration-200">Latest Pages</div>

                  {loadingPages ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-10 h-r10 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                            <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-2/3 animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : latestPages.length > 0 ? (
                    <div className="space-y-3">
                      {latestPages.slice(0, 3).map((page) => (
                        <div
                          key={page._id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                          onClick={() => router.push(`/dashboard/pages/${page._id}`)}
                        >
                          {/* Page Avatar */}
                          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200 dark:border-gray-600">
                            {page.profileImage ? (
                              <img
                                src={page.profileImage}
                                alt={page.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = '/default-avatar.svg';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                  {page.name?.charAt(0) || 'P'}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Page Info */}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {page.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {page.category}
                            </div>
                          </div>

                          {/* Followers Count */}
                          <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                            <div className="font-medium">{page.followers?.length || 0}</div>
                            <div>followers</div>
                          </div>
                        </div>
                      ))}

                      {/* View All Pages Button */}
                      <button
                        onClick={() => router.push('/dashboard/pages')}
                        className="w-full mt-3 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 py-2 rounded-lg transition-colors"
                      >
                        View All Pages
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-gray-400 dark:text-gray-500 text-2xl mb-2">📄</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">No pages yet</div>
                      <button
                        onClick={() => router.push('/dashboard/pages')}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        Create Page
                      </button>
                    </div>
                  )}
                </div>

                {/* Suggested Pages Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-1 xs:p-2 sm:p-3 transition-colors duration-200">
                  <div className="font-semibold mb-3 text-sm text-gray-900 dark:text-white transition-colors duration-200">Suggested Pages</div>

                  {loadingSuggestedPages ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                            <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-2/3 animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : suggestedPages.length > 0 ? (
                    <div className="space-y-3">
                      {suggestedPages.slice(0, 5).map((page) => (
                        <div
                          key={page._id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                          onClick={() => router.push(`/dashboard/pages/${page._id}`)}
                        >
                          {/* Page Avatar */}
                          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200 dark:border-gray-600">
                            {page.profileImage ? (
                              <img
                                src={page.profileImage}
                                alt={page.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = '/default-avatar.svg';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                  {page.name?.charAt(0) || 'P'}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Page Info */}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {page.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              @{page.url}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              {page.category}
                            </div>
                          </div>

                          {/* Followers Count */}
                          <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                            <div className="font-medium">{page.followers?.length || 0}</div>
                            <div>followers</div>
                          </div>
                        </div>
                      ))}

                      {/* View All Pages Button */}
                      <button
                        onClick={() => router.push('/dashboard/pages')}
                        className="w-full mt-3 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 py-2 rounded-lg transition-colors"
                      >
                        View All Pages
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-gray-400 dark:text-gray-500 text-2xl mb-2">📄</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">No pages yet</div>
                      <button
                        onClick={() => router.push('/dashboard/pages')}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        Create Page
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Popup
        popup={popup}
        onClose={closePopup}
        onConfirm={handlePopupConfirm}
        onCancel={() => {
          setPostToDelete(null);
          closePopup();
        }}
      />

      {/* Reels Creation Modal */}
      <ReelsCreationModal
        isOpen={showReelsModal}
        onClose={() => setShowReelsModal(false)}
        onSuccess={() => handleReelShare({})}
      />

      {/* Story Creation Modal */}
      <StoryCreationModal
        isOpen={showStoryModal}
        onClose={() => setShowStoryModal(false)}
        onSuccess={handleStorySuccess}
      />

      {/* Story Viewer */}
      {showStoryViewer && selectedUserStories.length > 0 && (
        <StoryViewer
          stories={selectedUserStories}
          initialStoryIndex={selectedStoryIndex}
          onClose={() => setShowStoryViewer(false)}
          onDelete={handleStoryDelete}
          onReact={handleStoryReact}
          onReply={handleStoryReply}
        />
      )}

      {/* Watch Modal - Enhanced Jaifriend Style */}
      {showWatchModal && selectedPostForWatch && (
        <>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl h-[75vh] flex flex-col border border-gray-200 dark:border-gray-700 mx-auto">
              {/* Modal Header - Simple */}
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedPostForWatch.user?.avatar || selectedPostForWatch.createdBy?.avatar || '/default-avatar.svg'}
                    alt="User avatar"
                    className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600"
                    onError={(e) => {
                      e.currentTarget.src = '/default-avatar.svg';
                    }}
                  />
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                      {selectedPostForWatch.user?.name || selectedPostForWatch.user?.username || selectedPostForWatch.createdBy?.name || 'User'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(selectedPostForWatch.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowWatchModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content - Fixed Layout */}
              <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                {/* Left Side - Content */}
                <div className="flex-1 overflow-y-auto lg:max-w-[60%]">
                  <div className="p-4 pb-8">
                    {/* Post Content */}
                    {selectedPostForWatch.content && (
                      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div
                          className="text-gray-900 dark:text-white text-sm whitespace-pre-wrap break-words"
                          dangerouslySetInnerHTML={{
                            __html: selectedPostForWatch.content.replace(/<pre[^>]*>/g, '').replace(/<\/pre>/g, '').replace(/class="[^"]*"/g, '')
                          }}
                        />
                      </div>
                    )}

                    {/* Media Display */}
                    {selectedPostForWatch.media && selectedPostForWatch.media.length > 0 ? (
                      <div className="space-y-3 mb-6">
                        {selectedPostForWatch.media.map((media: any, index: number) => (
                          <div key={index} className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                            {media.type === 'image' ? (
                              <img
                                src={getMediaUrl(media.url)}
                                alt="Post media"
                                className="w-full max-h-[40vh] object-contain"
                                onError={(e) => {
                                  e.currentTarget.src = '/default-avatar.svg';
                                }}
                              />
                            ) : media.type === 'video' ? (
                              <video
                                src={getMediaUrl(media.url)}
                                controls
                                className="w-full max-h-[40vh] object-contain"
                                poster={media.thumbnail ? getMediaUrl(media.thumbnail) : ''}
                              />
                            ) : (
                              <div className="p-4 text-center">
                                <div className="w-8 h-8 mx-auto mb-2 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                  {media.originalName || media.filename || media.name || 'File'}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      selectedPostForWatch.content && (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                          Text only post
                        </div>
                      )
                    )}

                    {/* Location Display */}
                    {selectedPostForWatch.location && (
                      <div className="mb-4">
                        <LocationDisplay
                          location={{
                            name: selectedPostForWatch.location.name || 'Unknown Location',
                            address: selectedPostForWatch.location.address || 'Location',
                            coordinates: {
                              latitude: selectedPostForWatch.location.coordinates?.lat || 0,
                              longitude: selectedPostForWatch.location.coordinates?.lng || 0
                            },
                            country: selectedPostForWatch.location.country,
                            state: selectedPostForWatch.location.state,
                            city: selectedPostForWatch.location.city
                          }}
                          compact={true}
                          showCoordinates={false}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side - Enhanced Actions & Comments */}
                <div className="w-full lg:w-80 border-l border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-4 flex flex-col min-h-0 flex-shrink-0">
                  {/* Action Buttons - Enhanced */}
                  <div className="flex flex-wrap gap-2 mb-4 flex-shrink-0">
                    {/* Like Button - Enhanced */}
                    <button
                      onClick={() => {
                        if (selectedPostForWatch.type === 'album') {
                          handleAlbumLike(selectedPostForWatch._id || selectedPostForWatch.id);
                        } else {
                          handleLike(selectedPostForWatch._id || selectedPostForWatch.id);
                        }
                      }}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium ${(selectedPostForWatch.likes?.includes(getCurrentUserId()) || selectedPostForWatch.likedBy?.includes(getCurrentUserId()))
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500'
                        }`}
                    >
                      <span>❤️</span>
                      <span>
                        {(selectedPostForWatch.likes?.includes(getCurrentUserId()) || selectedPostForWatch.likedBy?.includes(getCurrentUserId())) ? 'Liked' : 'Like'}
                      </span>
                    </button>

                    {/* Comment Button - Enhanced */}
                    <button
                      onClick={() => {
                        const commentInput = document.getElementById('watch-comment-input');
                        if (commentInput) commentInput.focus();
                      }}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:text-blue-500"
                    >
                      <span>💬</span>
                      <span>Comment</span>
                    </button>

                    {/* Share Button - Enhanced */}
                    <button
                      onClick={() => {
                        handleShare(selectedPostForWatch._id || selectedPostForWatch.id, {
                          shareOnTimeline: false,
                          shareToPage: false,
                          shareToGroup: false,
                          customMessage: ''
                        });
                        setShowWatchModal(false);
                      }}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-green-50 dark:hover:bg-green-900/10 hover:text-green-500"
                    >
                      <span>📤</span>
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Like Count - Enhanced */}
                  {(selectedPostForWatch.likes?.length > 0 || selectedPostForWatch.likedBy?.length > 0) && (
                    <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400 flex-shrink-0">
                      {selectedPostForWatch.likes?.length || selectedPostForWatch.likedBy?.length} likes
                    </div>
                  )}

                  {/* Comments Section - Enhanced */}
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="mb-3 flex-shrink-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Comments ({selectedPostForWatch.comments?.length || 0})
                      </h3>
                    </div>

                    {/* Comment Input - Enhanced */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 mb-3 flex-shrink-0">
                      <div className="flex gap-2">
                        <img
                          src={JSON.parse(localStorage.getItem('user') || '{}')?.avatar || '/default-avatar.svg'}
                          alt="Your avatar"
                          className="w-6 h-6 rounded-full flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = '/default-avatar.svg';
                          }}
                        />
                        <div className="flex-1 flex gap-2">
                          <input
                            id="watch-comment-input"
                            type="text"
                            placeholder="Add a comment..."
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                          <button
                            onClick={() => {
                              const input = document.getElementById('watch-comment-input') as HTMLInputElement;
                              if (input && input.value.trim()) {
                                handleAddComment(selectedPostForWatch._id || selectedPostForWatch.id, input.value.trim());
                                input.value = '';
                              }
                            }}
                            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Comments List - Enhanced */}
                    <div className="flex-1 overflow-y-auto space-y-2 min-h-0 pr-2">
                      {selectedPostForWatch.comments?.map((comment: any, index: number) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                          <div className="flex gap-2">
                            <img
                              src={comment.user?.avatar || '/default-avatar.svg'}
                              alt="User avatar"
                              className="w-6 h-6 rounded-full flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.src = '/default-avatar.svg';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                  {comment.user?.name || comment.user?.username || 'User'}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                {comment.text || comment.content}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {(!selectedPostForWatch.comments || selectedPostForWatch.comments.length === 0) && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <div className="text-4xl mb-2">💬</div>
                          <div className="text-sm">No comments yet. Be the first to comment!</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Post Creation Modal */}
      {showPostModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4 bg-black/20 backdrop-blur-md" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] sm:max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowPostModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{1800 - (newPost.length)}</span>
                <button
                  onClick={handleModalPost}
                  disabled={posting || (!newPost.trim() && modalMediaFiles.length === 0 && !selectedGif && !voiceRecording && !selectedFeeling && !sellData && !pollData && !locationData)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-xs xs:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {posting ? 'Sharing...' : 'Share'}
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-3 sm:p-4 overflow-y-auto max-h-[calc(85vh-120px)] sm:max-h-[calc(80vh-120px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scrollbar-hide">
              {/* Post Input */}
              <textarea
                placeholder="What's happening?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="w-full border-none outline-none text-sm sm:text-base resize-none min-h-[60px] sm:min-h-[80px] bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                maxLength={1800}
              />

              {/* Media Preview */}
              {modalMediaFiles.length > 0 && (
                <div className="mt-3 sm:mt-4">
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">Selected files ({modalMediaFiles.length}):</div>
                  <div className="space-y-3">
                    {modalMediaFiles.map((file, index) => (
                      <div key={index} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-start gap-3">
                          {/* Image/Video Thumbnail Preview */}
                          {file.type.startsWith('image/') ? (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="w-full h-full object-cover"
                                onLoad={(e) => {
                                  // Clean up the object URL after image loads
                                  const target = e.target as HTMLImageElement;
                                  if (target.src.startsWith('blob:')) {
                                    setTimeout(() => URL.revokeObjectURL(target.src), 1000);
                                  }
                                }}
                              />
                            </div>
                          ) : file.type.startsWith('video/') ? (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0 relative">
                              <video
                                src={URL.createObjectURL(file)}
                                className="w-full h-full object-cover"
                                onLoadedMetadata={(e) => {
                                  const target = e.target as HTMLVideoElement;
                                  if (target.src.startsWith('blob:')) {
                                    setTimeout(() => URL.revokeObjectURL(target.src), 1000);
                                  }
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                <span className="text-white text-2xl">▶️</span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-3xl sm:text-4xl">
                                {file.type.startsWith('audio/') ? '🎵' : '📄'}
                              </span>
                            </div>
                          )}

                          {/* File Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 dark:text-white text-sm truncate mb-1">
                                  {file.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {(file.size / 1024 / 1024).toFixed(1)}MB
                                </div>
                                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  {file.type.startsWith('image/') ? 'Image' :
                                    file.type.startsWith('video/') ? 'Video' :
                                      file.type.startsWith('audio/') ? 'Audio' : 'Document'}
                                </div>
                              </div>

                              {/* Remove Button */}
                              <button
                                onClick={() => removeModalMedia(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20 p-1.5 rounded-full transition-colors flex-shrink-0"
                                title="Remove file"
                              >
                                <svg className="w-3 xs:w-4 h-3 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Clear All Button */}
                  <button
                    onClick={clearModalMedia}
                    className="mt-3 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors font-medium"
                  >
                    Clear all files
                  </button>
                </div>
              )}

              {/* Selected Features Preview */}
              {(selectedGif || voiceRecording || selectedFeeling || sellData || pollData || locationData) && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-xs sm:text-xs xs:text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Selected features:</div>
                  <div className="space-y-2">
                    {selectedGif && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <span>🎭 GIF: {selectedGif.source}</span>
                        <button
                          onClick={() => setSelectedGif(null)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    {voiceRecording && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <span>🎤 Voice recording</span>
                        <button
                          onClick={() => setVoiceRecording(null)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    {selectedFeeling && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <span>{selectedFeeling.emoji} Feeling: {selectedFeeling.description}</span>
                        <button
                          onClick={() => setSelectedFeeling(null)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    {sellData && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <span>🏪 Selling: {sellData.productName} - ${sellData.price}</span>
                        <button
                          onClick={() => setSellData(null)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    {pollData && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <span>📊 Poll: {pollData.question}</span>
                        <button
                          onClick={() => setPollData(null)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    {locationData && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <span>📍 Location: {locationData.name}</span>
                        <button
                          onClick={() => setLocationData(null)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Audience Selector */}
              <div className="flex items-center gap-2 mt-3 sm:mt-4 p-2 sm:p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <span className="text-sm sm:text-base">🌐</span>
                <span className="text-xs sm:text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300">Everyone</span>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>



              {/* Action Buttons Grid */}
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 mt-3 sm:mt-4">
                <button
                  onClick={handleModalImageUpload}
                  className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="text-lg sm:text-xl">📷</span>
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Images</span>
                </button>

                <button
                  onClick={handleModalAudioUpload}
                  className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="text-lg sm:text-xl">🎵</span>
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Audio</span>
                </button>

                <button
                  onClick={handleModalFileUpload}
                  className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="text-lg sm:text-xl">📄</span>
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Files</span>
                </button>

                <button
                  onClick={handleModalGIF}
                  className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="text-lg sm:text-xl">🎭</span>
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">GIF</span>
                </button>

                <button
                  onClick={handleModalVoice}
                  className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="text-lg sm:text-xl">🎤</span>
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Voice</span>
                </button>

                <button
                  onClick={handleModalFeelings}
                  className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="text-lg sm:text-xl">😊</span>
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Feelings</span>
                </button>

                <button
                  onClick={handleModalSell}
                  className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="text-lg sm:text-xl">🏪</span>
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Sell</span>
                </button>

                <button
                  onClick={handleModalPoll}
                  className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="text-lg sm:text-xl">📊</span>
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Poll</span>
                </button>

                <button
                  onClick={handleModalLocation}
                  className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="text-lg sm:text-xl">📍</span>
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Location</span>
                </button>
              </div>



              {/* Mark/Formatting Icons */}
              <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    const textarea = document.querySelector('textarea[placeholder="What\'s happening?"]') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selected = text.substring(start, end);
                      const after = text.substring(end);
                      textarea.value = before + '#' + selected + after;
                      textarea.setSelectionRange(start + 1, start + 1 + selected.length);
                      textarea.focus();
                      setNewPost(textarea.value);
                    }
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  title="Add hashtag"
                >
                  <span className="text-base sm:text-lg font-bold">#</span>
                </button>

                <button
                  onClick={() => {
                    const textarea = document.querySelector('textarea[placeholder="What\'s happening?"]') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selected = text.substring(start, end);
                      const after = text.substring(end);
                      textarea.value = before + '@' + selected + after;
                      textarea.setSelectionRange(start + 1, start + 1 + selected.length);
                      textarea.focus();
                      setNewPost(textarea.value);
                    }
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  title="Mention user"
                >
                  <span className="text-base sm:text-lg font-bold">@</span>
                </button>

                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  title="Add emoji"
                >
                  <span className="text-base sm:text-lg">😊</span>
                </button>
              </div>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">Select Emoji</span>
                    <button
                      onClick={() => setShowEmojiPicker(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      ✕
                    </button>
                  </div>

                  {emojiCategories.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="mb-3 sm:mb-4">
                      <h4 className="text-xs sm:text-xs xs:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{category.name}</h4>
                      <div className="grid grid-cols-8 sm:grid-cols-10 gap-1 sm:gap-2">
                        {category.emojis.map((emoji, emojiIndex) => (
                          <button
                            key={emojiIndex}
                            onClick={() => addEmojiToPost(emoji)}
                            className="w-7 h-7 sm:w-8 sm:h-8 text-base sm:text-lg hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors flex items-center justify-center"
                            title={emoji}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Hidden file inputs */}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                ref={modalImageInputRef}
                onChange={(e) => handleModalMediaChange(e, 'image')}
              />
              <input
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                ref={modalVideoInputRef}
                onChange={(e) => handleModalMediaChange(e, 'video')}
              />
              <input
                type="file"
                accept="audio/*"
                multiple
                className="hidden"
                ref={modalAudioInputRef}
                onChange={(e) => handleModalMediaChange(e, 'audio')}
                title="Note: Audio files will be referenced in post content but not uploaded to server"
              />
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                multiple
                className="hidden"
                ref={modalFileUploadRef}
                onChange={(e) => handleModalMediaChange(e, 'file')}
                title="Note: Document files will be referenced in post content but not uploaded to server"
              />
            </div>

          </div>
        </div>
      )}

      {/* GIF Selection Modal */}
      {showGifModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/20 backdrop-blur-md">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] sm:max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select GIF</h3>
              <button
                onClick={() => setShowGifModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search GIFs..."
                    value={gifSearchQuery}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
                    onChange={(e) => handleGifSearch(e.target.value)}
                  />
                  {gifSearchLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                {gifResults.length > 0 ? (
                  gifResults.map((gif: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedGif({
                          url: gif.images.fixed_height.url,
                          source: 'giphy',
                          tags: gif.tags || [],
                          width: gif.images.fixed_height.width,
                          height: gif.images.fixed_height.height,
                          giphyId: gif.id
                        });
                        setShowGifModal(false);
                      }}
                      className="w-full h-24 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors overflow-hidden"
                    >
                      <img
                        src={gif.images.fixed_height.url}
                        alt={gif.title}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))
                ) : (
                  // Fallback to emoji placeholders if no GIFs loaded
                  ['🎭', '🎪', '🎨', '🎬', '🎤', '🎧', '🎮', '🎯', '🎲', '🎸', '🎹', '🎺'].map((gif, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedGif({ url: gif, source: 'emoji', tags: ['fun'], width: 200, height: 200 });
                        setShowGifModal(false);
                      }}
                      className="w-full h-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-4xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {gif}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voice Recording Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/20 backdrop-blur-md">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-xl shadow-2xl max-w-md w-full max-h-[85vh] sm:max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Record Voice</h3>
              <button
                onClick={() => setShowVoiceModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="text-center">
                <button
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl mb-4 transition-colors ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-red-500 hover:bg-red-600'
                    }`}
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? '⏹️' : '🎤'}
                </button>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
                </p>
                {recordingTime > 0 && (
                  <p className="text-sm text-gray-500 mb-4">Duration: {recordingTime}s</p>
                )}
                {voiceRecording && (
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300">Voice recorded successfully!</p>
                    <audio controls className="w-full mt-2">
                      <source src={URL.createObjectURL(voiceRecording)} type="audio/wav" />
                    </audio>
                  </div>
                )}
                <div className="flex gap-2">
                  {!voiceRecording ? (
                    <button
                      onClick={() => setShowVoiceModal(false)}
                      className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setVoiceRecording(null);
                          setRecordingTime(0);
                        }}
                        className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                      >
                        Re-record
                      </button>
                      <button
                        onClick={() => setShowVoiceModal(false)}
                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                      >
                        Use Recording
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feelings Selection Modal */}
      {showFeelingsModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/20 backdrop-blur-md">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] sm:max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">How are you feeling?</h3>
              <button
                onClick={() => setShowFeelingsModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                {[
                  { type: 'happy', emoji: '😊', description: 'Happy' },
                  { type: 'excited', emoji: '🤩', description: 'Excited' },
                  { type: 'grateful', emoji: '🙏', description: 'Grateful' },
                  { type: 'loved', emoji: '💕', description: 'Loved' },
                  { type: 'sad', emoji: '😢', description: 'Sad' },
                  { type: 'angry', emoji: '😠', description: 'Angry' },
                  { type: 'surprised', emoji: '😮', description: 'Surprised' },
                  { type: 'scared', emoji: '😨', description: 'Scared' },
                  { type: 'calm', emoji: '😌', description: 'Calm' },
                  { type: 'proud', emoji: '😎', description: 'Proud' },
                  { type: 'tired', emoji: '😴', description: 'Tired' },
                  { type: 'confused', emoji: '😕', description: 'Confused' }
                ].map((feeling) => (
                  <button
                    key={feeling.type}
                    onClick={() => {
                      setSelectedFeeling(feeling);
                      setShowFeelingsModal(false);
                    }}
                    className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="text-3xl mb-2">{feeling.emoji}</span>
                    <span className="text-xs text-gray-700 dark:text-gray-300 text-center">{feeling.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sell Product Modal */}
      {showSellModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/20 backdrop-blur-md">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-xl shadow-2xl max-w-md w-full max-h-[85vh] sm:max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sell Product</h3>
              <button
                onClick={() => setShowSellModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Product name"
                  value={sellFormData.productName || ''}
                  onChange={(e) => setSellFormData(prev => ({ ...prev, productName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={sellFormData.price || ''}
                  onChange={(e) => setSellFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <select
                  value={sellFormData.condition || 'New'}
                  onChange={(e) => setSellFormData(prev => ({ ...prev, condition: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="New">New</option>
                  <option value="Used">Used</option>
                  <option value="Refurbished">Refurbished</option>
                </select>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="negotiable"
                    checked={sellFormData.negotiable || false}
                    onChange={(e) => setSellFormData(prev => ({ ...prev, negotiable: e.target.checked }))}
                    className="w-3 xs:w-4 h-3 xs:h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="negotiable" className="text-sm text-gray-700 dark:text-gray-300">Price negotiable</label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (sellFormData.productName && sellFormData.price) {
                        setSellData(sellFormData);
                        setShowSellModal(false);
                        setSellFormData({});
                      } else {
                        showPopup('error', 'Missing Information', 'Please fill in product name and price');
                      }
                    }}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    Add Product
                  </button>
                  <button
                    onClick={() => setShowSellModal(false)}
                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Poll Modal */}
      {showPollModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/20 backdrop-blur-md">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-xl shadow-2xl max-w-md w-full max-h-[85vh] sm:max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Poll</h3>
              <button
                onClick={() => setShowPollModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Poll question"
                  value={pollFormData.question || ''}
                  onChange={(e) => setPollFormData(prev => ({ ...prev, question: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Option 1"
                  value={pollFormData.option1 || ''}
                  onChange={(e) => setPollFormData(prev => ({ ...prev, option1: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Option 2"
                  value={pollFormData.option2 || ''}
                  onChange={(e) => setPollFormData(prev => ({ ...prev, option2: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Option 3 (optional)"
                  value={pollFormData.option3 || ''}
                  onChange={(e) => setPollFormData(prev => ({ ...prev, option3: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Option 4 (optional)"
                  value={pollFormData.option4 || ''}
                  onChange={(e) => setPollFormData(prev => ({ ...prev, option4: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="multipleChoice"
                    checked={pollFormData.isMultipleChoice || false}
                    onChange={(e) => setPollFormData(prev => ({ ...prev, isMultipleChoice: e.target.checked }))}
                    className="w-3 xs:w-4 h-3 xs:h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="multipleChoice" className="text-sm text-gray-700 dark:text-gray-300">Allow multiple choices</label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (pollFormData.question && pollFormData.option1 && pollFormData.option2) {
                        const options = [pollFormData.option1, pollFormData.option2];
                        if (pollFormData.option3) options.push(pollFormData.option3);
                        if (pollFormData.option4) options.push(pollFormData.option4);

                        setPollData({
                          question: pollFormData.question,
                          options: options,
                          isMultipleChoice: pollFormData.isMultipleChoice || false
                        });
                        setShowPollModal(false);
                        setPollFormData({});
                      } else {
                        showPopup('error', 'Missing Information', 'Please fill in question and at least 2 options');
                      }
                    }}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    Create Poll
                  </button>
                  <button
                    onClick={() => setShowPollModal(false)}
                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/20 backdrop-blur-md">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-xl shadow-2xl max-w-md w-full max-h-[85vh] sm:max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Location</h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {/* Worldwide Location Search */}
                <div className="space-y-2">
                  <label className="text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300">
                    🌍 Search Worldwide Location
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search for any location worldwide..."
                      value={locationSearchQuery}
                      onChange={(e) => {
                        setLocationSearchQuery(e.target.value);
                        searchWorldwideLocation(e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
                    />
                    {locationSearchLoading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </div>

                  {/* Search Results */}
                  {locationSearchResults.length > 0 && (
                    <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                      {locationSearchResults.map((result, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setLocationFormData({
                              name: result.display_name.split(',')[0],
                              address: result.display_name,
                              category: 'other',
                              coordinates: {
                                lat: parseFloat(result.lat),
                                lng: parseFloat(result.lon)
                              }
                            });
                            setLocationSearchQuery(result.display_name);
                            setLocationSearchResults([]);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors"
                        >
                          <div className="font-medium text-gray-900 dark:text-white text-sm">
                            {result.display_name.split(',')[0]}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {result.display_name}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>


                {/* Current Location Button */}
                <button
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const { latitude, longitude } = position.coords;
                          // Reverse geocode to get address
                          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`)
                            .then(response => response.json())
                            .then(data => {
                              setLocationFormData({
                                name: data.display_name.split(',')[0],
                                address: data.display_name,
                                category: 'other',
                                coordinates: { lat: latitude, lng: longitude }
                              });
                              setLocationSearchQuery(data.display_name);
                            })
                            .catch(() => {
                              setLocationFormData({
                                name: 'Current Location',
                                address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                                category: 'other',
                                coordinates: { lat: latitude, lng: longitude }
                              });
                            });
                        },
                        (error) => {
                          showPopup('error', 'Location Error', 'Could not get your current location. Please search manually.');
                        }
                      );
                    } else {
                      showPopup('error', 'Not Supported', 'Geolocation is not supported by your browser.');
                    }
                  }}
                  className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  📍 Use Current Location
                </button>

                {/* Manual Location Input */}
                <div className="space-y-2">
                  <label className="text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300">
                    📝 Manual Location Input
                  </label>
                  <input
                    type="text"
                    placeholder="Location name"
                    value={locationFormData.name || ''}
                    onChange={(e) => setLocationFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={locationFormData.address || ''}
                    onChange={(e) => setLocationFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <select
                    value={locationFormData.category || ''}
                    onChange={(e) => setLocationFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select category</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="cafe">Cafe</option>
                    <option value="park">Park</option>
                    <option value="shopping">Shopping</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="other">Other</option>
                  </select>

                  {/* Map Preview */}
                  {locationFormData.coordinates && (
                    <div className="space-y-2">
                      <label className="text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300">
                        🗺️ Location Preview
                      </label>
                      <div className="w-full h-32 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-lg">📍</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {locationFormData.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {locationFormData.coordinates.lat.toFixed(6)}, {locationFormData.coordinates.lng.toFixed(6)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (locationFormData.name && locationFormData.address) {
                          setLocationData(locationFormData);
                          setShowLocationModal(false);
                          setLocationFormData({});
                        } else {
                          showPopup('error', 'Missing Information', 'Please fill in location name and address');
                        }
                      }}
                      className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                      Add Location
                    </button>
                    <button
                      onClick={() => setShowLocationModal(false)}
                      className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// AddCommentForm component for handling comment submissions
const AddCommentForm = ({ postId, onAddComment }: { postId: string, onAddComment: (postId: string, text: string) => void }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={async e => {
        e.preventDefault();
        setLoading(true);
        await onAddComment(postId, text);
        setText(''); // Clear input after successful comment
        setLoading(false);
      }}
    >
      <input
        type="text"
        className="flex-1 border border-gray-300 dark:border-gray-600 rounded-full px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
        placeholder="Add a comment..."
        value={text}
        onChange={e => setText(e.target.value)}
        ref={inputRef}
        disabled={loading}
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm flex-shrink-0 hover:bg-blue-600 transition-colors duration-200"
        disabled={loading || !text.trim()}
      >
        {loading ? 'Posting...' : 'Comment'}
      </button>
    </form>
  );
};