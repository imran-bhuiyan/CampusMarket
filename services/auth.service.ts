// ============================================
// CampusMarket - Authentication Service
// ============================================

import type {
    AuthResponse,
    LoginCredentials,
    RegisterCredentials,
    User,
} from '@/types';

import api from './api';

// ---------- Service Methods ----------

export const authService = {
  /**
   * Login with email and password.
   * Returns user data and access token.
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  /**
   * Register a new user.
   * Only sends: name, email, password, department.
   * The backend assigns the role (defaults to 'user').
   */
  register: async (payload: RegisterCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    return data;
  },

  /**
   * Get the currently authenticated user's profile.
   * Requires a valid token in the Authorization header.
   */
  getProfile: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/profile');
    return data;
  },

  /**
   * Logout - currently client-side only.
   * If a refresh-token system is added later, call /auth/logout here.
   */
  logout: async (): Promise<void> => {
    // Actual token clearing is handled in AuthContext
    return;
  },
};

export default authService;
