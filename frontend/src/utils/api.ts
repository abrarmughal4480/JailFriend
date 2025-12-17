import axios from 'axios';
import { config, getApiUrl } from './config';

// Use centralized configuration
const API_URL = config.API_URL;

export const loginApi = async (data: { email: string; password: string }) => {
  console.log('🔐 Login attempt with:', data);
  const res = await axios.post(`${API_URL}/api/auth/login`, data);
  console.log('✅ Login response:', res.data);
  return res.data;
};

export const setupUserApi = async (
  token: string,
  data: {
    avatar?: string;
    fullName?: string;
    bio?: string;
    location?: string;
    workExperience?: string;
    currentOrganisation?: string;
    aboutMeLocation?: string;
    description?: string;
    areasOfExpertise?: string[];
    audioCallPrice?: string;
    videoCallPrice?: string;
    chatPrice?: string;
    linkedInLink?: string;
    instagramLink?: string;
    twitterLink?: string;
    availableFromTime?: string;
    availableToTime?: string;
    stepNumber: number;
    skipped?: boolean;
    categoryId?: string;
  }
) => {
  console.log('API URL:', `${API_URL}/api/auth/setup`);
  console.log('Token:', token);
  console.log('Data:', data);

  const res = await axios.post(
    `${API_URL}/api/auth/setup`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return res.data;
};

export const getUserProfileApi = async (token: string) => {
  console.log('🔍 Fetching user profile from:', `${API_URL}/api/auth/profile`);
  const res = await axios.get(`${API_URL}/api/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  console.log('✅ User profile fetched:', res.data);
  return res.data;
};

export const uploadProfilePhotoApi = async (token: string, file: File) => {
  console.log('📤 Uploading profile photo...');
  const formData = new FormData();
  formData.append('avatar', file);

  const res = await axios.post(
    `${API_URL}/api/upload/profile-photo`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  console.log('✅ Profile photo uploaded:', res.data);
  return res.data;
};

// Album API functions
export const getUserAlbumsApi = async (token: string) => {
  const res = await axios.get(`${API_URL}/api/albums/user`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const createAlbumApi = async (token: string, albumData: FormData) => {
  const res = await axios.post(`${API_URL}/api/albums`, albumData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
};

export const deleteAlbumApi = async (token: string, albumId: string) => {
  const res = await axios.delete(`${API_URL}/api/albums/${albumId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const editAlbumApi = async (token: string, albumId: string, albumData: FormData) => {
  const res = await axios.put(`${API_URL}/api/albums/${albumId}`, albumData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
};

// Additional album interaction APIs
export const likeAlbumApi = async (token: string, albumId: string) => {
  const res = await axios.post(`${API_URL}/api/albums/${albumId}/like`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const shareAlbumApi = async (token: string, albumId: string) => {
  const res = await axios.post(`${API_URL}/api/albums/${albumId}/share`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const saveAlbumApi = async (token: string, albumId: string) => {
  const res = await axios.post(`${API_URL}/api/albums/${albumId}/save`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const addCommentApi = async (token: string, albumId: string, comment: string) => {
  const res = await axios.post(`${API_URL}/api/albums/${albumId}/comment`, { text: comment }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const deleteCommentApi = async (token: string, albumId: string, commentId: string) => {
  const res = await axios.delete(`${API_URL}/api/albums/${albumId}/comment/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Post Save API functions
export const savePostApi = async (token: string, postId: string) => {
  const res = await axios.post(`${API_URL}/api/posts/${postId}/save`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getSavedPostsApi = async (token: string, page: number = 1, limit: number = 10) => {
  const res = await axios.get(`${API_URL}/api/posts/saved?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const checkPostSavedApi = async (token: string, postId: string) => {
  const res = await axios.get(`${API_URL}/api/posts/${postId}/saved-status`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Post management API functions
export const toggleCommentsApi = async (token: string, postId: string) => {
  const res = await axios.post(`${API_URL}/api/posts/${postId}/toggle-comments`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const pinPostApi = async (token: string, postId: string) => {
  const res = await axios.post(`${API_URL}/api/posts/${postId}/pin`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const boostPostApi = async (token: string, postId: string) => {
  const res = await axios.post(`${API_URL}/api/posts/${postId}/boost`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getSavedAlbumsApi = async (token: string) => {
  const res = await axios.get(`${API_URL}/api/albums/saved`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getAllAlbumsApi = async () => {
  const res = await axios.get(`${API_URL}/api/albums`);
  return res.data;
};

// Explore Page APIs
export const searchUsersApi = async (token: string, query?: string) => {
  const params = query ? `?q=${encodeURIComponent(query)}` : '';
  console.log('🔍 Searching users with API URL:', `${API_URL}/api/users/search${params}`);
  const res = await axios.get(`${API_URL}/api/users/search${params}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('🔍 Search users response:', res.data);
  return res.data;
};

export const getSuggestedUsersApi = async (token: string) => {
  console.log('🔍 Getting suggested users with API URL:', `${API_URL}/api/users/suggested`);
  const res = await axios.get(`${API_URL}/api/users/suggested`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('🔍 Suggested users response:', res.data);
  return res.data;
};

export const followUserApi = async (token: string, userId: string) => {
  const res = await axios.post(`${API_URL}/api/users/${userId}/follow`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getPagesApi = async (token?: string) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.get(`${API_URL}/api/pages`, { headers });
  return res.data;
};

export const likePageApi = async (token: string, pageId: string) => {
  const res = await axios.post(`${API_URL}/api/pages/${pageId}/like`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getPublicGroupsApi = async (token?: string) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.get(`${API_URL}/api/groups/public`, { headers });
  return res.data;
};

export const joinGroupApi = async (token: string, groupId: string) => {
  const res = await axios.post(`${API_URL}/api/groups/${groupId}/join`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const searchGroupsApi = async (token: string, query: string) => {
  const res = await axios.get(`${API_URL}/api/groups/search?q=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// New Post Type API Functions

// Poll APIs
export const addPollVoteApi = async (token: string, postId: string, optionIndex: number) => {
  const res = await axios.post(`${API_URL}/api/posts/${postId}/poll/vote`, { optionIndex }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const removePollVoteApi = async (token: string, postId: string, optionIndex: number) => {
  const res = await axios.delete(`${API_URL}/api/posts/${postId}/poll/vote`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { optionIndex }
  });
  return res.data;
};

// Get posts by type
export const getPostsByTypeApi = async (token: string, postType: string, page: number = 1, limit: number = 20) => {
  const res = await axios.get(`${API_URL}/api/posts/type/${postType}?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Get posts with specific features
export const getPostsWithFeelingsApi = async (token: string, feelingType?: string, page: number = 1, limit: number = 20) => {
  const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
  if (feelingType) params.append('feelingType', feelingType);

  const res = await axios.get(`${API_URL}/api/posts/feelings?${params}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getPostsWithPollsApi = async (token: string, page: number = 1, limit: number = 20) => {
  const res = await axios.get(`${API_URL}/api/posts/polls?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getPostsWithLocationApi = async (token: string, page: number = 1, limit: number = 20) => {
  const res = await axios.get(`${API_URL}/api/posts/location?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getPostsWithSellApi = async (token: string, page: number = 1, limit: number = 20) => {
  const res = await axios.get(`${API_URL}/api/posts/sell?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getPostsWithAudioApi = async (token: string, page: number = 1, limit: number = 20) => {
  const res = await axios.get(`${API_URL}/api/posts/audio?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getPostsWithVoiceApi = async (token: string, page: number = 1, limit: number = 20) => {
  const res = await axios.get(`${API_URL}/api/posts/voice?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getPostsWithFilesApi = async (token: string, page: number = 1, limit: number = 20) => {
  const res = await axios.get(`${API_URL}/api/posts/files?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getPostsWithGifsApi = async (token: string, page: number = 1, limit: number = 20) => {
  const res = await axios.get(`${API_URL}/api/posts/gifs?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// File Management APIs
export const uploadFileApi = async (token: string, file: File, postId?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  if (postId) formData.append('postId', postId);

  const res = await axios.post(`${API_URL}/api/files/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
};

export const uploadMultipleFilesApi = async (token: string, files: File[], postId?: string) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  if (postId) formData.append('postId', postId);

  const res = await axios.post(`${API_URL}/api/files/upload-multiple`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
};

export const getFileApi = async (fileId: string) => {
  const res = await axios.get(`${API_URL}/api/files/${fileId}`);
  return res.data;
};

export const downloadFileApi = async (token: string, fileId: string) => {
  const res = await axios.post(`${API_URL}/api/files/${fileId}/download`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const deleteFileApi = async (token: string, fileId: string) => {
  const res = await axios.delete(`${API_URL}/api/files/${fileId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getFilesByPostApi = async (postId: string) => {
  const res = await axios.get(`${API_URL}/api/files/post/${postId}`);
  return res.data;
};

export const getUserFilesApi = async (token: string, page: number = 1, limit: number = 20) => {
  const res = await axios.get(`${API_URL}/api/files/user/files?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// GIPHY API for real GIFs (you'll need to add GIPHY API key to your environment)
export const searchGifsApi = async (query: string, limit: number = 20) => {
  // This would use GIPHY API - you'll need to add GIPHY_API_KEY to your .env
  const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY;
  if (!GIPHY_API_KEY) {
    throw new Error('GIPHY API key not configured');
  }

  const GIPHY_BASE_URL = process.env.NEXT_PUBLIC_GIPHY_BASE_URL || 'https://api.giphy.com/v1/gifs';
  const res = await axios.get(`${GIPHY_BASE_URL}/search`, {
    params: {
      api_key: GIPHY_API_KEY,
      q: query,
      limit: limit,
      rating: 'g'
    }
  });
  return res.data;
};

export const getTrendingGifsApi = async (limit: number = 20) => {
  const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY;
  if (!GIPHY_API_KEY) {
    throw new Error('GIPHY API key not configured');
  }

  const GIPHY_BASE_URL = process.env.NEXT_PUBLIC_GIPHY_BASE_URL || 'https://api.giphy.com/v1/gifs';
  const res = await axios.get(`${GIPHY_BASE_URL}/trending`, {
    params: {
      api_key: GIPHY_API_KEY,
      limit: limit,
      rating: 'g'
    }
  });
  return res.data;
};

// Audio Call API functions
export const initiateCallApi = async (token: string, receiverId: string, callType: string = 'audio') => {
  const res = await axios.post(`${API_URL}/api/audio-calls/initiate`, {
    receiverId,
    callType
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const acceptCallApi = async (token: string, callId: string) => {
  const res = await axios.post(`${API_URL}/api/audio-calls/${callId}/accept`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const rejectCallApi = async (token: string, callId: string, reason?: string) => {
  const res = await axios.post(`${API_URL}/api/audio-calls/${callId}/reject`, { reason }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const endCallApi = async (token: string, callId: string) => {
  const res = await axios.post(`${API_URL}/api/audio-calls/${callId}/end`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const cancelCallApi = async (token: string, callId: string) => {
  const res = await axios.post(`${API_URL}/api/audio-calls/${callId}/cancel`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getCallHistoryApi = async (token: string, page: number = 1, limit: number = 20) => {
  const res = await axios.get(`${API_URL}/api/audio-calls/history?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getActiveCallsApi = async (token: string) => {
  const res = await axios.get(`${API_URL}/api/audio-calls/active`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getCallStatsApi = async (token: string, days: number = 30) => {
  const res = await axios.get(`${API_URL}/api/audio-calls/stats?days=${days}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const updateCallQualityApi = async (token: string, callId: string, audioLevel?: number, connectionQuality?: string) => {
  const res = await axios.put(`${API_URL}/api/audio-calls/${callId}/quality`, {
    audioLevel,
    connectionQuality
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const cleanupOldCallsApi = async (token: string) => {
  const res = await axios.post(`${API_URL}/api/audio-calls/cleanup`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getVideoCallDetailsApi = async (token: string, callId: string) => {
  const res = await axios.get(`${API_URL}/api/video-calls/${callId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};
