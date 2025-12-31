// Centralized configuration for the application
export const config = {
  // API Configuration
  API_URL: process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? 'https://jaifriend-backend.hgdjlive.com'
      : 'http://localhost:5000'),

  // Frontend URL
  FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://jaifriend.hgdjlive.com'),

  // Development settings
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',

  // File upload settings
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB

  // Pagination settings
  DEFAULT_PAGE_SIZE: 20,

  // Timeout settings
  API_TIMEOUT: 30000, // 30 seconds
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = config.API_URL.replace(/\/$/, ''); // Remove trailing slash
  const cleanEndpoint = endpoint.replace(/^\//, ''); // Remove leading slash
  return `${baseUrl}/${cleanEndpoint}`;
};

// Helper function to get full file URL
export const getFileUrl = (filePath: string): string => {
  if (!filePath) return '';
  if (filePath.startsWith('http')) return filePath;

  const baseUrl = config.API_URL.replace(/\/$/, '');
  const cleanPath = filePath.replace(/^\//, '');
  return `${baseUrl}/${cleanPath}`;
}; 