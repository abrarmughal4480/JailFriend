

export interface User {
  id?: string;
  _id?: string;
  userId?: string;
  name?: string;
  username?: string;
  email?: string;
  avatar?: string;
}

/**
 * Get the current authentication token from localStorage
 * @returns The token or null if not found
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

/**
 * Set the authentication token in localStorage
 * @param token The authentication token
 */
export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
};

/**
 * Remove the authentication token from localStorage
 */
export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
};

/**
 * Logout function that clears all authentication data
 */
export const logout = (): void => {
  if (typeof window === 'undefined') return;
  clearAuth();
  // Optionally redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};

/**
 * Get user information from the JWT token
 * @returns The decoded token payload or null if invalid
 */
export const getUserFromToken = (): any => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Error parsing token:', error);
    removeToken();
    return null;
  }
};

// Cache for user ID to avoid repeated localStorage access and parsing
let cachedUserId: string | null = null;
let lastTokenCheck: string | null = null;

/**
 * Get the current user ID from localStorage or token (optimized with caching)
 * @returns The user ID or null if not found
 */
export const getCurrentUserId = (): string | null => {
  const token = localStorage.getItem('token');
  
  // Return cached result if token hasn't changed
  if (cachedUserId && token === lastTokenCheck) {
    return cachedUserId;
  }
  
  // Clear cache if token changed
  if (token !== lastTokenCheck) {
    cachedUserId = null;
    lastTokenCheck = token;
  }
  
  const userStr = localStorage.getItem('user');
  
  if (userStr) {
    try {
      const user: User = JSON.parse(userStr);
      
      // Try multiple possible user ID fields
      const userId = user.id || user._id || user.userId;
      if (userId) {
        cachedUserId = userId;
        return userId;
      }
    } catch (error) {
      // Silent error handling for production
    }
  }
  
  // Try to get user ID from token if user data is not available
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const tokenUserId = payload.userId || payload.id || payload.sub;
      if (tokenUserId) {
        cachedUserId = tokenUserId;
        return tokenUserId;
      }
    } catch (error) {
      // Silent error handling for production
    }
  }
  
  return null;
};

/**
 * Get the current user object from localStorage
 * @returns The user object or null if not found
 */
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Check if the user is authenticated
 * @returns True if user is authenticated, false otherwise
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  // Check if token exists and is valid
  if (!token || token === 'null' || token === 'undefined') {
    return false;
  }
  
  // If we have a token, consider the user authenticated
  // User data might be populated later
  return true;
};

/**
 * Clear authentication data
 */
export const clearAuth = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Clear cached user ID
  cachedUserId = null;
  lastTokenCheck = null;
};

/**
 * Set authentication data
 * @param token The authentication token
 * @param user The user object
 */
export const setAuth = (token: string, user: User): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  // Clear cached user ID to force refresh
  cachedUserId = null;
  lastTokenCheck = null;
}; 