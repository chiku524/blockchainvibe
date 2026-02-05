import axios from 'axios';

const PRODUCTION_API_URL = 'https://blockchainvibe-api.nico-chikuji.workers.dev';

// Get API URL: production builds always use prod API; development uses REACT_APP_API_URL (e.g. localhost)
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL_PROD || PRODUCTION_API_URL;
  }
  return process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL_PROD || PRODUCTION_API_URL;
};

const API_BASE_URL = getApiUrl();

// Create axios instance with enhanced configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with retry logic
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear auth tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      // Redirect to login
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signin') {
        window.location.href = '/signin';
      }
      return Promise.reject(error);
    }

    // Retry logic for network errors or 5xx errors
    if (
      (!error.response || (error.response.status >= 500 && error.response.status < 600)) &&
      !originalRequest._retry &&
      originalRequest.method !== 'get' // Only retry non-GET requests
    ) {
      originalRequest._retry = true;
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * (originalRequest._retryCount || 1)));
      originalRequest._retryCount = (originalRequest._retryCount || 1) + 1;
      
      // Retry the request (max 2 retries)
      if (originalRequest._retryCount <= 2) {
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export const newsAPI = {
  getTrendingNews: async (params = {}) => {
    const response = await api.post('/api/news/trending', params);
    return response.data;
  },

  getPersonalizedNews: async (params = {}) => {
    const response = await api.post('/api/news/personalized', params);
    return response.data;
  },

  searchNews: async (query, limit = 10) => {
    const response = await api.post('/api/news/search', {
      query,
      limit
    });
    return response.data;
  },

  getNewsDetail: async (newsId) => {
    const response = await api.get(`/api/news/${newsId}`);
    return response.data;
  },

  trackActivity: async (activityData) => {
    const response = await api.post('/api/user/activity', activityData);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/api/categories');
    return response.data;
  },
};

export const launchesAPI = {
  getDrops: async () => {
    const response = await api.get('/api/launches/drops');
    return response.data;
  },
};

export const userAPI = {
  getProfile: async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user?.user_id || user?.id || 'demo_user'; // Unauthenticated requests use demo_user; UI should prompt sign-in where needed
    const response = await api.get(`/user/profile?userId=${userId}`);
    return response.data?.user || null;
  },

  updateProfile: async (userId, profileData) => {
    const response = await api.put('/user/profile', {
      userId,
      profileData
    });
    return response.data;
  },

  updatePreferences: async (preferences) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user?.user_id || user?.id || 'demo_user'; // Unauthenticated: demo_user
    const response = await api.post('/user/preferences', {
      user_id: userId,
      preferences
    });
    return response.data;
  },

  trackActivity: async (activityData) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user?.user_id || user?.id;
    const response = await api.post('/api/user/activity', {
      user_id: userId,
      ...activityData,
      timestamp: new Date().toISOString()
    });
    return response.data;
  },

  getLikedArticles: async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user?.user_id || user?.id;
    if (!userId) return [];
    const response = await api.get(`/api/user/likes?userId=${encodeURIComponent(userId)}`);
    return response.data?.items || [];
  },

  getSavedArticles: async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user?.user_id || user?.id;
    if (!userId) return [];
    const response = await api.get(`/api/user/saved?userId=${encodeURIComponent(userId)}`);
    return response.data?.items || [];
  },
};

export const mettaAPI = {
  getContext: async () => {
    const response = await api.get('/metta/context');
    return response.data;
  },

  searchContext: async (query) => {
    const response = await api.post('/metta/search', { query });
    return response.data;
  },
};

export const subscriptionAPI = {
  getSubscription: async (userId) => {
    const response = await api.get(`/api/subscription?userId=${encodeURIComponent(userId)}`);
    return response.data;
  },

  updateSubscription: async (userId, plan) => {
    const response = await api.post('/api/subscription', { user_id: userId, plan });
    return response.data;
  },
};

export const aiAPI = {
  getInsights: async (userId) => {
    const response = await api.get(`/api/ai/insights?userId=${encodeURIComponent(userId)}`);
    return response.data;
  },

  getDailyDigest: async (userId = null) => {
    const params = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const response = await api.get(`/api/ai/daily-digest${params}`);
    return response.data;
  },

  ask: async (query, userId = null) => {
    const response = await api.post('/api/ai/ask', { query, userId });
    return response.data;
  },

  sendChatMessage: async (message) => {
    const response = await api.post('/api/chat/message', message);
    return response.data;
  },

  getAgents: async () => {
    const response = await api.get('/api/agents');
    return response.data;
  },

  getMeTTaStatus: async () => {
    const response = await api.get('/api/metta/status');
    return response.data;
  },
};

export default api;
