import axios from 'axios';
import { config } from './config';

// Use centralized configuration
const API_URL = config.API_URL;

// Create axios instance with increased timeout for file uploads
const axiosInstance = axios.create({
  timeout: 300000, // 5 minutes timeout for large file uploads
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Health check function
export const checkReelsApiHealth = async (): Promise<boolean> => {
  try {
    console.log('🏥 Checking reels API health...');
    const response = await axios.get(`${API_URL}/api/reels/health`, {
      headers: getAuthHeaders(),
      timeout: 5000
    });
    console.log('✅ Reels API health check passed:', response.data);
    return true;
  } catch (error: any) {
    console.error('❌ Reels API health check failed:', error.message);
    return false;
  }
};
export interface Reel {
  _id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
    isPro: boolean;
    userId?: string;
  };
  title: string;
  description?: string;
  hashtags: string[];
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  aspectRatio: string;
  music?: {
    title: string;
    artist: string;
    url: string;
    startTime: number;
  };
  effects: Array<{
    name: string;
    type: string;
    settings: any;
  }>;
  privacy: 'everyone' | 'friends' | 'private';
  category: string;
  location?: {
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  likes: string[];
  views: string[];
  reactions: Array<{
    user: string;
    type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
    createdAt: string;
  }>;
  comments: Array<{
    _id: string;
    user: {
      name: string;
      avatar: string;
      userId: string;
    };
    text: string;
    createdAt: string;
  }>;
  shares: string[];
  savedBy: string[];
  bookmarks: string[];
  isTrending: boolean;
  trendingScore: number;
  isSponsored: boolean;
  sponsorInfo?: {
    name: string;
    logo: string;
    website: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateReelData {
  title: string;
  description?: string;
  hashtags?: string[];
  duration: number;
  aspectRatio?: string;
  music?: {
    title: string;
    artist: string;
    url: string;
    startTime: number;
  };
  effects?: Array<{
    name: string;
    type: string;
    settings: any;
  }>;
  privacy?: 'everyone' | 'friends' | 'private';
  category?: string;
  location?: {
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
}

export interface ReelsResponse {
  reels: Reel[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReels: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CommentData {
  text: string;
}

// Get all reels with pagination and filtering
export const getReels = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  hashtag?: string;
  trending?: boolean;
  userId?: string;
}): Promise<ReelsResponse> => {
  const searchParams = new URLSearchParams();
  
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.category) searchParams.append('category', params.category);
  if (params?.hashtag) searchParams.append('hashtag', params.hashtag);
  if (params?.trending) searchParams.append('trending', params.trending.toString());
  if (params?.userId) searchParams.append('userId', params.userId);
  
  const response = await axios.get(`${API_URL}/api/reels?${searchParams.toString()}`, { headers: getAuthHeaders() });
  return response.data;
};

// Get trending reels
export const getTrendingReels = async (limit?: number): Promise<Reel[]> => {
  const params = limit ? `?limit=${limit}` : '';
  const response = await axios.get(`${API_URL}/api/reels/trending${params}`, { headers: getAuthHeaders() });
  return response.data;
};

// Get reels by hashtag
export const getReelsByHashtag = async (
  hashtag: string,
  page?: number,
  limit?: number
): Promise<ReelsResponse> => {
  const searchParams = new URLSearchParams();
  if (page) searchParams.append('page', page.toString());
  if (limit) searchParams.append('limit', limit.toString());
  
  const response = await axios.get(`${API_URL}/api/reels/hashtag/${hashtag}?${searchParams.toString()}`, { headers: getAuthHeaders() });
  return response.data;
};

// Get reels by user
export const getUserReels = async (
  userId: string,
  page?: number,
  limit?: number
): Promise<ReelsResponse> => {
  const searchParams = new URLSearchParams();
  if (page) searchParams.append('page', page.toString());
  if (limit) searchParams.append('limit', limit.toString());
  
  const response = await axios.get(`${API_URL}/api/reels/user/${userId}?${searchParams.toString()}`, { headers: getAuthHeaders() });
  return response.data;
};

// Get reel by ID
export const getReelById = async (id: string): Promise<Reel> => {
  const response = await axios.get(`${API_URL}/api/reels/${id}`, { headers: getAuthHeaders() });
  return response.data;
};

// Create a new reel
export const createReel = async (
  reelData: CreateReelData,
  videoFile: File
): Promise<Reel> => {
  console.log('🎬 createReel called with:', { reelData, videoFile });
  
  try {
    const formData = new FormData();
    
    // Add video file
    formData.append('video', videoFile);
    console.log('📁 Video file added to FormData:', videoFile.name, videoFile.type, videoFile.size);
    
    // Add other data
    Object.entries(reelData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'hashtags' && Array.isArray(value)) {
          formData.append(key, value.join(','));
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
        console.log(`📋 Added ${key}:`, value);
      }
    });
    
    const apiUrl = `${API_URL}/api/reels`;
    console.log('🔗 Making POST request to:', apiUrl);
    console.log('🔐 Auth headers:', getAuthHeaders());
    console.log('🌐 API_URL from config:', API_URL);
    
    // Test if the API URL is reachable
    try {
      const testResponse = await axios.get(`${API_URL}/api/reels/health`, {
        headers: getAuthHeaders(),
        timeout: 5000
      });
      console.log('✅ API health check passed:', testResponse.data);
    } catch (healthError: any) {
      console.error('❌ API health check failed:', healthError.message);
      throw new Error(`Cannot reach API server at ${API_URL}. Please check if the server is running.`);
    }
    
    const response = await axiosInstance.post(apiUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...getAuthHeaders(),
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`📤 Upload progress: ${percentCompleted}%`);
        }
      },
    });
    
    console.log('✅ API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error in createReel:', error);
    
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      throw new Error(`Network error: Cannot connect to server at ${API_URL}. Please check your internet connection and try again.`);
    } else if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Server error';
      throw new Error(`Server error (${error.response.status}): ${errorMessage}`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error(`No response from server at ${API_URL}. Please check if the server is running.`);
    } else {
      // Something else happened
      throw new Error(`Unexpected error: ${error.message}`);
    }
  }
};

