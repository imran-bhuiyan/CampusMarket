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

  /**
   * Upload profile picture.
   * Returns updated user data.
   * Handles both web (blob URL) and native (file URI) formats.
   */
  uploadProfilePicture: async (imageUri: string): Promise<User> => {
    const formData = new FormData();

    // Check if running on web (blob URL starts with 'blob:')
    const isWeb = imageUri.startsWith('blob:') || typeof window !== 'undefined' && window.document;

    if (isWeb && imageUri.startsWith('blob:')) {
      // Web: fetch the blob and append it directly
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const extension = blob.type.split('/')[1] || 'jpg';
      formData.append('file', blob, `profile.${extension}`);
    } else {
      // Native: use the URI-based approach
      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1] || 'jpg';

      formData.append('file', {
        uri: imageUri,
        name: `profile.${fileType}`,
        type: `image/${fileType}`,
      } as any);
    }

    const { data } = await api.patch<User>('/auth/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  /**
   * Update user profile (name, email, phone, department).
   * Returns updated user data.
   */
  updateProfile: async (profileData: { name?: string; email?: string; phone?: string; department?: string }): Promise<User> => {
    const { data } = await api.patch<User>('/auth/profile', profileData);
    return data;
  },

  /**
   * Update user password.
   * Requires current password for verification.
   */
  updatePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const { data } = await api.patch<{ message: string }>('/auth/profile/password', {
      currentPassword,
      newPassword,
    });
    return data;
  },
};

export default authService;
