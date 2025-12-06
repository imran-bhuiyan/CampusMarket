// ============================================
// CampusMarket - TypeScript Type Definitions
// ============================================

// ---------- User & Auth Types ----------

export type UserRole = 'user' | 'admin';

export interface User {
  id: number;
  email: string;
  name: string;
  department: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  department: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

// ---------- Product Types ----------

export type ProductCategory = 'books' | 'electronics' | 'clothing' | 'furniture' | 'other';

export type ProductCondition = 'new' | 'like_new' | 'good' | 'fair';

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  condition: ProductCondition;
  department: string;
  images: string[];
  sellerId: number;
  seller: Pick<User, 'id' | 'name' | 'department'>;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDTO {
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  condition: ProductCondition;
  department: string;
  images: string[];
}

// ---------- API Response Types ----------

export interface ApiError {
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
