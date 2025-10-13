const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';

export interface WebsiteSettings {
  websiteMode: 'public' | 'private' | 'maintenance';
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  features: {
    registration: boolean;
    emailVerification: boolean;
    smsVerification: boolean;
    socialLogin: boolean;
    fileUpload: boolean;
    chat: boolean;
    videoCall: boolean;
    audioCall: boolean;
    groups: boolean;
    pages: boolean;
    marketplace: boolean;
    forum: boolean;
    games: boolean;
    events: boolean;
    funding: boolean;
    advertising: boolean;
    movies: boolean;
    reels: boolean;
    albums: boolean;
    stories: boolean;
    liveStreaming: boolean;
    notifications: boolean;
    search: boolean;
    comments: boolean;
    likes: boolean;
    shares: boolean;
    bookmarks: boolean;
    reports: boolean;
    moderation: boolean;
  };
  general: {
    // User Configuration
    onlineUsers: boolean;
    userLastSeen: boolean;
    userAccountDeletion: boolean;
    profileBackgroundChange: boolean;
    friendsSystem: boolean;
    connectivityLimit: number;
    userInviteSystem: boolean;
    inviteLinks: number;
    inviteTimeframe: string;
    
    // Security Settings
    accountValidation: boolean;
    validationMethod: string;
    recaptcha: boolean;
    recaptchaKey: string;
    recaptchaSecret: string;
    preventBadLogin: boolean;
    loginLimit: number;
    lockoutTime: number;
    registrationLimits: number;
    reservedUsernamesSystem: boolean;
    reservedUsernames: string;
    
    // System Settings
    censoredWords: string;
    homePageCaching: string;
    profilePageCaching: string;
    exchangerateApiKey: string;
    disableStartPage: boolean;
    
    // Notifications
    emailNotifications: boolean;
    profileVisitNotifications: boolean;
    notificationOnNewPost: boolean;
  };
  apiKeys: {
    googleMaps: { enabled: boolean; key: string };
    yandexMaps: { enabled: boolean; key: string };
    googleTranslation: { enabled: boolean; key: string };
    yandexTranslation: { enabled: boolean; key: string };
    youtube: { key: string };
    giphy: { key: string };
  };
  nativeApps: {
    android: { messenger: string; timeline: string };
    ios: { messenger: string; timeline: string };
    windows: { messenger: string };
  };
  analytics: {
    googleAnalytics: string;
  };
  maintenance: {
    enabled: boolean;
    message: string;
    allowedIPs: string[];
  };
  cache: {
    enabled: boolean;
    duration: number;
  };
  security: {
    maxLoginAttempts: number;
    lockoutDuration: number;
    passwordMinLength: number;
    requireStrongPassword: boolean;
    sessionTimeout: number;
  };
  email: {
    provider: 'smtp' | 'sendgrid' | 'mailgun';
    host: string;
    port: number;
    username: string;
    password: string;
    fromEmail: string;
    fromName: string;
  };
  sms: {
    provider: 'twilio' | 'nexmo' | 'aws';
    accountSid: string;
    authToken: string;
    fromNumber: string;
  };
  fileUpload: {
    enabled: boolean;
    videoEnabled: boolean;
    reelsEnabled: boolean;
    audioEnabled: boolean;
    cssEnabled: boolean;
    allowedExtensions: string[];
    allowedMimeTypes: string[];
    maxFileSize: string;
    imageCompressionLevel: string;
    ffmpeg: {
      enabled: boolean;
      path: string;
      allowedExtensions: string[];
      allowedMimeTypes: string[];
    };
    storage: {
      amazonS3: {
        enabled: boolean;
        bucketName: string;
        key: string;
        secretKey: string;
        customEndpoint: string;
        region: string;
      };
      ftp: {
        enabled: boolean;
        hostname: string;
        username: string;
        password: string;
        port: string;
        path: string;
        endpoint: string;
      };
      digitalocean: {
        enabled: boolean;
        spaceName: string;
        key: string;
        secret: string;
        customEndpoint: string;
        region: string;
      };
      googleCloud: {
        enabled: boolean;
        bucketName: string;
        filePath: string;
        customEndpoint: string;
      };
      backblaze: {
        enabled: boolean;
        bucketId: string;
        bucketName: string;
        region: string;
        accessKeyId: string;
        accessKey: string;
        customEndpoint: string;
      };
      wasabi: {
        enabled: boolean;
        bucketName: string;
        accessKey: string;
        secretKey: string;
        customEndpoint: string;
        region: string;
      };
    };
  };
  socialLogin: {
    google: { enabled: boolean; clientId: string; clientSecret: string };
    facebook: { enabled: boolean; appId: string; appSecret: string };
    twitter: { enabled: boolean; consumerKey: string; consumerSecret: string };
  };
  nodejs: {
    port: number;
    environment: 'development' | 'production' | 'test';
    corsOrigin: string;
  };
  cronJobs: {
    cleanupTempFiles: { enabled: boolean; schedule: string };
    sendNotifications: { enabled: boolean; schedule: string };
    updateStatistics: { enabled: boolean; schedule: string };
  };
  ai: {
    openai: { enabled: boolean; apiKey: string; model: string };
    contentModeration: { enabled: boolean; provider: 'openai' | 'aws' | 'google' };
    autoTagging: { enabled: boolean };
    smartRecommendations: { enabled: boolean };
  };
}

export const websiteSettingsApi = {
  // Get all website settings
  getSettings: async (): Promise<WebsiteSettings> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/website-settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching website settings:', error);
      throw error;
    }
  },

  // Update website settings
  updateSettings: async (settings: Partial<WebsiteSettings>): Promise<WebsiteSettings> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/website-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating website settings:', error);
      throw error;
    }
  },

  // Update specific feature
  updateFeature: async (feature: string, enabled: boolean): Promise<{ feature: string; enabled: boolean }> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/website-settings/feature`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ feature, enabled })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating feature:', error);
      throw error;
    }
  },

  // Update general setting
  updateGeneralSetting: async (setting: string, value?: string | number | boolean, enabled?: boolean): Promise<{ setting: string; value: any }> => {
    try {
      const token = localStorage.getItem('token');
      const body: any = { setting };
      if (value !== undefined) body.value = value;
      if (enabled !== undefined) body.enabled = enabled;

      const response = await fetch(`${API_BASE_URL}/api/website-settings/general`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating general setting:', error);
      throw error;
    }
  },

  // Update API key
  updateApiKey: async (service: string, key: string, enabled?: boolean): Promise<{ service: string; key: string; enabled: boolean }> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/website-settings/api-key`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ service, key, enabled })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating API key:', error);
      throw error;
    }
  },

  // Toggle maintenance mode
  toggleMaintenanceMode: async (enabled: boolean, message?: string): Promise<{ enabled: boolean; message: string }> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/website-settings/maintenance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enabled, message })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      throw error;
    }
  },

  // Get website mode (public endpoint)
  getWebsiteMode: async (): Promise<{ mode: string; maintenance: any; features: any }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/website-settings/mode`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error getting website mode:', error);
      throw error;
    }
  },

  // Reset settings to defaults
  resetToDefaults: async (): Promise<WebsiteSettings> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/website-settings/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  }
}; 