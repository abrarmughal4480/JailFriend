"use client";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Edit, Trash2, MoreVertical, Search, Filter, Camera, Video, Music, FileText, Plus, Heart, MessageCircle, Share2, Bookmark, Settings, Camera as CameraIcon, MapPin, Globe, Calendar, Users, Eye, ThumbsUp, X, ShoppingBag, UserPlus, UserCheck, Phone, BarChart3, Clock, Link as LinkIcon, Gift, Activity } from 'lucide-react';
import PostDisplay from '@/components/PostDisplay';
import Popup, { PopupState } from '@/components/Popup';
import FeedPost from '@/components/FeedPost';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useSystemThemeOverride } from '@/hooks/useSystemThemeOverride';

interface Post {
  _id: string;
  content: string;
  title?: string;
  media?: any[];
  createdAt: string;
  user: string;
  likes?: string[];
  comments?: any[];
  shares?: string[];
  savedBy?: string[];
  reactions?: any[];
}

interface Album {
  _id: string;
  name: string;
  media: any[];
  createdAt: string;
  user: string;
  likes?: string[];
  comments?: any[];
  shares?: string[];
}

type ContentItem = Post | (Album & { type: 'album' });

interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  cover?: string;
  bio?: string;
  isOnline?: boolean;
  gender?: string;
  workplace?: string;
  education?: string;
  location?: string;
  address?: string;
  country?: string;
  phone?: string;
  dateOfBirth?: string;
  joinedDate?: string;
  website?: string;
  followers?: string[];
  following?: string[];
  followersList?: string[];
  followingList?: string[];
}

interface UserImages {
  avatar: string | null;
  cover: string | null;
}

