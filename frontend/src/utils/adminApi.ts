// Use the Railway backend URL
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api`;

export const adminApi = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    const token = localStorage.getItem('token');
    
    console.log('🔗 Attempting to fetch from:', `${API_BASE_URL}/admin/stats`);
    console.log('🔑 Token available:', !!token);
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Response not OK:', response.status, response.statusText);
        console.error('❌ Error body:', errorText);
        throw new Error(`Failed to fetch dashboard statistics: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Successfully fetched data:', data);
      return data;
    } catch (error) {
      console.error('❌ Fetch error:', error);
      throw error;
    }
  },

  // Get users with pagination
  getUsers: async (page = 1, limit = 10) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/admin/users?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  },

  // Get posts with pagination
  getPosts: async (page = 1, limit = 10) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/admin/posts?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }

    return response.json();
  },

  // Get comments
  getComments: async () => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/admin/comments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }

    return response.json();
  },

  // Get groups
  getGroups: async () => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/admin/groups`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch groups');
    }

    return response.json();
  },

  // Get pages
  getPages: async () => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/admin/pages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch pages');
    }

    return response.json();
  },

  // Get games
  getGames: async () => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/admin/games`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch games');
    }

    return response.json();
  },

  // Get messages with pagination
  getMessages: async (page = 1, limit = 10) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/admin/messages?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    return response.json();
  }
}; 