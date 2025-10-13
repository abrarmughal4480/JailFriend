"use client";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Camera, Edit, Search, Video, Image, Plus, Heart, MessageCircle, Share2, Users, FileText, X, ChevronDown, UserPlus, Globe2, Users2, Car, File, Smile, Hash, AtSign, Link, Upload, MapPin, Calendar, ThumbsUp, MoreHorizontal, Bookmark, Flag, Bell, BellOff } from 'lucide-react';
import { getCurrentUserId, getCurrentUser } from '@/utils/auth';

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
  location?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Post {
  _id: string;
  content: string;
  media?: Array<{
    url: string;
    type: string;
    thumbnail?: string;
    originalName?: string;
  }>;
  createdAt: string;
  user: {
    userId: string;
    name: string;
    avatar?: string;
  };
  likes?: string[];
  comments?: any[];
  shares?: string[];
  files?: Array<{
    name: string;
    type: string;
    url: string;
  }>;
}

const GroupPage: React.FC = () => {
  const { groupId } = useParams();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Home');
  const [newPostContent, setNewPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [postType, setPostType] = useState('All');
  const [showPostModal, setShowPostModal] = useState(false);
  const [postPrivacy, setPostPrivacy] = useState('public');
  const [selectedMedia, setSelectedMedia] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>('');
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Additional state variables for post creation features
  const [showAudioUpload, setShowAudioUpload] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showFeelingsPicker, setShowFeelingsPicker] = useState(false);
  const [showSellForm, setShowSellForm] = useState(false);
  const [showPollForm, setShowPollForm] = useState(false);
  const [showHashtagInput, setShowHashtagInput] = useState(false);
  const [showMentionInput, setShowMentionInput] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);
  const [selectedGif, setSelectedGif] = useState<string>('');
  const [voiceRecording, setVoiceRecording] = useState<string>('');
  const [selectedFeeling, setSelectedFeeling] = useState<string>('');
  const [sellData, setSellData] = useState({ title: '', price: '', description: '' });
  const [pollData, setPollData] = useState({ question: '', options: ['', ''] });
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [mentions, setMentions] = useState<string[]>([]);
  const [selectedEmoji, setSelectedEmoji] = useState<string>('');

  const userId = getCurrentUserId();

  // Get current user
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  // Fetch group data
  const fetchGroup = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) return;

  const response = await fetch(`${API_URL}/api/groups/${groupId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const groupData = await response.json();
        setGroup(groupData);
      }
    } catch (error) {
      console.error('Error fetching group:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch group posts
  const fetchGroupPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return;

  const response = await fetch(`${API_URL}/api/groups/${groupId}/posts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const postsData = await response.json();
        setPosts(postsData);
      }
    } catch (error) {
      console.error('Error fetching group posts:', error);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchGroup();
      fetchGroupPosts();
    }
  }, [groupId]);

  // Handle post creation
  const handleCreatePost = async () => {
    if (!newPostContent.trim() && selectedMedia.length === 0) return;

    try {
      setPosting(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please log in to create a post');
        return;
      }

      const formData = new FormData();
      formData.append('content', newPostContent);
      formData.append('groupId', groupId as string);
      formData.append('privacy', postPrivacy);
      
      if (selectedLocation) {
        formData.append('location', selectedLocation);
      }
      
      if (selectedTags.length > 0) {
        formData.append('tags', JSON.stringify(selectedTags));
      }
      
      selectedMedia.forEach((file) => {
        formData.append('media', file);
      });

  const response = await fetch(`${API_URL}/api/groups/${groupId}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const newPost = await response.json();
        setPosts(prev => [newPost, ...prev]);
        setNewPostContent('');
        setSelectedMedia([]);
        setSelectedLocation('');
        setSelectedTags([]);
        setShowPostModal(false);
        alert('Post created successfully!');
        // Refresh posts to get the latest count
        fetchGroupPosts();
      } else {
        alert('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating post');
    } finally {
      setPosting(false);
    }
  };

  // Handle media selection
  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedMedia(prev => [...prev, ...files]);
  };

  // Handle tag input
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      if (!selectedTags.includes(tagInput.trim())) {
        setSelectedTags(prev => [...prev, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  // Remove media
  const removeMedia = (index: number) => {
    setSelectedMedia(prev => prev.filter((_, i) => i !== index));
  };

  // Handle profile image upload
  const handleProfileImageUpload = async () => {
    if (!profileImage) return;

    setUploadingProfile(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      // First upload the image to get the URL
      const formData = new FormData();
      formData.append('postMedia', profileImage);

  const uploadResponse = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        const errData = await uploadResponse.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || 'Failed to upload image');
      }

      const uploadData = await uploadResponse.json();
      console.log('📤 Upload response:', uploadData);
      console.log('📤 Media array:', uploadData.media);
      const imageUrl = uploadData.media[0].url;
      console.log('📤 Image URL:', imageUrl);

      // Now update the group with the new profile image
      console.log('🔄 Updating group with image URL:', imageUrl);
  const updateResponse = await fetch(`${API_URL}/api/groups/${groupId}/images`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          avatar: imageUrl
        })
      });

      if (updateResponse.ok) {
        const updatedGroup = await updateResponse.json();
        setGroup(updatedGroup.group);
        setProfileImage(null);
        if (profilePreview) {
          URL.revokeObjectURL(profilePreview);
        }
        setProfilePreview('');
        alert('Profile image updated successfully!');
      } else {
        const errData = await updateResponse.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || 'Failed to update group');
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      alert('Error updating profile image: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploadingProfile(false);
    }
  };

  // Handle cover image upload
  const handleCoverImageUpload = async () => {
    if (!coverImage) return;

    setUploadingCover(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      // First upload the image to get the URL
      const formData = new FormData();
      formData.append('postMedia', coverImage);

  const uploadResponse = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        const errData = await uploadResponse.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || 'Failed to upload image');
      }

      const uploadData = await uploadResponse.json();
      console.log('📤 Upload response:', uploadData);
      console.log('📤 Media array:', uploadData.media);
      const imageUrl = uploadData.media[0].url;
      console.log('📤 Image URL:', imageUrl);

      // Now update the group with the new cover image
      console.log('🔄 Updating group with cover image URL:', imageUrl);
  const updateResponse = await fetch(`${API_URL}/api/groups/${groupId}/images`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          coverPhoto: imageUrl
        })
      });

      if (updateResponse.ok) {
        const updatedGroup = await updateResponse.json();
        setGroup(updatedGroup.group);
        setCoverImage(null);
        if (coverPreview) {
          URL.revokeObjectURL(coverPreview);
        }
        setCoverPreview('');
        alert('Cover image updated successfully!');
      } else {
        const errData = await updateResponse.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || 'Failed to update group');
      }
    } catch (error) {
      console.error('Error updating cover image:', error);
      alert('Error updating cover image: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploadingCover(false);
    }
  };

  // Handle profile image change
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      if (profilePreview) {
        URL.revokeObjectURL(profilePreview);
      }
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  // Handle cover image change
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Handle audio file selection
  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setSelectedAudio(file);
      setShowAudioUpload(false);
    }
  };

  // Handle document file selection
  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedDocuments(prev => [...prev, ...files]);
    setShowFileUpload(false);
  };

  // Handle GIF selection
  const handleGifSelect = (gifUrl: string) => {
    setSelectedGif(gifUrl);
    setShowGifPicker(false);
  };

  // Handle voice recording
  const handleVoiceRecording = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          // Simple voice recording implementation
          setVoiceRecording('Voice recording added');
          setShowVoiceRecorder(false);
        })
        .catch(err => {
          console.error('Error accessing microphone:', err);
          alert('Unable to access microphone');
        });
    } else {
      alert('Voice recording not supported in this browser');
    }
  };

  // Handle feeling selection
  const handleFeelingSelect = (feeling: string) => {
    setSelectedFeeling(feeling);
    setShowFeelingsPicker(false);
  };

  // Handle sell form submission
  const handleSellSubmit = () => {
    if (sellData.title && sellData.price) {
      setNewPostContent(prev => prev + `\n\n🛒 For Sale: ${sellData.title}\n💰 Price: $${sellData.price}\n📝 ${sellData.description}`);
      setShowSellForm(false);
      setSellData({ title: '', price: '', description: '' });
    }
  };

  // Handle poll form submission
  const handlePollSubmit = () => {
    if (pollData.question && pollData.options[0] && pollData.options[1]) {
      setNewPostContent(prev => prev + `\n\n📊 Poll: ${pollData.question}\n${pollData.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}`);
      setShowPollForm(false);
      setPollData({ question: '', options: ['', ''] });
    }
  };

  // Handle hashtag input
  const handleHashtagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      const hashtag = e.currentTarget.value.trim();
      if (!hashtags.includes(hashtag)) {
        setHashtags(prev => [...prev, hashtag]);
      }
      e.currentTarget.value = '';
    }
  };

  // Handle mention input
  const handleMentionInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      const mention = e.currentTarget.value.trim();
      if (!mentions.includes(mention)) {
        setMentions(prev => [...prev, mention]);
      }
      e.currentTarget.value = '';
    }
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    setNewPostContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Group not found</h2>
          <button
            onClick={() => router.push('/dashboard/groups')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Photo Section */}
      <div className="relative h-64 sm:h-80 bg-gradient-to-br from-purple-400 to-pink-400">
        {(coverPreview || group.coverPhoto) ? (
          <img
            src={coverPreview || group.coverPhoto}
            alt={`${group.name} cover`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
            <div className="text-white text-center">
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No cover photo</p>
            </div>
          </div>
        )}
        
        <div className="absolute bottom-4 right-4 flex gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverImageChange}
            className="hidden"
            id="cover-image-upload"
          />
          <label
            htmlFor="cover-image-upload"
            className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 cursor-pointer transition-colors"
          >
          <Camera className="w-4 h-4" />
          Cover
          </label>
          {coverImage && (
            <button
              onClick={handleCoverImageUpload}
              disabled={uploadingCover}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {uploadingCover ? 'Uploading...' : 'Save'}
        </button>
          )}
        </div>
      </div>

      {/* Group Info Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-6">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
              {(profilePreview || group.avatar) ? (
                <img
                  src={profilePreview || group.avatar}
                  alt={`${group.name} avatar`}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <Camera className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="hidden"
                id="profile-image-upload"
              />
              <label
                htmlFor="profile-image-upload"
                className="absolute bottom-0 right-0 bg-gray-600 text-white p-2 rounded-full hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <Camera className="w-4 h-4" />
              </label>
              {profileImage && (
                <button
                  onClick={handleProfileImageUpload}
                  disabled={uploadingProfile}
                  className="absolute top-0 right-0 bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 disabled:opacity-50 text-xs transition-colors"
                >
                  {uploadingProfile ? 'Saving...' : 'Save'}
                </button>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{group.name}</h1>
              <p className="text-gray-600 mb-2">
                {group.members.length} Member{group.members.length !== 1 ? 's' : ''}
                {group.members.length > 0 && (
                  <span className="ml-2 text-green-500 text-sm">
                    • {group.members.filter(m => m.isActive).length} Active
                  </span>
                )}
                <span className="ml-2 text-blue-500 text-sm">
                  • {posts.length} Posts
                </span>
              </p>
              <p className="text-gray-700 text-sm">{group.description}</p>
            </div>

            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 pb-4">
            {['Home', 'Members', 'Invite'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-red-500 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'Home' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Post Creation and Feed */}
          <div className="lg:col-span-2 space-y-6">
                          {/* Post Creation Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              {/* Post Creation Input */}
              <div className="flex items-start gap-3">
                {/* User Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 flex-shrink-0">
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name || 'Your avatar'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Post Input Field */}
                <div className="flex-1 relative">
                  <div
                    onClick={() => setShowPostModal(true)}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors text-gray-500 hover:text-gray-700 min-h-[60px] flex items-center"
                  >
                    Click to create a new post...
                  </div>
                  
                  {/* Camera Icon */}
                  <div className="absolute top-3 right-3">
                <button
                  onClick={() => setShowPostModal(true)}
                      className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                      <Camera className="w-5 h-5" />
                </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Post Type Filters */}
            <div className="flex space-x-2 overflow-x-auto">
              {['All', 'Text', 'Photos', 'Videos', 'Sounds', 'Files'].map((type) => (
                <button
                  key={type}
                  onClick={() => setPostType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    postType === type
                      ? 'bg-red-500 text-white'
                      : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Posts Feed */}
            {posts.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-500 mb-4">Be the first to share something in this group!</p>
                <button
                  onClick={() => setShowPostModal(true)}
                  className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Create First Post
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post._id} className="bg-white rounded-xl border border-gray-200 p-4">
                    {/* Post Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100">
                        {post.user?.avatar ? (
                          <img
                            src={post.user.avatar}
                            alt={post.user.name || 'User avatar'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {post.user?.name ? post.user.name.charAt(0).toUpperCase() : 'U'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{post.user?.name || 'Unknown User'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()} • {new Date(post.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="mb-3">
                      <div 
                        className="text-gray-900 text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                      />
                    </div>

                    {/* Post Media */}
                    {post.media && post.media.length > 0 && (
                      <div className="mb-3">
                        {post.media.map((media, index) => (
                          <div key={index} className="mb-2">
                            {media.type === 'image' && (
                              <img
                                src={media.url}
                                alt={`Media ${index + 1}`}
                                className="w-full max-h-96 object-cover rounded-lg"
                              />
                            )}
                            {media.type === 'video' && (
                              <video
                                src={media.url}
                                controls
                                className="w-full max-h-96 rounded-lg"
                              />
                            )}
                            {media.type === 'audio' && (
                              <audio
                                src={media.url}
                                controls
                                className="w-full"
                              />
                            )}
                            {media.type === 'file' && (
                              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <FileText className="w-8 h-8 text-blue-600" />
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 text-sm">{media.originalName || 'File'}</p>
                                  <p className="text-xs text-gray-500">{media.type}</p>
                                </div>
                                <a
                                  href={media.url}
                                  download
                                  className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                                >
                                  Download
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                      <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">{post.likes?.length || 0}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">{post.comments?.length || 0}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors">
                        <Share2 className="w-4 h-4" />
                        <span className="text-sm">{post.shares?.length || 0}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Search */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for posts"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Group Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="space-y-4">
                <button className="w-full flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                  <UserPlus className="w-5 h-5" />
                  Add your friends to this group
                </button>
                
                <div className="flex items-center gap-3 text-gray-600">
                  <Globe2 className="w-5 h-5" />
                  <span className="capitalize">{group.privacy}</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-600">
                  <Users2 className="w-5 h-5" />
                  <span>{group.members.length} Members</span>
                  <span className="text-green-500 text-sm">+1 This week</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-600">
                  <Car className="w-5 h-5" />
                  <span className="capitalize">{group.category}</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-600">
                  <File className="w-5 h-5" />
                  <span>{posts.length} posts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'Members' && (
          <div className="space-y-6">
            {/* Members Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <Users2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Members</h2>
              <span className="text-gray-500 text-lg">({group.members.length})</span>
            </div>

            {/* Members Search */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

                        {/* Members Grid */}
            {(() => {
              const filteredMembers = group.members.filter(member => 
                member.user.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                member.user.username?.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                member.role.toLowerCase().includes(memberSearchQuery.toLowerCase())
              );

              if (filteredMembers.length === 0 && memberSearchQuery.trim()) {
                return (
                  <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
                    <p className="text-gray-500 mb-4">Try adjusting your search terms.</p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredMembers.map((member, index) => (
                    <div key={member.user._id || index} className="bg-white rounded-lg border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
                      <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-pink-100 to-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                        {member.user.avatar ? (
                          <img
                            src={member.user.avatar}
                            alt={member.user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {member.user.name ? member.user.name.charAt(0).toUpperCase() : 'U'}
                            </span>
                          </div>
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900 text-sm mb-1">{member.user.name}</h3>
                      <div className="flex items-center justify-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          member.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700' 
                            : member.role === 'moderator'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </span>
                        {member.isActive && (
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Empty State for Members */}
            {group.members.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users2 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No members yet</h3>
                <p className="text-gray-500 mb-4">This group doesn't have any members yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Invite' && (
          <div className="space-y-6">
            {/* Invite Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Invite Friends</h2>
            </div>

            {/* Invite Content */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Invite functionality coming soon!</h3>
              <p className="text-gray-500 mb-4">You'll be able to invite friends to this group soon.</p>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setShowPostModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 flex items-center justify-center group"
      >
        <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Post Creation Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[calc(100vh-140px)] overflow-y-auto">
            <div className="p-4">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setShowPostModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">1800</span>
                  <button
                    onClick={handleCreatePost}
                    disabled={posting || (!newPostContent.trim() && selectedMedia.length === 0)}
                    className="bg-pink-500 text-white px-4 py-1.5 rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    {posting ? 'Posting...' : 'Share'}
                  </button>
                </div>
              </div>

              {/* Post Content */}
              <div className="space-y-3">
                {/* User Info */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {group.avatar ? (
                      <img
                        src={group.avatar}
                        alt={`${group.name} avatar`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Posting in {group.name}</p>
                    <p className="text-xs text-gray-500">Group</p>
                  </div>
                </div>

                {/* Post Input */}
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="What's happening?"
                  className="w-full p-3 border-0 focus:outline-none focus:ring-0 resize-none text-base"
                  rows={3}
                />

                {/* Privacy Settings */}
                <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg">
                  <Globe2 className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-600">{postPrivacy === 'public' ? 'Everyone' : postPrivacy === 'friends' ? 'Friends' : 'Private'}</span>
                  <ChevronDown className="w-3 h-3 text-gray-500 ml-auto" />
                </div>

                {/* Selected Media Preview */}
                {selectedMedia.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Selected Media:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedMedia.map((file, index) => (
                        <div key={index} className="relative">
                          {file.type.startsWith('image/') ? (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Media ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                              <File className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <button
                            onClick={() => removeMedia(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Audio */}
                {selectedAudio && (
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600">♪</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{selectedAudio.name}</p>
                      <p className="text-xs text-gray-500">Audio file</p>
                    </div>
                    <button
                      onClick={() => setSelectedAudio(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Selected Documents */}
                {selectedDocuments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Selected Documents:</p>
                    <div className="space-y-2">
                      {selectedDocuments.map((file, index) => (
                        <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <button
                            onClick={() => setSelectedDocuments(prev => prev.filter((_, i) => i !== index))}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected GIF */}
                {selectedGif && (
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <div className="text-2xl">{selectedGif}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Selected GIF</p>
                    </div>
                    <button
                      onClick={() => setSelectedGif('')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Selected Feeling */}
                {selectedFeeling && (
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <div className="text-2xl">{selectedFeeling}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Feeling</p>
                    </div>
                    <button
                      onClick={() => setSelectedFeeling('')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Selected Tags */}
                {selectedTags.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          #{tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="hover:text-blue-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Location */}
                {selectedLocation && (
                  <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{selectedLocation}</span>
                    <button
                      onClick={() => setSelectedLocation('')}
                      className="ml-auto text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Content Options Grid */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100">
                {/* Images */}
                  <input
                    type="file"
                    multiple
                  accept="image/*"
                    onChange={handleMediaSelect}
                    className="hidden"
                    id="media-upload"
                  />
                  <label
                    htmlFor="media-upload"
                  className="flex flex-col items-center gap-1 p-2 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors group"
                  >
                  <Camera className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                  <span className="text-xs text-gray-700">Images</span>
                  </label>

                {/* Audio */}
                <div className="flex flex-col items-center gap-1 p-2 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors group">
                  <div className="w-4 h-4 text-gray-600 group-hover:text-blue-600">♪</div>
                  <span className="text-xs text-gray-700">Audio</span>
                </div>

                {/* Files */}
                <div className="flex flex-col items-center gap-1 p-2 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors group">
                  <FileText className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                  <span className="text-xs text-gray-700">Files</span>
                </div>

                {/* GIF */}
                <div className="flex flex-col items-center gap-1 p-2 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors group">
                  <div className="w-4 h-4 text-gray-600 group-hover:text-blue-600">🎭</div>
                  <span className="text-xs text-gray-700">GIF</span>
                </div>

                {/* Voice */}
                <div className="flex flex-col items-center gap-1 p-2 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors group">
                  <div className="w-4 h-4 text-gray-600 group-hover:text-blue-600">🎤</div>
                  <span className="text-xs text-gray-700">Voice</span>
                </div>

                {/* Feelings */}
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="flex flex-col items-center gap-1 p-2 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors group"
                >
                  <Smile className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                  <span className="text-xs text-gray-700">Feelings</span>
                </button>

                {/* Sell */}
                <div className="flex flex-col items-center gap-1 p-2 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors group">
                  <div className="w-4 h-4 text-gray-600 group-hover:text-blue-600">🛒</div>
                  <span className="text-xs text-gray-700">Sell</span>
                </div>

                {/* Poll */}
                <div className="flex flex-col items-center gap-1 p-2 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors group">
                  <div className="w-4 h-4 text-gray-600 group-hover:text-blue-600">📊</div>
                  <span className="text-xs text-gray-700">Poll</span>
                </div>

                  {/* Location */}
                  <button
                    onClick={() => setShowLocationPicker(!showLocationPicker)}
                  className="flex flex-col items-center gap-1 p-2 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors group"
                  >
                  <MapPin className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                  <span className="text-xs text-gray-700">Location</span>
                  </button>
              </div>

              {/* Additional Features Section */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  {/* Hashtag */}
                  <button
                    onClick={() => setShowHashtagInput(!showHashtagInput)}
                    className="flex items-center gap-1 p-1.5 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <Hash className="w-4 h-4" />
                    <span className="text-xs">Hashtag</span>
                  </button>

                  {/* Mention */}
                  <button
                    onClick={() => setShowMentionInput(!showMentionInput)}
                    className="flex items-center gap-1 p-1.5 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <AtSign className="w-4 h-4" />
                    <span className="text-xs">Mention</span>
                  </button>

                  {/* Emoji */}
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="flex items-center gap-1 p-1.5 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <Smile className="w-4 h-4" />
                    <span className="text-xs">Emoji</span>
                  </button>
                </div>
              </div>

              {/* Location Picker */}
              {showLocationPicker && (
                <div className="mt-3 p-2 border border-gray-200 rounded-lg">
                  <input
                    type="text"
                    placeholder="Enter location..."
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full p-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              )}

              {/* Tag Input */}
              {showTagInput && (
                <div className="mt-3 p-2 border border-gray-200 rounded-lg">
                  <input
                    type="text"
                    placeholder="Type tag and press Enter..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagInput}
                    className="w-full p-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              )}

              {/* Hashtag Input */}
              {showHashtagInput && (
                <div className="mt-3 p-2 border border-gray-200 rounded-lg">
                  <input
                    type="text"
                    placeholder="Type hashtag and press Enter..."
                    onKeyPress={handleHashtagInput}
                    className="w-full p-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  {hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {hashtags.map((hashtag, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                        >
                          #{hashtag}
                          <button
                            onClick={() => setHashtags(prev => prev.filter(h => h !== hashtag))}
                            className="hover:text-blue-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Mention Input */}
              {showMentionInput && (
                <div className="mt-3 p-2 border border-gray-200 rounded-lg">
                  <input
                    type="text"
                    placeholder="Type @username and press Enter..."
                    onKeyPress={handleMentionInput}
                    className="w-full p-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  {mentions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {mentions.map((mention, index) => (
                        <span
                          key={index}
                          className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                        >
                          @{mention}
                          <button
                            onClick={() => setMentions(prev => prev.filter(m => m !== mention))}
                            className="hover:text-green-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* GIF Picker */}
              {showGifPicker && (
                <div className="mt-3 p-2 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-3 gap-2">
                    {['🎭', '😂', '😍', '🤔', '👏', '🔥', '💯', '✨', '🎉', '❤️', '👍', '🎵'].map((gif, index) => (
                      <button
                        key={index}
                        onClick={() => handleGifSelect(gif)}
                        className="text-2xl p-2 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        {gif}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Voice Recorder */}
              {showVoiceRecorder && (
                <div className="mt-3 p-2 border border-gray-200 rounded-lg">
                  <button
                    onClick={handleVoiceRecording}
                    className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                    Start Recording
                  </button>
                  {voiceRecording && (
                    <p className="text-sm text-gray-600 mt-2 text-center">{voiceRecording}</p>
                  )}
                </div>
              )}

              {/* Feelings Picker */}
              {showFeelingsPicker && (
                <div className="mt-3 p-2 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-4 gap-2">
                    {['😊', '😢', '😡', '😴', '🤗', '😎', '🤩', '😭'].map((feeling, index) => (
                      <button
                        key={index}
                        onClick={() => handleFeelingSelect(feeling)}
                        className="text-2xl p-2 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        {feeling}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sell Form */}
              {showSellForm && (
                <div className="mt-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-3">Create Sale Post</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Item title"
                      value={sellData.title}
                      onChange={(e) => setSellData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Price"
                      value={sellData.price}
                      onChange={(e) => setSellData(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                    />
                    <textarea
                      placeholder="Description"
                      value={sellData.description}
                      onChange={(e) => setSellData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-2 border border-gray-200 rounded-lg text-sm resize-none"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSellSubmit}
                        className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        Add to Post
                      </button>
                      <button
                        onClick={() => setShowSellForm(false)}
                        className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Poll Form */}
              {showPollForm && (
                <div className="mt-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-3">Create Poll</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Poll question"
                      value={pollData.question}
                      onChange={(e) => setPollData(prev => ({ ...prev, question: e.target.value }))}
                      className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                    />
                    {pollData.options.map((option, index) => (
                      <input
                        key={index}
                        type="text"
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => setPollData(prev => ({
                          ...prev,
                          options: prev.options.map((opt, i) => i === index ? e.target.value : opt)
                        }))}
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                      />
                    ))}
                    <div className="flex gap-2">
                      <button
                        onClick={handlePollSubmit}
                        className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        Add to Post
                      </button>
                      <button
                        onClick={() => setShowPollForm(false)}
                        className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="mt-3 p-2 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-6 gap-2">
                    {['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧', '😮', '😲', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠'].slice(0, 36).map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => handleEmojiSelect(emoji)}
                        className="text-xl p-1 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupPage;
