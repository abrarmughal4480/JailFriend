import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Create a new story
export const createStoryApi = async (formData: FormData) => {
  try {
    const response = await axios.post(`${API_URL}/api/stories`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create story');
  }
};

// Get all active stories for feed
export const getFeedStoriesApi = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/stories/feed`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get stories');
  }
};

// Get stories by specific user
export const getUserStoriesApi = async (userId: string) => {
  try {
    const response = await axios.get(`${API_URL}/api/stories/user/${userId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get user stories');
  }
};

// View a story (increment view count)
export const viewStoryApi = async (storyId: string) => {
  try {
    const response = await axios.post(`${API_URL}/api/stories/${storyId}/view`, {}, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to view story');
  }
};

// React to a story
export const reactToStoryApi = async (storyId: string, reactionType: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/stories/${storyId}/react`,
      { reactionType },
      { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to react to story');
  }
};

// Reply to a story
export const replyToStoryApi = async (storyId: string, content: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/stories/${storyId}/reply`,
      { content },
      { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to reply to story');
  }
};

// Delete a story
export const deleteStoryApi = async (storyId: string) => {
  try {
    const response = await axios.delete(`${API_URL}/api/stories/${storyId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete story');
  }
};

// Get story statistics
export const getStoryStatsApi = async (storyId: string) => {
  try {
    const response = await axios.get(`${API_URL}/api/stories/${storyId}/stats`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get story stats');
  }
};

// Utility function to check if story is expired
export const isStoryExpired = (expiresAt: string | Date): boolean => {
  const expirationDate = new Date(expiresAt);
  return Date.now() > expirationDate.getTime();
};

// Utility function to get time left for story
export const getStoryTimeLeft = (expiresAt: string | Date): number => {
  const expirationDate = new Date(expiresAt);
  return Math.max(0, expirationDate.getTime() - Date.now());
};

// Utility function to format time left
export const formatTimeLeft = (milliseconds: number): string => {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Utility function to get story progress (0-100)
export const getStoryProgress = (expiresAt: string | Date): number => {
  const timeLeft = getStoryTimeLeft(expiresAt);
  const totalDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const elapsed = totalDuration - timeLeft;
  return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
};
