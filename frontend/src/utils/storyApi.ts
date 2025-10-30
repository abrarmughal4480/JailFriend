import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};


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


export const isStoryExpired = (expiresAt: string | Date): boolean => {
  const expirationDate = new Date(expiresAt);
  return Date.now() > expirationDate.getTime();
};


export const getStoryTimeLeft = (expiresAt: string | Date): number => {
  const expirationDate = new Date(expiresAt);
  return Math.max(0, expirationDate.getTime() - Date.now());
};


export const formatTimeLeft = (milliseconds: number): string => {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};


export const getStoryProgress = (expiresAt: string | Date): number => {
  const timeLeft = getStoryTimeLeft(expiresAt);
  const totalDuration = 24 * 60 * 60 * 1000; 
  const elapsed = totalDuration - timeLeft;
  return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
};
