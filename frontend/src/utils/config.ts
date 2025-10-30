
export const config = {

  API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com' || 'http://localhost:5000',
  
 
  FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://jaifriend.hgdjlive.com' || 'http://localhost:3000',
  

  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  

  MAX_FILE_SIZE: 10 * 1024 * 1024, 
  
  
  DEFAULT_PAGE_SIZE: 20,
  

  API_TIMEOUT: 30000, 
};


export const getApiUrl = (endpoint: string): string => {
  const baseUrl = config.API_URL.replace(/\/$/, ''); 
  const cleanEndpoint = endpoint.replace(/^\//, ''); 
  return `${baseUrl}/${cleanEndpoint}`;
};


export const getFileUrl = (filePath: string): string => {
  if (!filePath) return '';
  if (filePath.startsWith('http')) return filePath;
  
  const baseUrl = config.API_URL.replace(/\/$/, '');
  const cleanPath = filePath.replace(/^\//, '');
  return `${baseUrl}/${cleanPath}`;
}; 