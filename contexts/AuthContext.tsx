// ============================================
// CampusMarket - Authentication Context
// ============================================

import { useRouter, useSegments } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { TOKEN_KEY } from '@/services/api';
import authService from '@/services/auth.service';
import type {
    AuthState,
    LoginCredentials,
    RegisterCredentials
} from '@/types';
import storage from '@/utils/storage';

// ---------- Context Types ----------

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

// ---------- Context Creation ----------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------- Auth Provider Component ----------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const router = useRouter();
  const segments = useSegments();

  // Check for existing token on app load
  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (state.isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!state.isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (state.isAuthenticated && inAuthGroup) {
      // Redirect to home if authenticated but on auth screen
      router.replace('/(tabs)');
    }
  }, [state.isAuthenticated, state.isLoading, segments]);

  // Load stored authentication
  const loadStoredAuth = async () => {
    try {
      const token = await storage.getItem(TOKEN_KEY);
      
      if (token) {
        // Verify token by fetching user profile
        const user = await authService.getProfile();
        setState({
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      // Token invalid or expired
      await storage.removeItem(TOKEN_KEY);
      setState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      
      // Store token securely
      await storage.setItem(TOKEN_KEY, response.accessToken);
      
      setState({
        user: response.user,
        token: response.accessToken,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      throw error;
    }
  }, []);

  // Register function
  const register = useCallback(async (credentials: RegisterCredentials) => {
    try {
      const response = await authService.register(credentials);
      
      // Store token securely
      await storage.setItem(TOKEN_KEY, response.accessToken);
      
      setState({
        user: response.user,
        token: response.accessToken,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await storage.removeItem(TOKEN_KEY);
      setState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ---------- Custom Hook ----------

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default AuthContext;