interface Group {
  _id: string;
  name: string;
  description: string;
  category: string;
  privacy: 'public' | 'private' | 'secret';
  avatar?: string;
  coverPhoto?: string;
  creator: {
    _id: string;
    name: string;
    username?: string;
    avatar?: string;
  };
  members: Array<{
  user: {
    _id: string;
    name: string;
      username?: string;
      avatar?: string;
    };
    role: 'member' | 'moderator' | 'admin';
    joinedAt: string;
    isActive: boolean;
  }>;
  stats: {
    memberCount: number;
    postCount: number;
    eventCount: number;
  };
  isActive: boolean;
  website?: string;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: string;
  category: string;
  location: string;
  imageUrl?: string;
  totalItemUnits: number;
  seller: {
    _id: string;
    name: string;
    username?: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const UserProfile: React.FC = () => {
  // Ensure system dark mode has no effect - especially for mobile systems
  useSystemThemeOverride();
  
  const { userId } = useParams();
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const [user, setUser] = useState<User | null>(null);
  const [userImages, setUserImages] = useState<UserImages>({
    avatar: null,
    cover: null
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>({});
  const [showThreeDotMenu, setShowThreeDotMenu] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [editingPost, setEditingPost] = useState<any>(null);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editMediaFiles, setEditMediaFiles] = useState<File[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [newCoverPhoto, setNewCoverPhoto] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Follow by ID states
  const [followById, setFollowById] = useState<string>('');
  const [isFollowingById, setIsFollowingById] = useState<boolean>(false);

  // Add post dropdown state
  const [postDropdownOpen, setPostDropdownOpen] = useState<string | null>(null);

  // Tabs configuration
  const tabs = [
    { id: 'timeline', label: 'Timeline', count: posts.length },
    { id: 'albums', label: 'Albums', count: albums.length },
    { id: 'groups', label: 'Groups', count: groups.length },
    { id: 'products', label: 'Products', count: products.length },
    { id: 'activities', label: 'Activities', count: activities.length }
  ];

  // Filters configuration
  const filters = [
    { id: 'all', label: 'All', icon: <FileText className="w-4 h-4" /> },
    { id: 'text', label: 'Text', icon: <FileText className="w-4 h-4" /> },
    { id: 'photos', label: 'Photos', icon: <Camera className="w-4 h-4" /> },
    { id: 'videos', label: 'Videos', icon: <Video className="w-4 h-4" /> },
    { id: 'sounds', label: 'Sounds', icon: <Music className="w-4 h-4" /> },
    { id: 'files', label: 'Files', icon: <FileText className="w-4 h-4" /> }
  ];

  // Type guard functions
  const isAlbum = (item: ContentItem): item is Album & { type: 'album' } => {
    return 'type' in item && item.type === 'album';
  };

  const isPost = (item: ContentItem): item is Post => {
    return !('type' in item) || item.type !== 'album';
  };

  // Get the actual userId string
  const actualUserId = Array.isArray(userId) ? userId[0] : userId;

  useEffect(() => {
    if (actualUserId) {
      fetchUserProfile();
      fetchUserImages();
      fetchUserContent();
      fetchUserAlbums();
      fetchUserGroups();
      fetchUserProducts();
      fetchUserActivities();
    }
  }, [actualUserId]);

  // Event listeners for updates
  useEffect(() => {
    const handleImagesUpdated = () => {
      fetchUserImages();
    };

    const handlePrivacySettingsUpdated = () => {
      fetchUserProfile();
    };

    const handlePasswordChanged = () => {
      fetchUserProfile();
    };

    window.addEventListener('imagesUpdated', handleImagesUpdated);
    window.addEventListener('privacySettingsUpdated', handlePrivacySettingsUpdated);
    window.addEventListener('passwordChanged', handlePasswordChanged);

    return () => {
      window.removeEventListener('imagesUpdated', handleImagesUpdated);
      window.removeEventListener('privacySettingsUpdated', handlePrivacySettingsUpdated);
      window.removeEventListener('passwordChanged', handlePasswordChanged);
    };
  }, []);

  // Listen for profile updates from settings pages
  useEffect(() => {
    const handleProfileUpdated = () => {
      fetchUserProfile();
    };

    window.addEventListener('profileUpdated', handleProfileUpdated);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdated);
    };
  }, []);

  // Add missing event handlers
  const handleAlbumCreated = () => {
    fetchUserAlbums();
  };

  const handleAlbumUpdated = () => {
    fetchUserAlbums();
  };

  const handleAlbumDeleted = () => {
    fetchUserAlbums();
  };

  const handleGroupCreated = () => {
    fetchUserGroups();
  };

  const handleGroupUpdated = () => {
    fetchUserGroups();
  };

  const handleGroupDeleted = () => {
    fetchUserGroups();
  };

  const handleProductCreated = () => {
    fetchUserProducts();
  };

  const handleProductUpdated = () => {
    fetchUserProducts();
  };

  const handleProductDeleted = () => {
    fetchUserProducts();
  };

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/register');
        return;
      }

      // Handle "me" case - get current user's ID first
      let targetUserId = actualUserId;
      if (actualUserId === 'me') {
        try {
          const currentUserResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/profile/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (currentUserResponse.ok) {
            const currentUser = await currentUserResponse.json();
            targetUserId = currentUser.id;
            // Redirect to the actual user ID to avoid "me" in URL
            router.replace(`/dashboard/profile/${targetUserId}`);
            return;
          } else {
            setError('Failed to get current user information');
            showPopup('error', 'Error', 'Failed to get current user information');
            return;
          }
        } catch (error) {
          console.error('Error fetching current user:', error);
          setError('Failed to get current user information');
          showPopup('error', 'Error', 'Failed to get current user information');
          return;
        }
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/users/${targetUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsFollowing(userData.isFollowing);
          setIsBlocked(userData.isBlocked);
        
        // Check if this is the current user's profile
        const currentUserResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/profile/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (currentUserResponse.ok) {
            const currentUser = await currentUserResponse.json();
            setIsCurrentUser(currentUser.id === actualUserId);
        }
      } else {
          const errorData = await response.json();
        setError(errorData.error || 'Failed to load user profile');
        showPopup('error', 'Error', errorData.error || 'Failed to load user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile');
      showPopup('error', 'Error', 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserImages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/userimages/${actualUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserImages(data);
      }
    } catch (error) {
      console.error('Error fetching user images:', error);
    }
  };

  const fetchUserContent = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // Skip content fetching if userId is "me" (will be handled after redirect)
      if (actualUserId === 'me') return;
      
      // Fetch posts
      const postsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/users/${actualUserId}/posts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          setPosts(postsData);
        }
    } catch (error) {
      console.error('Error fetching user content:', error);
    }
  };

  const fetchUserAlbums = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/users/${actualUserId}/albums`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAlbums(data);
      }
    } catch (error) {
      console.error('Error fetching user albums:', error);
    }
  };

  const fetchUserGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/groups/user/${actualUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('Error fetching user groups:', error);
    }
  };

  const fetchUserProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/users/${actualUserId}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching user products:', error);
    }
  };

  const fetchUserActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/users/${actualUserId}/activities`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      } else {
        // If API doesn't exist, generate activities from real posts data
        const realActivities = generateActivitiesFromPosts(posts);
        setActivities(realActivities);
      }
    } catch (error) {
      console.error('Error fetching user activities:', error);
      // Generate activities from real posts data on error
      const realActivities = generateActivitiesFromPosts(posts);
      setActivities(realActivities);
    }
  };

  // Fetch real analytics data for the modal
  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Try to fetch from analytics endpoint first
      const analyticsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/users/${actualUserId}/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (analyticsResponse.ok) {
        const data = await analyticsResponse.json();
        setAnalyticsData(data);
      } else {
        // Generate analytics from existing posts data
        const analyticsData = generateAnalyticsFromPosts(posts);
        setAnalyticsData(analyticsData);
      }

      // Generate QR code
      await generateQRCode();
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Generate analytics from existing posts data as fallback
      const analyticsData = generateAnalyticsFromPosts(posts);
      setAnalyticsData(analyticsData);
      
      // Generate QR code
      await generateQRCode();
    }
  };

  // Generate analytics from posts data
  const generateAnalyticsFromPosts = (posts: Post[]) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const allPosts = posts.length;
    const thisMonthPosts = posts.filter(post => new Date(post.createdAt) >= thisMonth).length;
    
    const totalLikes = posts.reduce((sum, post) => sum + (post.likes?.length || 0), 0);
    const totalComments = posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0);
    const totalShares = posts.reduce((sum, post) => sum + (post.shares?.length || 0), 0);
    
    return {
      posts: {
        all: allPosts,
        thisMonth: thisMonthPosts
      },
      reactions: {
        total: totalLikes,
        received: totalLikes
      },
      comments: {
        total: totalComments,
        received: totalComments
      },
      shares: {
        total: totalShares,
        received: totalShares
      }
    };
  };

  // Generate activities from real posts data
  const generateActivitiesFromPosts = (posts: Post[]) => {
    const activities: any[] = [];
    
    // Generate activities from posts (likes, comments, shares)
    posts.forEach((post, index) => {
      // Add post creation activity
      activities.push({
        id: `post-${post._id}`,
        type: 'post',
        user: {
          name: user?.name || 'You',
          avatar: user?.avatar || '/default-avatar.svg',
          username: user?.username || 'you'
        },
        target: {
          type: 'post',
          title: post.title || 'New Post',
          content: post.content?.substring(0, 100) + (post.content?.length > 100 ? '...' : '')
        },
        timestamp: post.createdAt,
        description: 'created a post'
      });

      // Add like activities for posts with likes
      if (post.likes && post.likes.length > 0) {
        post.likes.forEach((likeId, likeIndex) => {
          activities.push({
            id: `like-${post._id}-${likeIndex}`,
            type: 'like',
            user: {
              name: user?.name || 'You',
              avatar: user?.avatar || '/default-avatar.svg',
              username: user?.username || 'you'
            },
            target: {
              type: 'post',
              title: post.title || 'Post',
              content: post.content?.substring(0, 50) + (post.content?.length > 50 ? '...' : '')
            },
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            description: 'liked a post'
          });
        });
      }

      // Add comment activities for posts with comments
      if (post.comments && post.comments.length > 0) {
        post.comments.forEach((comment, commentIndex) => {
          activities.push({
            id: `comment-${post._id}-${commentIndex}`,
            type: 'comment',
            user: {
              name: user?.name || 'You',
              avatar: user?.avatar || '/default-avatar.svg',
              username: user?.username || 'you'
            },
            target: {
              type: 'post',
              title: post.title || 'Post',
              content: post.content?.substring(0, 50) + (post.content?.length > 50 ? '...' : '')
            },
            timestamp: comment.createdAt || new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            description: 'commented on a post'
          });
        });
      }

      // Add share activities for posts with shares
      if (post.shares && post.shares.length > 0) {
        post.shares.forEach((shareId, shareIndex) => {
          activities.push({
            id: `share-${post._id}-${shareIndex}`,
            type: 'share',
            user: {
              name: user?.name || 'You',
              avatar: user?.avatar || '/default-avatar.svg',
              username: user?.username || 'you'
            },
            target: {
              type: 'post',
              title: post.title || 'Post',
              content: post.content?.substring(0, 50) + (post.content?.length > 50 ? '...' : '')
            },
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            description: 'shared a post'
          });
        });
      }
    });

    // Sort activities by timestamp (newest first)
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  // Generate QR Code for profile
  const generateQRCode = async () => {
    try {
      const profileUrl = `${window.location.origin}/dashboard/profile/${actualUserId}`;
      
      // Simple QR code generation using canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = 200;
      canvas.width = size;
      canvas.height = size;

      // Create a simple QR-like pattern
      const cellSize = 8;
      const cells = size / cellSize;
      
      // Clear canvas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      // Create QR-like pattern
      ctx.fillStyle = '#000000';
      
      // Corner squares
      const drawCornerSquare = (x: number, y: number) => {
        ctx.fillRect(x, y, cellSize * 7, cellSize);
        ctx.fillRect(x, y, cellSize, cellSize * 7);
        ctx.fillRect(x + cellSize * 6, y, cellSize, cellSize * 7);
        ctx.fillRect(x, y + cellSize * 6, cellSize * 7, cellSize);
        
        // Inner square
        ctx.fillRect(x + cellSize * 2, y + cellSize * 2, cellSize * 3, cellSize * 3);
      };

      // Draw corner squares
      drawCornerSquare(0, 0);
      drawCornerSquare(size - cellSize * 7, 0);
      drawCornerSquare(0, size - cellSize * 7);

      // Add some random pattern in the middle
      for (let i = 0; i < cells; i++) {
        for (let j = 0; j < cells; j++) {
          if (Math.random() > 0.5) {
            ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
          }
        }
      }

      // Add profile URL as text at bottom
      ctx.fillStyle = '#000000';
      ctx.font = '8px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Profile QR', size / 2, size - 2);

      const dataUrl = canvas.toDataURL('image/png');
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/users/${user._id}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        showPopup('success', 'Success', isFollowing ? 'Unfollowed successfully' : 'Followed successfully');
        fetchUserProfile();
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      showPopup('error', 'Error', 'Failed to follow/unfollow user');
    }
  };

  const handleBlock = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/users/${user._id}/block`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsBlocked(!isBlocked);
        showPopup('success', 'Success', isBlocked ? 'Unblocked successfully' : 'Blocked successfully');
        fetchUserProfile();
      }
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
      showPopup('error', 'Error', 'Failed to block/unblock user');
    }
  };

  // Follow by ID handler
  const handleFollowById = async () => {
    if (!followById.trim()) {
      showPopup('error', 'Invalid Input', 'Please enter a valid user ID');
      return;
    }

    try {
      setIsFollowingById(true);
      const token = localStorage.getItem('token');
      if (!token) {
        showPopup('error', 'Authentication Error', 'Please login to follow users');
        return;
      }

      console.log('🔗 Frontend: Following user by ID:', followById);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/users/${followById.trim()}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const action = data.isFollowing ? 'followed' : 'unfollowed';
        showPopup('success', 'Success!', `User ${action} successfully`);
        
        // Clear the input
        setFollowById('');
      } else {
        const errorData = await response.json();
        showPopup('error', 'Error', errorData.error || 'Failed to follow user');
      }

    } catch (error: any) {
      console.error('❌ Error following user by ID:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to follow user';
      showPopup('error', 'Error', errorMessage);
    } finally {
      setIsFollowingById(false);
    }
  };

  const handleMessage = () => {
    // Navigate to messages page
    router.push('/dashboard/messages');
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setEditContent(post.content);
    setShowEditModal(true);
  };

  const handleEditProfile = () => {
    router.push('/dashboard/settings/profile');
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewCoverPhoto(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveAvatar = async () => {
    if (!newAvatar) return;
    
    try {
      setUploadingAvatar(true);
      const token = localStorage.getItem('token');
      if (!token) {
        showPopup('error', 'Authentication Error', 'Please log in again');
        return;
      }

      const formData = new FormData();
      formData.append('avatar', newAvatar);

              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/userimages/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setUserImages(prev => ({
          ...prev,
          avatar: data.avatar
        }));
        setNewAvatar(null);
        setAvatarPreview('');
        showPopup('success', 'Avatar Updated!', 'Your profile picture has been updated successfully!');
        window.dispatchEvent(new CustomEvent('profileUpdated'));
        fetchUserImages();
      } else {
        const errorData = await response.json();
        showPopup('error', 'Upload Failed', errorData.error || 'Failed to upload avatar');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      showPopup('error', 'Upload Failed', 'Failed to upload avatar. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveCoverPhoto = async () => {
    if (!newCoverPhoto) return;
    
    try {
      setUploadingCover(true);
      const token = localStorage.getItem('token');
      if (!token) {
        showPopup('error', 'Authentication Error', 'Please log in again');
        return;
      }

      const formData = new FormData();
      formData.append('cover', newCoverPhoto);

              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/userimages/cover`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setUserImages(prev => ({
          ...prev,
          cover: data.cover
        }));
        setNewCoverPhoto(null);
        setCoverPreview('');
        showPopup('success', 'Cover Updated!', 'Your cover photo has been updated successfully!');
        fetchUserImages();
      } else {
        const errorData = await response.json();
        showPopup('error', 'Upload Failed', errorData.error || 'Failed to upload cover photo');
      }
    } catch (error) {
      console.error('Error uploading cover photo:', error);
      showPopup('error', 'Upload Failed', 'Failed to upload cover photo. Please try again.');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const token = localStorage.getItem('token');
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/posts/${postId}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setPosts(posts.filter(post => post._id !== postId));
        showPopup('success', 'Post Deleted', 'Post has been deleted successfully');
      } else {
        showPopup('error', 'Error', 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      showPopup('error', 'Error', 'Failed to delete post');
    }
  };

  const getFilteredContent = () => {
    let filtered: ContentItem[] = [
      ...posts, 
      ...albums.map(album => ({ ...album, type: 'album' as const }))
    ];
    
    if (activeFilter !== 'all') {
      filtered = filtered.filter(item => {
        if (isAlbum(item)) {
          return activeFilter === 'photos';
        }
        
        // For posts, check media type
        if (item.media && item.media.length > 0) {
          const mediaTypes = item.media.map((media: any) => media.type);
          switch (activeFilter) {
            case 'photos':
              return mediaTypes.some((type: any) => type === 'image');
            case 'videos':
              return mediaTypes.some((type: any) => type === 'video');
            case 'sounds':
              return mediaTypes.some((type: any) => type === 'audio');
            case 'files':
              return mediaTypes.some((type: any) => type === 'file');
            case 'text':
              return !item.media || item.media.length === 0;
            default:
              return true;
          }
        } else {
          // Posts without media are considered text posts
          return activeFilter === 'text';
        }
      });
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        if (isAlbum(item)) {
          return item.name?.toLowerCase().includes(query);
        }
        return item.content?.toLowerCase().includes(query) || item.title?.toLowerCase().includes(query);
      });
    }
    
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  // Handler functions for FeedPost component
  const handleLike = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setPosts(posts.map(post => {
          if (post._id === postId) {
            const isLiked = post.likes?.includes(user?._id || '');
            return {
              ...post,
              likes: isLiked 
                ? post.likes?.filter(id => id !== (user?._id || '')) || []
                : [...(post.likes || []), user?._id || '']
            };
          }
          return post;
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleReaction = async (postId: string, reactionType: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/posts/${postId}/react`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reactionType })
      });

      if (response.ok) {
        // Update posts state with new reaction
        setPosts(posts.map(post => {
          if (post._id === postId) {
            return { ...post, reactions: [...(post.reactions || []), { userId: user?._id || '', type: reactionType, createdAt: new Date().toISOString() }] };
          }
          return post;
        }));
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleComment = async (postId: string, comment: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: comment })
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(posts.map(post => post._id === postId ? data.post : post));
        showPopup('success', 'Comment Added', 'Comment posted successfully!');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      showPopup('error', 'Error', 'Failed to post comment');
    }
  };

  const handleShare = async (postId: string, shareOptions: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/posts/${postId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shareOptions)
      });

      if (response.ok) {
        showPopup('success', 'Post Shared', 'Post shared successfully!');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
      showPopup('error', 'Error', 'Failed to share post');
    }
  };

  const handleSave = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/posts/${postId}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setPosts(posts.map(post => {
          if (post._id === postId) {
            const isSaved = post.savedBy?.includes(user?._id || '');
            return {
              ...post,
              savedBy: isSaved 
                ? post.savedBy?.filter(id => id !== (user?._id || '')) || []
                : [...(post.savedBy || []), user?._id || '']
            };
          }
          return post;
        }));
        showPopup('success', 'Post Saved', 'Post saved to your collection!');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      showPopup('error', 'Error', 'Failed to save post');
    }
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setEditContent(post.content || '');
    setEditTitle(post.title || '');
    setEditMediaFiles([]);
  };

  const handleSaveEdit = async () => {
    if (!editingPost || !editContent.trim()) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/posts/${editingPost._id}`, { 
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: editContent })
      });

      if (response.ok) {
        showPopup('success', 'Post Updated', 'Post has been updated successfully');
        setShowEditModal(false);
        setEditingPost(null);
        setEditContent('');
        fetchUserContent();
      } else {
        showPopup('error', 'Update Failed', 'Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      showPopup('error', 'Update Failed', 'Failed to update post');
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

  // Toggle post dropdown
  const togglePostDropdown = (postId: string) => {
    setPostDropdownOpen(postDropdownOpen === postId ? null : postId);
  };

  // Close post dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (postDropdownOpen && !(event.target as Element).closest('.post-dropdown')) {
        setPostDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [postDropdownOpen]);

  const getMediaUrl = (url: string) => {
    if (!url) return '/default-avatar.svg';
    if (url.startsWith('http')) return url;
    
    // Handle localhost URLs that might be stored incorrectly
    if (url.includes('localhost:3000')) {
              const correctedUrl = url.replace('http://localhost:3000', 'https://jaifriend-backend.hgdjlive.com');
      console.log('🔗 getMediaUrl - Fixed localhost URL:', { original: url, corrected: correctedUrl });
      return correctedUrl;
    }
    
    // Handle hardcoded placeholder avatars that don't exist
    if (url.includes('/avatars/') || url.includes('/covers/')) {
      console.log('🔗 getMediaUrl - Placeholder avatar detected:', url);
      return '/default-avatar.svg';
    }
    
          return `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/${url}`;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className={`mt-3 sm:mt-4 text-sm sm:text-base transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <p className={`text-sm sm:text-base transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen overflow-x-hidden max-w-full transition-colors duration-200 pb-4 sm:pb-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Add CSS for line-clamp */}
      <style jsx>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .post-content-full {
          display: block;
        }
        .post-dropdown {
          position: relative;
        }
        .post-dropdown-menu {
          animation: fadeIn 0.2s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .read-more-btn {
          transition: all 0.2s ease;
        }
        .read-more-btn:hover {
          color: #2563eb;
          text-decoration: underline;
        }
        .filter-scroll::-webkit-scrollbar {
          display: none;
        }
        .filter-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      {/* Cover Photo Section */}
      <div className="relative h-32 sm:h-48 md:h-64 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 overflow-hidden">
        {userImages.cover ? (
        <img
            src={getMediaUrl(userImages.cover)} 
          alt="Cover"
          className="w-full h-full object-cover"
        />
        ) : (
          /* Particle effect overlay */
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 1px, transparent 1px),
                             radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 1px, transparent 1px),
                             radial-gradient(circle at 40% 40%, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: '100px 100px, 80px 80px, 60px 60px'
          }}></div>
        )}
      
        {/* Cover actions - only show for current user */}
        {isCurrentUser && (
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-1 sm:gap-2">
            <label className="px-2 py-1 sm:px-3 sm:py-2 bg-black bg-opacity-20 text-white rounded-lg backdrop-blur-sm hover:bg-opacity-30 transition-all flex items-center gap-1 text-xs sm:text-sm cursor-pointer">
              <span className="text-sm">📷</span>
              <span className="hidden xs:inline">Cover</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverPhotoUpload}
                  className="hidden"
                />
            </label>
            <button className="p-1 sm:p-2 bg-black bg-opacity-20 text-white rounded-lg backdrop-blur-sm hover:bg-opacity-30 transition-all">
              <span className="text-sm">➕</span>
              </button>
          </div>
        )}
      </div>

      {/* Profile Header */}
      <div className="relative px-3 pb-4 -mt-12 sm:-mt-20">
        <div className="w-full max-w-full">
          {/* Profile Picture and Actions */}
          <div className="flex flex-col items-center gap-3 mb-4">
              {/* Profile Picture */}
              <div className="relative">
                <img
                  src={avatarPreview || (userImages.avatar ? getMediaUrl(userImages.avatar) : (user.avatar && user.avatar !== '/avatars/1.png.png' ? getMediaUrl(user.avatar) : '/default-avatar.svg'))}
                  alt={user.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl object-cover bg-gray-200"
                  onError={(e) => {
                    console.log('❌ Avatar load failed for user:', user.name, 'URL:', user.avatar);
                    e.currentTarget.src = '/default-avatar.svg';
                  }}
                />
                {isCurrentUser && (
                <label className="absolute bottom-1 right-1 w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors shadow-lg">
                  {uploadingAvatar ? (
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span className="text-sm">📷</span>
                  )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                    disabled={uploadingAvatar}
                      />
                    </label>
                )}
                {user.isOnline && (
                <div className="absolute bottom-3 right-3 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              {/* User Info */}
              <div className="text-center">
              <h1 className={`text-xl sm:text-2xl font-bold mb-1 break-words transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</h1>
              <p className={`text-sm sm:text-base mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>@{user.username}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1 sm:gap-2 flex-wrap justify-center sm:justify-start">
              {!isCurrentUser && (
                <>
                  <button 
                    onClick={handleFollow}
                    className={`flex items-center justify-center gap-1 px-2 sm:px-3 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium min-w-[80px] sm:min-w-[100px] ${
                      isFollowing 
                        ? isDarkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 active:bg-gray-800' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400'
                        : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
                    }`}
                  >
                    {isFollowing ? <UserCheck className="w-3 h-3 sm:w-4 sm:h-4" /> : <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />}
                    <span className="hidden xs:inline">{isFollowing ? 'Following' : 'Follow'}</span>
                    <span className="xs:hidden">{isFollowing ? '✓' : '+'}</span>
                  </button>
                  <button 
                    onClick={handleMessage}
                    className="flex items-center justify-center gap-1 px-2 sm:px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 active:bg-green-700 transition-all duration-200 text-xs sm:text-sm font-medium min-w-[80px] sm:min-w-[100px]"
                  >
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Message</span>
                    <span className="xs:hidden">Msg</span>
                  </button>
                  <button 
                    onClick={handleBlock}
                    className={`flex items-center justify-center gap-1 px-2 sm:px-3 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium min-w-[80px] sm:min-w-[100px] ${
                      isBlocked 
                        ? 'bg-red-200 text-red-700 hover:bg-red-300 active:bg-red-400' 
                        : isDarkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 active:bg-gray-800' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400'
                    }`}
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">{isBlocked ? 'Unblock' : 'Block'}</span>
                    <span className="xs:hidden">{isBlocked ? '✓' : '✕'}</span>
                  </button>
                </>
              )}
              {isCurrentUser && (
                <>
                  <div className="relative">
                    <button 
                      onClick={() => setShowThreeDotMenu(!showThreeDotMenu)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 active:bg-gray-800' 
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300 active:bg-gray-400'
                      }`}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {/* Three-dot dropdown menu */}
                    {showThreeDotMenu && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowThreeDotMenu(false)}
                        />
                        <div className={`absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg z-20 ${
                          isDarkMode 
                            ? 'bg-gray-800 border border-gray-700' 
                            : 'bg-white border border-gray-200'
                        }`}>
                          <button
                            onClick={() => {
                              setShowThreeDotMenu(false);
                              fetchAnalyticsData();
                              setShowAnalyticsModal(true);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm rounded-t-lg transition-colors ${
                              isDarkMode 
                                ? 'text-gray-300 hover:bg-gray-700' 
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <BarChart3 className="w-4 h-4 inline mr-2" />
                            Analytics Dashboard
                          </button>
                          <button
                            onClick={() => {
                              setShowThreeDotMenu(false);
                              // Add other actions here
                            }}
                            className={`w-full text-left px-4 py-3 text-sm rounded-b-lg transition-colors ${
                              isDarkMode 
                                ? 'text-gray-300 hover:bg-gray-700' 
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Settings className="w-4 h-4 inline mr-2" />
                            Settings
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                    <button 
                      onClick={handleEditProfile}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                    >
                      <Edit className="w-4 h-4" />
                    <span>Edit</span>
                    </button>
                  <button 
                    onClick={() => setActiveTab('activities')}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-sm ${
                      isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>Activities</span>
                  </button>
                </>
              )}
            </div>
            </div>

          {/* User Details */}
          <div className="mb-4 text-center">
            {user.bio && (
              <p className={`mb-3 text-sm sm:text-base max-w-full mx-auto px-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{user.bio}</p>
            )}

            <div className={`flex flex-wrap gap-1 text-xs sm:text-sm mb-3 justify-center px-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{user.location}</span>
            </div>
              )}
              {user.website && (
                <div className="flex items-center gap-1">
                  <Globe className="w-3 h-3 flex-shrink-0" />
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                    {user.website}
                  </a>
          </div>
              )}
              {user.joinedDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <span>Joined {new Date(user.joinedDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`border-b sticky top-0 z-30 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="w-full px-3">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors whitespace-nowrap min-w-fit ${
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
      <div className="w-full px-3 py-4">
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            {/* Content Layout - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Left Sidebar - User Information */}
              <div className="lg:col-span-1 space-y-4">
                {/* Search Box */}
                <div className={`rounded-xl shadow-sm p-3 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
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

                {/* Follow by ID Section */}
                <div className={`rounded-xl shadow-sm p-3 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="mb-3">
                    <h3 className={`text-sm font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Follow by User ID
                    </h3>
                    <p className={`text-xs transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Enter a user ID to follow them directly
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="relative">
                      <UserPlus className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        placeholder="Enter User ID"
                        value={followById}
                        onChange={(e) => setFollowById(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-colors duration-200 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                        }`}
                      />
                    </div>
                    
                    <button
                      onClick={handleFollowById}
                      disabled={isFollowingById || !followById.trim()}
                      className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                        isFollowingById || !followById.trim()
                          ? isDarkMode
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600 text-white hover:shadow-lg transform hover:scale-105'
                      }`}
                    >
                      {isFollowingById ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Following...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Follow User</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* User Details Card */}
                <div className={`rounded-xl shadow-sm p-3 space-y-3 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  {/* Status */}
                  <div className="text-center">
                    <p className={`font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{user.bio || 'No bio added yet'}</p>
                  </div>

                  {/* Online Status */}
                  <div className="flex items-center justify-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{user.isOnline ? 'Online' : 'Offline'}</span>
                  </div>

                  {/* Connections */}
                  <div className="space-y-3">
                    <div className="text-center mb-3">
                      <h4 className={`text-sm font-semibold transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Connections</h4>
                    </div>
                    <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      isDarkMode 
                        ? 'bg-blue-900/20 border-blue-700 hover:bg-blue-900/30' 
                        : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                    }`}>
                      <div className={`flex items-center gap-2 transition-colors duration-200 ${
                        isDarkMode ? 'text-blue-300' : 'text-blue-700'
                      }`}>
                        <Users className={`w-5 h-5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                        <span className="text-lg font-bold">
                          {user.following?.length || user.followingList?.length || 0}
                        </span>
                        <span className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Following</span>
                      </div>
                    </div>
                    <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      isDarkMode 
                        ? 'bg-green-900/20 border-green-700 hover:bg-green-900/30' 
                        : 'bg-green-50 border-green-200 hover:bg-green-100'
                    }`}>
                      <div className={`flex items-center gap-2 transition-colors duration-200 ${
                        isDarkMode ? 'text-green-300' : 'text-green-700'
                      }`}>
                        <Users className={`w-5 h-5 flex-shrink-0 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
                        <span className="text-lg font-bold">
                          {user.followers?.length || user.followersList?.length || 0}
                        </span>
                        <span className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Followers</span>
                      </div>
                    </div>
                  </div>

                  {/* Posts Count */}
                  <div className={`flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span>{posts.length} posts</span>
                  </div>

                  {/* Gender */}
                  {user.gender && (
                  <div className={`flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="text-lg">👤</span>
                      <span>{user.gender}</span>
                  </div>
                  )}

                  {/* Work */}
                  {user.workplace && (
                  <div className={`flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="text-lg">💼</span>
                      <span>{user.workplace}</span>
                </div>
                  )}

                  {/* Education */}
                  {user.education && (
                  <div className={`flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="text-lg">🎓</span>
                      <span>{user.education}</span>
                            </div>
                  )}

                  {/* Location */}
                  {user.location && (
                  <div className={`flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="text-lg">🏠</span>
                      <span>{user.location}</span>
                  </div>
                  )}

                  {/* Specific Location */}
                  {user.address && (
                  <div className={`flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span>{user.address}</span>
                  </div>
                  )}

                  {/* Country */}
                  {user.country && (
                    <div className={`flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="text-lg">🌍</span>
                      <span>{user.country}</span>
                </div>
                  )}

                  {/* Phone */}
                  {user.phone && (
                    <div className={`flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{user.phone}</span>
                      </div>
                  )}

                  {/* Date of Birth */}
                  {user.dateOfBirth && (
                    <div className={`flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="text-lg">🎂</span>
                      <span>{new Date(user.dateOfBirth).toLocaleDateString()}</span>
                        </div>
                  )}

                  {/* Joined Date */}
                  {user.joinedDate && (
                    <div className={`flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>Joined {new Date(user.joinedDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  {/* Website */}
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
              <div className="lg:col-span-3 space-y-4">
                {/* Content Filter Buttons */}
                <div className={`rounded-xl shadow-sm p-4 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex items-center gap-2 overflow-x-auto">
                    <div className="filter-scroll flex items-center gap-2">
                  <button
                        onClick={() => setActiveFilter('all')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                          activeFilter === 'all'
                            ? 'bg-red-100 text-red-600 border border-red-200'
                            : isDarkMode 
                              ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        <span className="text-sm font-medium">All</span>
                  </button>
                      
                      <button
                        onClick={() => setActiveFilter('text')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                          activeFilter === 'text'
                            ? 'bg-red-100 text-red-600 border border-red-200'
                            : isDarkMode 
                              ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="w-4 h-4 flex items-center justify-center">
                          <div className="w-3 h-0.5 bg-current rounded-full"></div>
                          <div className="w-3 h-0.5 bg-current rounded-full mt-1"></div>
                          <div className="w-3 h-0.5 bg-current rounded-full mt-1"></div>
                      </div>
                        <span className="text-sm font-medium">Text</span>
                      </button>
                      
                      <button
                        onClick={() => setActiveFilter('photos')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                          activeFilter === 'photos'
                            ? 'bg-red-100 text-red-600 border border-red-200'
                            : isDarkMode 
                              ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <Camera className="w-4 h-4" />
                        <span className="text-sm font-medium">Photos</span>
                      </button>
                      
                      <button
                        onClick={() => setActiveFilter('videos')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                          activeFilter === 'videos'
                            ? 'bg-red-100 text-red-600 border border-red-200'
                            : isDarkMode 
                              ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <Video className="w-4 h-4" />
                        <span className="text-sm font-medium">Videos</span>
                  </button>

                      <button
                        onClick={() => setActiveFilter('sounds')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                          activeFilter === 'sounds'
                            ? 'bg-red-100 text-red-600 border border-red-200'
                            : isDarkMode 
                              ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <Music className="w-4 h-4" />
                        <span className="text-sm font-medium">Sounds</span>
                      </button>
                      
                      <button
                        onClick={() => setActiveFilter('files')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                          activeFilter === 'files'
                            ? 'bg-red-100 text-red-600 border border-red-200'
                            : isDarkMode 
                              ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        <span className="text-sm font-medium">Files</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Posts Feed */}
                <div className="space-y-4">
              {(() => {
                const filteredContent = getFilteredContent();

                if (filteredContent.length === 0) {
                  return (
                    <div className={`rounded-xl shadow-sm p-6 text-center transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className="text-gray-400 mb-3">
                        <FileText className="w-16 h-16 mx-auto" />
                      </div>
                      <h3 className={`text-lg font-semibold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No content found</h3>
                      <p className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {searchQuery ? 'Try adjusting your search terms' : 'This user hasn\'t shared anything yet'}
                      </p>
                    </div>
                  );
                }

                return filteredContent.map((item: ContentItem) => {
                  if (isAlbum(item)) {
                    return (
                      <div key={item._id} className={`rounded-xl shadow-sm overflow-hidden transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              src={user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.comp'}/${user.avatar}`) : '/default-avatar.svg'}
                              alt={user?.name || 'User'}
                              className="w-10 h-10 rounded-full border-2 border-blue-400"
                              onError={(e) => {
                                console.log('❌ Avatar load failed for user:', user?.name, 'URL:', user?.avatar);
                                e.currentTarget.src = '/default-avatar.svg';
                              }}
                            />
                            <div>
                              <h4 className={`font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user?.name || 'User'}</h4>
                              <p className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Created an album • {new Date(item.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          <h3 className={`text-lg font-semibold mb-3 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</h3>
                          
                          {/* Album Media Grid */}
                          {item.media && item.media.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mb-3">
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
                          <div className={`flex items-center gap-4 pt-3 border-t transition-colors duration-200 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
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
                    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                    const isOwnPost = item.user === currentUser._id || item.user === currentUser.id;
                    
                    return (
                      <FeedPost
                        key={item._id}
                        post={{
                          ...item,
                          user: {
                            _id: user._id,
                            name: user.name,
                            username: user.username,
                            avatar: userImages.avatar || user.avatar
                          }
                        }}
                        onLike={handleLike}
                        onReaction={handleReaction}
                        onComment={handleComment}
                        onShare={handleShare}
                        onSave={handleSave}
                        onDelete={handleDeletePost}
                        onEdit={handleEdit}
                        isOwnPost={isOwnPost}
                      />
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
          <div className={`rounded-xl shadow-sm p-6 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {activeTab === 'albums' ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Albums</h3>
                  {isCurrentUser && (
                    <button
                      onClick={() => router.push('/dashboard/albums')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Create Album
                    </button>
                  )}
                </div>
                
                {albums.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {albums.map((album) => (
                      <div key={album._id} className={`rounded-lg p-4 border transition-colors duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600' 
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <h4 className={`font-semibold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{album.name}</h4>
                        <div className="grid grid-cols-3 gap-1 mb-2">
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
                  <div className="text-center py-8">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-200 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <Camera className="w-8 h-8 text-gray-400" />
          </div>
                    <h4 className={`text-lg font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No albums yet</h4>
                    <p className={`mb-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>No albums to display</p>
                    {isCurrentUser && (
                      <button
                        onClick={() => router.push('/dashboard/albums')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Create Album
                      </button>
                    )}
          </div>
        )}
          </div>
            ) : activeTab === 'groups' ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Groups</h3>
                  {isCurrentUser && (
                    <button
                      onClick={() => router.push('/dashboard/groups')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Create Group
                    </button>
                  )}
                </div>
                
                {groups.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groups.map((group) => (
                      <div key={group._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-2">{group.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Users className="w-3 h-3" />
                          <span>{group.stats.memberCount} members</span>
          </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No groups yet</h4>
                    <p className="text-gray-600 mb-4">No groups to display</p>
                    {isCurrentUser && (
                      <button
                        onClick={() => router.push('/dashboard/groups')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Create Group
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : activeTab === 'products' ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Products</h3>
                  {isCurrentUser && (
                    <button
                      onClick={() => router.push('/dashboard/products')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Add Product
                    </button>
                  )}
                </div>
                
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <div key={product._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-2">{product.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-green-600">
                            {product.currency} {product.price}
                          </span>
                          <span className="text-gray-500">{product.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No products yet</h4>
                    <p className="text-gray-600 mb-4">No products to display</p>
                    {isCurrentUser && (
                      <button
                        onClick={() => router.push('/dashboard/products')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Add Product
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : activeTab === 'activities' ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Activities</h3>
                </div>
                
                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className={`rounded-lg p-4 border transition-colors duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-700' 
                          : 'bg-white border-gray-200'
                      }`}>
                        <div className="flex items-start gap-3">
                          {/* Activity Icon */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            activity.type === 'follow' 
                              ? 'bg-blue-100 text-blue-600' 
                              : activity.type === 'like'
                              ? 'bg-red-100 text-red-600'
                              : activity.type === 'comment'
                              ? 'bg-green-100 text-green-600'
                              : activity.type === 'share'
                              ? 'bg-purple-100 text-purple-600'
                              : activity.type === 'post'
                              ? 'bg-indigo-100 text-indigo-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {activity.type === 'follow' ? (
                              <Users className="w-5 h-5" />
                            ) : activity.type === 'like' ? (
                              <Heart className="w-5 h-5" />
                            ) : activity.type === 'comment' ? (
                              <MessageCircle className="w-5 h-5" />
                            ) : activity.type === 'share' ? (
                              <Share2 className="w-5 h-5" />
                            ) : activity.type === 'post' ? (
                              <FileText className="w-5 h-5" />
                            ) : (
                              <Activity className="w-5 h-5" />
                            )}
                          </div>
                          
                          {/* Activity Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <img
                                src={activity.user.avatar || '/default-avatar.svg'}
                                alt={activity.user.name}
                                className="w-6 h-6 rounded-full"
                                onError={(e) => {
                                  e.currentTarget.src = '/default-avatar.svg';
                                }}
                              />
                              <span className={`font-medium transition-colors duration-200 ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {activity.user.name}
                              </span>
                              <span className={`text-sm transition-colors duration-200 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                {activity.description}
                              </span>
                              {activity.target.name && (
                                <>
                                  <span className={`text-sm transition-colors duration-200 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                  }`}>
                                    {activity.target.name}
                                  </span>
                                  <img
                                    src={activity.target.avatar || '/default-avatar.svg'}
                                    alt={activity.target.name}
                                    className="w-6 h-6 rounded-full"
                                    onError={(e) => {
                                      e.currentTarget.src = '/default-avatar.svg';
                                    }}
                                  />
                                </>
                              )}
                            </div>
                            
                            {activity.target.title && (
                              <div className={`text-sm transition-colors duration-200 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                <span className="font-medium">{activity.target.title}</span>
                                {activity.target.content && (
                                  <span className="ml-2">- {activity.target.content.length > 50 ? activity.target.content.substring(0, 50) + '...' : activity.target.content}</span>
                                )}
                              </div>
                            )}
                            
                            <div className={`text-xs mt-1 transition-colors duration-200 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <Activity className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className={`text-lg font-medium mb-2 transition-colors duration-200 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>No activities yet</h4>
                    <p className={`transition-colors duration-200 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>No activities to display</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {tabs.find(tab => tab.id === activeTab)?.label}
                </h3>
                <p className="text-gray-600">This section is coming soon!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Post Modal */}
      {showEditModal && editingPost && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-3 sm:p-4 bg-black bg-opacity-50">
          <div className={`rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit Post</h3>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className={`w-full h-24 sm:h-32 p-2 sm:p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="What's on your mind?"
            />
            <div className="flex space-x-2 sm:space-x-3 mt-3 sm:mt-4">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPost(null);
                  setEditContent('');
                }}
                className={`flex-1 px-3 sm:px-4 py-2 border rounded-lg transition-colors text-sm sm:text-base ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Analytics Modal */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-60 backdrop-blur-sm">
          <div className={`rounded-2xl shadow-2xl max-w-3xl w-full max-h-[65vh] overflow-y-auto scrollbar-hide transform transition-all duration-300 scale-100 ${
            isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            {/* Enhanced Modal Header */}
            <div className={`relative p-3 border-b transition-colors duration-200 ${
              isDarkMode ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900' : 'border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                    isDarkMode ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                  }`}>
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold transition-colors duration-200 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {user?.name}'s Dashboard
                    </h2>
                    <p className={`text-sm transition-colors duration-200 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Analytics & Profile Information
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className={`p-3 rounded-full transition-all duration-200 hover:scale-110 ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Enhanced Modal Content */}
            <div className="p-3">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Left Side - QR Code and My Info */}
                <div className="space-y-3">
                  {/* Enhanced QR Code Section */}
                  <div className={`p-3 rounded-lg transition-all duration-200 hover:shadow-lg ${
                    isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200'
                  }`}>
                    <div className="text-center">
                      <h3 className={`text-sm font-semibold mb-2 transition-colors duration-200 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Profile QR Code
                      </h3>
                      <div className="relative inline-block">
                        <div className={`p-2 rounded-lg shadow-lg transition-all duration-200 ${
                          isDarkMode ? 'bg-white' : 'bg-white'
                        }`}>
                          {qrCodeDataUrl ? (
                            <img 
                              src={qrCodeDataUrl} 
                              alt="Profile QR Code" 
                              className="w-28 h-28 mx-auto rounded-lg"
                            />
                          ) : (
                            <div className="w-28 h-28 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                              <div className="text-gray-500 text-xs">Generating QR...</div>
                            </div>
                          )}
                        </div>
                        <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                          isDarkMode ? 'bg-blue-500' : 'bg-blue-500'
                        }`}>
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <p className={`text-sm mt-4 transition-colors duration-200 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Scan to visit {user?.name}'s profile
                      </p>
                    </div>
                  </div>

                  {/* Enhanced My Info Section */}
                  <div className={`p-3 rounded-lg transition-all duration-200 hover:shadow-lg ${
                    isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className={`text-sm font-semibold transition-colors duration-200 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          Download My Information
                        </h3>
                        <p className={`text-xs transition-colors duration-200 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Export your profile data
                        </p>
                      </div>
                      <button className={`px-2 py-1 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg ${
                        isDarkMode 
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white' 
                          : 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white'
                      }`}>
                        <div className="flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          <span className="text-xs">Download</span>
                        </div>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-lg ${
                        isDarkMode ? 'bg-gray-700' : 'bg-white'
                      }`}>
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded flex items-center justify-center">
                            <div className="w-1 h-1 bg-blue-500 rounded"></div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className={`font-medium transition-colors duration-200 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          Secure Data Export
                        </p>
                        <p className={`text-sm transition-colors duration-200 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Your data is encrypted and secure
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Enhanced Analytics */}
                <div className="space-y-2">
                  {/* Enhanced Post Analytics */}
                  <div className={`p-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                    isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-gradient-to-br from-red-50 to-pink-50 border border-red-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                        <FileText className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <h3 className={`text-sm font-semibold transition-colors duration-200 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>Post Analytics</h3>
                        <p className={`text-xs transition-colors duration-200 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>Content performance metrics</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`text-center p-2 rounded-lg transition-all duration-200 ${
                        isDarkMode ? 'bg-gray-700' : 'bg-white'
                      }`}>
                        <div className={`text-xl font-bold mb-1 transition-colors duration-200 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {analyticsData.posts?.all || 0}
                        </div>
                        <div className={`text-xs font-medium transition-colors duration-200 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>ALL POSTS</div>
                      </div>
                      <div className={`text-center p-2 rounded-lg transition-all duration-200 ${
                        isDarkMode ? 'bg-gray-700' : 'bg-white'
                      }`}>
                        <div className={`text-xl font-bold mb-1 transition-colors duration-200 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {analyticsData.posts?.thisMonth || 0}
                        </div>
                        <div className={`text-xs font-medium transition-colors duration-200 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>THIS MONTH</div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Reaction Analytics */}
                  <div className={`p-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                    isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Heart className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <h3 className={`text-sm font-semibold transition-colors duration-200 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>Reaction Analytics</h3>
                        <p className={`text-xs transition-colors duration-200 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>Engagement metrics</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`text-center p-2 rounded-lg transition-all duration-200 ${
                        isDarkMode ? 'bg-gray-700' : 'bg-white'
                      }`}>
                        <div className={`text-xl font-bold mb-1 transition-colors duration-200 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {analyticsData.reactions?.total || 0}
                        </div>
                        <div className={`text-xs font-medium transition-colors duration-200 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>REACTED POSTS</div>
                      </div>
                      <div className={`text-center p-2 rounded-lg transition-all duration-200 ${
                        isDarkMode ? 'bg-gray-700' : 'bg-white'
                      }`}>
                        <div className={`text-xl font-bold mb-1 transition-colors duration-200 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {analyticsData.reactions?.received || 0}
                        </div>
                        <div className={`text-xs font-medium transition-colors duration-200 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>REACTIONS BY</div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Comment Analytics */}
                  <div className={`p-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                    isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
                        <MessageCircle className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <h3 className={`text-sm font-semibold transition-colors duration-200 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>Comment Analytics</h3>
                        <p className={`text-xs transition-colors duration-200 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>Interaction metrics</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`text-center p-2 rounded-lg transition-all duration-200 ${
                        isDarkMode ? 'bg-gray-700' : 'bg-white'
                      }`}>
                        <div className={`text-xl font-bold mb-1 transition-colors duration-200 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {analyticsData.comments?.total || 0}
                        </div>
                        <div className={`text-xs font-medium transition-colors duration-200 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>COMMENTS</div>
                      </div>
                      <div className={`text-center p-2 rounded-lg transition-all duration-200 ${
                        isDarkMode ? 'bg-gray-700' : 'bg-white'
                      }`}>
                        <div className={`text-xl font-bold mb-1 transition-colors duration-200 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {analyticsData.comments?.received || 0}
                        </div>
                        <div className={`text-xs font-medium transition-colors duration-200 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>COMMENT BY</div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Share Analytics */}
                  <div className={`p-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                    isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Share2 className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <h3 className={`text-sm font-semibold transition-colors duration-200 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>Share Analytics</h3>
                        <p className={`text-xs transition-colors duration-200 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>Viral reach metrics</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`text-center p-2 rounded-lg transition-all duration-200 ${
                        isDarkMode ? 'bg-gray-700' : 'bg-white'
                      }`}>
                        <div className={`text-xl font-bold mb-1 transition-colors duration-200 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {analyticsData.shares?.total || 0}
                        </div>
                        <div className={`text-xs font-medium transition-colors duration-200 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>SHARED</div>
                      </div>
                      <div className={`text-center p-2 rounded-lg transition-all duration-200 ${
                        isDarkMode ? 'bg-gray-700' : 'bg-white'
                      }`}>
                        <div className={`text-xl font-bold mb-1 transition-colors duration-200 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {analyticsData.shares?.received || 0}
                        </div>
                        <div className={`text-xs font-medium transition-colors duration-200 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>SHARED BY</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup */}
      <Popup popup={popup} onClose={closePopup} />
    </div>
  );
};

export default UserProfile;