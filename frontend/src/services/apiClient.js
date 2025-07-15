import axios from 'axios';

// Get backend URL from environment - force HTTPS for production
let API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'https://98d98d65-70d4-45d1-9cfd-2a58e3d10794.preview.emergentagent.com';

// Comprehensive HTTPS enforcement
const enforceHttps = (url) => {
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return url.replace(/^http:/, 'https:');
  }
  return url;
};

// Force HTTPS if we're on a production domain or if environment variable is HTTPS
const isProductionOrHTTPS = typeof window !== 'undefined' && 
  (window.location.protocol === 'https:' || API_BASE_URL.startsWith('https:'));

if (isProductionOrHTTPS) {
  API_BASE_URL = enforceHttps(API_BASE_URL);
  
  // Additional safety check - if the URL somehow doesn't start with https, force it
  if (!API_BASE_URL.startsWith('https:')) {
    API_BASE_URL = 'https://98d98d65-70d4-45d1-9cfd-2a58e3d10794.preview.emergentagent.com';
  }
}

const SECURE_API_BASE_URL = API_BASE_URL;

// Debug logging to understand the environment
console.log('Initial API_BASE_URL:', process.env.REACT_APP_BACKEND_URL);
console.log('Window location protocol:', typeof window !== 'undefined' ? window.location.protocol : 'N/A');
console.log('Final SECURE_API_BASE_URL:', SECURE_API_BASE_URL);

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: `${SECURE_API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Global axios default to force HTTPS
if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
  // Global axios interceptor to catch ALL axios requests (even ones not using our configured instances)
  axios.interceptors.request.use(
    (config) => {
      // Force HTTPS for any axios request anywhere in the app
      if (config.url && config.url.startsWith('http:')) {
        config.url = config.url.replace('http:', 'https:');
        console.log('Global interceptor fixed HTTP URL:', config.url);
      }
      
      if (config.baseURL && config.baseURL.startsWith('http:')) {
        config.baseURL = config.baseURL.replace('http:', 'https:');
        console.log('Global interceptor fixed HTTP baseURL:', config.baseURL);
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );
}

// Comprehensive request interceptor to add auth token and force HTTPS
apiClient.interceptors.request.use(
  (config) => {
    // Comprehensive HTTPS enforcement for ALL requests
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      // Handle absolute URLs in config.url
      if (config.url && config.url.startsWith('http:')) {
        config.url = config.url.replace('http:', 'https:');
        console.log('Fixed HTTP URL in config.url:', config.url);
      }
      
      // Handle baseURL
      if (config.baseURL && config.baseURL.startsWith('http:')) {
        config.baseURL = config.baseURL.replace('http:', 'https:');
        console.log('Fixed HTTP baseURL:', config.baseURL);
      }
      
      // Handle any constructed URLs - this is critical for catching edge cases
      const fullUrl = config.baseURL && config.url ? new URL(config.url, config.baseURL).href : config.url;
      if (fullUrl && fullUrl.startsWith('http:')) {
        // If somehow the full URL is HTTP, reconstruct with HTTPS
        const httpsUrl = fullUrl.replace('http:', 'https:');
        const urlObj = new URL(httpsUrl);
        config.baseURL = `${urlObj.protocol}//${urlObj.host}`;
        config.url = urlObj.pathname + urlObj.search + urlObj.hash;
        console.log('Reconstructed HTTPS URL:', config.baseURL, config.url);
      }
    }
    
    const token = localStorage.getItem('qb_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Using token for request:', config.baseURL + config.url);
    } else {
      console.warn('No token found for request:', config.baseURL + config.url);
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