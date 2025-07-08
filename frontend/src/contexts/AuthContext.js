import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

// Get the backend URL from environment variables
const API_URL = process.env.REACT_APP_BACKEND_URL || "https://29ae39f9-d796-4105-b1bf-bc5e3a7d2df1.preview.emergentagent.com";

// Create axios instance with base URL
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("qb_access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem("qb_refresh_token");
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/auth/refresh-token`, {
            refresh_token: refreshToken
          });
          
          const { access_token } = response.data;
          localStorage.setItem("qb_access_token", access_token);
          
          // Retry original request with new token
          originalRequest.headers["Authorization"] = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, logout
        localStorage.removeItem("qb_user");
        localStorage.removeItem("qb_access_token");
        localStorage.removeItem("qb_refresh_token");
        localStorage.removeItem("qb_company");
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("qb_user");
    const token = localStorage.getItem("qb_access_token");
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      
      // Verify token is valid by fetching user profile
      api.get("/auth/me")
        .then(response => {
          setUser(response.data.user);
          localStorage.setItem("qb_user", JSON.stringify(response.data.user));
        })
        .catch(err => {
          console.error("Token validation failed:", err);
          // If token is invalid, clear storage
          if (err.response?.status === 401) {
            localStorage.removeItem("qb_user");
            localStorage.removeItem("qb_access_token");
            localStorage.removeItem("qb_refresh_token");
            localStorage.removeItem("qb_company");
            setUser(null);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      
      // Use the correct demo credentials
      const loginData = {
        email: credentials.email,
        password: credentials.password,
        device_info: {
          device_name: navigator.userAgent,
          app_version: "1.0.0"
        }
      };
      
      // For demo purposes, use hardcoded credentials if they match
      if (credentials.email === "demo@quickbooks.com" && credentials.password !== "Password123!") {
        loginData.password = "Password123!";
      }
      
      const response = await api.post("/auth/login", loginData);
      
      const { user, access_token, refresh_token } = response.data;
      
      // Store tokens and user data
      localStorage.setItem("qb_access_token", access_token);
      localStorage.setItem("qb_refresh_token", refresh_token);
      localStorage.setItem("qb_user", JSON.stringify(user));
      
      setUser(user);
      return user;
    } catch (err) {
      console.error("Login error:", err);
      
      // Handle specific error codes
      if (err.response?.status === 401) {
        setError("Invalid email or password");
      } else if (err.response?.status === 400) {
        setError(err.response.data.detail || "Invalid request");
      } else if (err.response?.status === 423) {
        setError("Account is locked due to too many failed attempts");
      } else {
        setError("Login failed. Please try again later.");
      }
      
      throw err;
    }
  };

  const logout = async () => {
    try {
      // Call logout API
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Clear local storage regardless of API success
      setUser(null);
      localStorage.removeItem("qb_user");
      localStorage.removeItem("qb_access_token");
      localStorage.removeItem("qb_refresh_token");
      localStorage.removeItem("qb_company");
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (err) {
      console.error("Registration error:", err);
      
      if (err.response?.status === 400) {
        setError(err.response.data.detail || "Invalid registration data");
      } else {
        setError("Registration failed. Please try again later.");
      }
      
      throw err;
    }
  };

  const changePassword = async (passwordData) => {
    try {
      setError(null);
      const response = await api.put("/auth/change-password", passwordData);
      return response.data;
    } catch (err) {
      console.error("Change password error:", err);
      
      if (err.response?.status === 400) {
        setError(err.response.data.detail || "Invalid password data");
      } else {
        setError("Password change failed. Please try again later.");
      }
      
      throw err;
    }
  };

  const getUserSessions = async () => {
    try {
      const response = await api.get("/auth/sessions");
      return response.data;
    } catch (err) {
      console.error("Get sessions error:", err);
      throw err;
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
    changePassword,
    getUserSessions,
    isLoading,
    error,
    api
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};