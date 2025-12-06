// ============================================
// CampusMarket - Authentication Service
// ============================================

import type {
    AuthResponse,
    LoginCredentials,
    RegisterCredentials,
    User
} from '@/types';
import api from './api';

export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register a new user
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  },

  /**
   * Logout (client-side only - clear token)
   */
  async logout(): Promise<void> {
    // Backend can optionally invalidate token
    // For now, we just clear it client-side
  },
};

export default authService;
