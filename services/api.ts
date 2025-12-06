// ============================================
// CampusMarket - API Service Configuration
// ============================================

import axios from 'axios';
import { Platform } from 'react-native';

import storage from '@/utils/storage';

// Base URL for the NestJS backend
// Android emulator uses 10.0.2.2 to access host localhost
// Web and iOS simulator use localhost directly
export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3000',
  ios: 'http://localhost:3000',
  default: 'http://localhost:3000', // web
});

// Token key for storage
export const TOKEN_KEY = 'campus_market_token';

// ---------- In-Memory Token Cache ----------
// Avoids hitting storage on every request
let inMemoryToken: string | null = null;

/**
 * Set the current auth token in memory and on the axios instance.
 * Pass null to clear it.
 */
export const setToken = (token: string | null): void => {
  inMemoryToken = token;

  if (!token) {
    delete api.defaults.headers.common.Authorization;
  } else {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
};

/**
 * Get the current in-memory token (for debugging/testing).
 */
export const getToken = (): string | null => inMemoryToken;

// ---------- Axios Instance ----------

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------- Request Interceptor ----------
// Lazy-loads token from storage on first request if not already in memory

api.interceptors.request.use(
  async (config) => {
    // If no token in memory, try to load from storage (first request scenario)
    if (!inMemoryToken) {
      try {
        const storedToken = await storage.getItem(TOKEN_KEY);
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.warn('Failed to read token from storage:', error);
      }
    }

    // Attach token to request if available
    if (inMemoryToken) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${inMemoryToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ---------- Response Interceptor ----------
// Handles 401 errors globally by clearing the token

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      // Token is invalid or expired -> clear it everywhere
      console.warn('Received 401 - clearing auth token');
      try {
        await storage.removeItem(TOKEN_KEY);
      } catch (e) {
        console.warn('Failed to delete token from storage:', e);
      }
      setToken(null);

      // Note: Navigation to login is handled by AuthContext's
      // useEffect that watches isAuthenticated state
    }

    // Log other errors for debugging
    if (error.response) {
      const message = error.response.data?.message || 'An error occurred';
      console.error('API Error:', status, message);
    } else if (error.request) {
      console.error('Network Error: No response from server');
    } else {
      console.error('Request Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
