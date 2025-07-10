import axios from 'axios';

// Get backend URL from environment
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Ensure URL uses HTTPS if the environment URL is HTTPS
const ensureHttps = (url) => {
  // If we're running on the preview domain with HTTPS, ensure API calls use HTTPS
  if (window.location.protocol === 'https:' && url.startsWith('http:')) {
    return url.replace('http:', 'https:');
  }
  return url;
};

// Apply HTTPS if needed - force HTTPS for production environment
let SECURE_API_BASE_URL = ensureHttps(API_BASE_URL);

// Additional check: if the current page is HTTPS, force API calls to HTTPS
if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
  SECURE_API_BASE_URL = SECURE_API_BASE_URL.replace('http:', 'https:');
}

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: `${SECURE_API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
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
          const response = await axios.post(`${SECURE_API_BASE_URL}/api/auth/refresh-token`, {
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