// Update reel
export const updateReel = async (
  id: string,
  reelData: Partial<CreateReelData>
): Promise<Reel> => {
  const response = await axios.put(`${API_URL}/api/reels/${id}`, reelData, { headers: getAuthHeaders() });
  return response.data;
};

// Delete reel
export const deleteReel = async (id: string): Promise<{ message: string }> => {
  const response = await axios.delete(`${API_URL}/api/reels/${id}`, { headers: getAuthHeaders() });
  return response.data;
};

// Like/Unlike reel
export const toggleLike = async (id: string): Promise<{
  likes: string[];
  liked: boolean;
  trendingScore: number;
}> => {
  const response = await axios.post(`${API_URL}/api/reels/${id}/like`, {}, { headers: getAuthHeaders() });
  return response.data;
};

// Share reel
export const shareReel = async (id: string): Promise<{
  shares: string[];
  trendingScore: number;
}> => {
  const response = await axios.post(`${API_URL}/api/reels/${id}/share`, {}, { headers: getAuthHeaders() });
  return response.data;
};

// Save/Unsave reel
export const toggleSave = async (id: string): Promise<{
  saved: string[];
  isSaved: boolean;
}> => {
  const response = await axios.post(`${API_URL}/api/reels/${id}/save`, {}, { headers: getAuthHeaders() });
  return response.data;
};

// Add comment to reel
export const addComment = async (
  id: string,
  commentData: CommentData
): Promise<{
  comment: any;
  totalComments: number;
  trendingScore: number;
}> => {
  const response = await axios.post(`${API_URL}/api/reels/${id}/comment`, commentData, { headers: getAuthHeaders() });
  return response.data;
};

// Delete comment from reel
export const deleteComment = async (
  reelId: string,
  commentId: string
): Promise<{
  message: string;
  totalComments: number;
  trendingScore: number;
}> => {
  const response = await axios.delete(`${API_URL}/api/reels/${reelId}/comment/${commentId}`, { headers: getAuthHeaders() });
  return response.data;
};

