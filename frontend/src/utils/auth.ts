

export interface User {
  id?: string;
  _id?: string;
  userId?: string;
  name?: string;
  email?: string;
  avatar?: string;
}

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
};

export const logout = (): void => {
  if (typeof window === 'undefined') return;
  clearAuth();
 
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};

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

let cachedUserId: string | null = null;
let lastTokenCheck: string | null = null;

export const getCurrentUserId = (): string | null => {
  const token = localStorage.getItem('token');
  
  if (cachedUserId && token === lastTokenCheck) {
    return cachedUserId;
  }
  
  if (token !== lastTokenCheck) {
    cachedUserId = null;
    lastTokenCheck = token;
  }
  
  const userStr = localStorage.getItem('user');
  
  if (userStr) {
    try {
      const user: User = JSON.parse(userStr);
      
      const userId = user.id || user._id || user.userId;
      if (userId) {
        cachedUserId = userId;
        return userId;
      }
    } catch (error) {
    }
  }
  
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const tokenUserId = payload.userId || payload.id || payload.sub;
      if (tokenUserId) {
        cachedUserId = tokenUserId;
        return tokenUserId;
      }
    } catch (error) {
    }
  }
  
  return null;
};

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

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || token === 'null' || token === 'undefined') {
    return false;
  }
  
  return true;
};

export const clearAuth = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  cachedUserId = null;
  lastTokenCheck = null;
};

export const setAuth = (token: string, user: User): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
 
  cachedUserId = null;
  lastTokenCheck = null;
}; 