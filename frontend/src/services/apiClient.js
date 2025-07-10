import axios from 'axios';

// Get backend URL from environment - force HTTPS for production
let API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Debug logging to understand the environment
console.log('Initial API_BASE_URL:', API_BASE_URL);
console.log('Window location protocol:', typeof window !== 'undefined' ? window.location.protocol : 'N/A');

// Force HTTPS if we're on a production domain or if environment variable is HTTPS
const isProductionOrHTTPS = typeof window !== 'undefined' && 
  (window.location.protocol === 'https:' || API_BASE_URL.startsWith('https:'));

if (isProductionOrHTTPS) {
  // Ensure the URL uses HTTPS
  API_BASE_URL = API_BASE_URL.replace('http:', 'https:');
  
  // Additional safety check - if the URL somehow doesn't start with https, force it
  if (!API_BASE_URL.startsWith('https:')) {
    API_BASE_URL = 'https://43a39531-f0d7-40d4-b9e6-1c680de1710e.preview.emergentagent.com';
  }
}

const SECURE_API_BASE_URL = API_BASE_URL;

// Final debug logging
console.log('Final SECURE_API_BASE_URL:', SECURE_API_BASE_URL);

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: `${SECURE_API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and force HTTPS
apiClient.interceptors.request.use(
  (config) => {
    // Force HTTPS in production or when page is loaded via HTTPS
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      if (config.url && !config.url.startsWith('https:')) {
        if (config.url.startsWith('http:')) {
          config.url = config.url.replace('http:', 'https:');
        } else if (config.baseURL && config.baseURL.startsWith('http:')) {
          config.baseURL = config.baseURL.replace('http:', 'https:');
        }
      }
      // Also fix any full URLs in the config
      if (config.baseURL && config.baseURL.startsWith('http:')) {
        config.baseURL = config.baseURL.replace('http:', 'https:');
      }
    }
    
    const token = localStorage.getItem('qb_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Log token for debugging
      console.log('Using token for request:', config.url);
    } else {
      console.warn('No token found for request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('qb_refresh_token');
        if (refreshToken) {
          // Force HTTPS for refresh token call
          let refreshUrl = `${SECURE_API_BASE_URL}/api/auth/refresh-token`;
          if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
            refreshUrl = refreshUrl.replace('http:', 'https:');
          }
          
          const response = await axios.post(refreshUrl, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token } = response.data;
          localStorage.setItem('qb_access_token', access_token);
          localStorage.setItem('qb_refresh_token', refresh_token);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('qb_access_token');
        localStorage.removeItem('qb_refresh_token');
        localStorage.removeItem('qb_user');
        localStorage.removeItem('qb_company');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;