// Check if user has liked a reel
export const hasUserLiked = (reel: Reel, userId?: string): boolean => {
  return userId ? reel.likes.includes(userId) : false;
};

// Check if user has saved a reel
export const hasUserSaved = (reel: Reel, userId?: string): boolean => {
  return userId ? reel.savedBy.includes(userId) : false;
};

// Check if user has viewed a reel
export const hasUserViewed = (reel: Reel, userId?: string): boolean => {
  return userId ? reel.views.includes(userId) : false;
};

// Format duration from seconds to MM:SS
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Format view count
export const formatViewCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

// Format like count
export const formatLikeCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

// Additional real API functions for reels

// Get reels by category
export const getReelsByCategory = async (
  category: string,
  page?: number,
  limit?: number
): Promise<ReelsResponse> => {
  const searchParams = new URLSearchParams();
  if (page) searchParams.append('page', page.toString());
  if (limit) searchParams.append('limit', limit.toString());
  
  const response = await axios.get(`${API_URL}/api/reels/category/${category}?${searchParams.toString()}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Get featured reels
export const getFeaturedReels = async (limit?: number): Promise<Reel[]> => {
  const params = limit ? `?limit=${limit}` : '';
  const response = await axios.get(`${API_URL}/api/reels/featured${params}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Get reels for you (personalized feed)
export const getReelsForYou = async (
  page?: number,
  limit?: number
): Promise<ReelsResponse> => {
  const searchParams = new URLSearchParams();
  if (page) searchParams.append('page', page.toString());
  if (limit) searchParams.append('limit', limit.toString());
  
  const response = await axios.get(`${API_URL}/api/reels/for-you?${searchParams.toString()}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Add view to reel
export const addView = async (id: string): Promise<{
  views: string[];
  viewCount: number;
}> => {
  const response = await axios.post(`${API_URL}/api/reels/${id}/view`, {}, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Report reel
export const reportReel = async (
  id: string,
  reason: string,
  description?: string
): Promise<{ message: string }> => {
  const response = await axios.post(`${API_URL}/api/reels/${id}/report`, {
    reason,
    description
  }, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Get reel analytics (for reel owner)
export const getReelAnalytics = async (id: string): Promise<{
  views: number;
  likes: number;
  shares: number;
  comments: number;
  engagementRate: number;
  reach: number;
  impressions: number;
}> => {
  const response = await axios.get(`${API_URL}/api/reels/${id}/analytics`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Duet with existing reel
export const createDuet = async (
  originalReelId: string,
  videoFile: File,
  duetData: Partial<CreateReelData>
): Promise<Reel> => {
  const formData = new FormData();
  
  // Add video file
  formData.append('video', videoFile);
  
  // Add duet data
  formData.append('originalReelId', originalReelId);
  
  Object.entries(duetData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === 'hashtags' && Array.isArray(value)) {
        formData.append(key, value.join(','));
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    }
  });
  
  const response = await axios.post(`${API_URL}/api/reels/duet`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...getAuthHeaders(),
    },
  });
  return response.data;
};

// Get duets for a reel
export const getDuets = async (
  reelId: string,
  page?: number,
  limit?: number
): Promise<ReelsResponse> => {
  const searchParams = new URLSearchParams();
  if (page) searchParams.append('page', page.toString());
  if (limit) searchParams.append('limit', limit.toString());
  
  const response = await axios.get(`${API_URL}/api/reels/${reelId}/duets?${searchParams.toString()}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Search reels
export const searchReels = async (
  query: string,
  page?: number,
  limit?: number,
  filters?: {
    category?: string;
    duration?: 'short' | 'medium' | 'long';
    hasMusic?: boolean;
    hasEffects?: boolean;
  }
): Promise<ReelsResponse> => {
  const searchParams = new URLSearchParams();
  searchParams.append('q', query);
  if (page) searchParams.append('page', page.toString());
  if (limit) searchParams.append('limit', limit.toString());
  if (filters?.category) searchParams.append('category', filters.category);
  if (filters?.duration) searchParams.append('duration', filters.duration);
  if (filters?.hasMusic) searchParams.append('hasMusic', filters.hasMusic.toString());
  if (filters?.hasEffects) searchParams.append('hasEffects', filters.hasEffects.toString());
  
  const response = await axios.get(`${API_URL}/api/reels/search?${searchParams.toString()}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Get reel recommendations
export const getReelRecommendations = async (
  reelId: string,
  limit?: number
): Promise<Reel[]> => {
  const params = limit ? `?limit=${limit}` : '';
  const response = await axios.get(`${API_URL}/api/reels/${reelId}/recommendations${params}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Pin reel to profile
export const pinReel = async (id: string): Promise<{ message: string }> => {
  const response = await axios.post(`${API_URL}/api/reels/${id}/pin`, {}, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Unpin reel from profile
export const unpinReel = async (id: string): Promise<{ message: string }> => {
  const response = await axios.delete(`${API_URL}/api/reels/${id}/pin`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Get pinned reels for user
export const getPinnedReels = async (userId: string): Promise<Reel[]> => {
  const response = await axios.get(`${API_URL}/api/reels/user/${userId}/pinned`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Utility functions for better error handling and processing

// Enhanced error handling wrapper
export const withErrorHandling = async <T>(
  apiCall: () => Promise<T>,
  errorMessage: string = 'An error occurred'
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error: any) {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Please login to continue');
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to perform this action');
    } else if (error.response?.status === 404) {
      throw new Error('Reel not found');
    } else if (error.response?.status === 429) {
      throw new Error('Too many requests. Please try again later');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error(errorMessage);
    }
  }
};

// Retry mechanism for failed requests
export const withRetry = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error: any) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
};

// Batch operations for multiple reels
export const batchLikeReels = async (reelIds: string[]): Promise<{
  successful: string[];
  failed: string[];
  errors: { [reelId: string]: string };
}> => {
  const results = {
    successful: [] as string[],
    failed: [] as string[],
    errors: {} as { [reelId: string]: string }
  };
  
  const promises = reelIds.map(async (reelId) => {
    try {
      await toggleLike(reelId);
      results.successful.push(reelId);
    } catch (error: any) {
      results.failed.push(reelId);
      results.errors[reelId] = error.message;
    }
  });
  
  await Promise.all(promises);
  return results;
};

export const batchSaveReels = async (reelIds: string[]): Promise<{
  successful: string[];
  failed: string[];
  errors: { [reelId: string]: string };
}> => {
  const results = {
    successful: [] as string[],
    failed: [] as string[],
    errors: {} as { [reelId: string]: string }
  };
  
  const promises = reelIds.map(async (reelId) => {
    try {
      await toggleSave(reelId);
      results.successful.push(reelId);
    } catch (error: any) {
      results.failed.push(reelId);
      results.errors[reelId] = error.message;
    }
  });
  
  await Promise.all(promises);
  return results;
};

// Cache management for reels
export const reelsCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export const getCachedReel = (key: string, ttl: number = 5 * 60 * 1000): any => {
  const cached = reelsCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  return null;
};

export const setCachedReel = (key: string, data: any, ttl: number = 5 * 60 * 1000): void => {
  reelsCache.set(key, { data, timestamp: Date.now(), ttl });
};

export const clearReelsCache = (): void => {
  reelsCache.clear();
};

// Enhanced getReels with caching
export const getReelsWithCache = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  hashtag?: string;
  trending?: boolean;
  userId?: string;
}): Promise<ReelsResponse> => {
  const cacheKey = `reels:${JSON.stringify(params)}`;
  const cached = getCachedReel(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const data = await getReels(params);
  setCachedReel(cacheKey, data);
  return data;
};

// Analytics and insights
export const getReelsInsights = async (timeframe: 'day' | 'week' | 'month' = 'week'): Promise<{
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  averageEngagement: number;
  topPerformingReel?: Reel;
  growthRate: number;
}> => {
  const response = await axios.get(`${API_URL}/api/reels/insights?timeframe=${timeframe}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};


