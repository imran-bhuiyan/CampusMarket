// ============================================
// CampusMarket - Product Service
// ============================================

import type {
  CreateProductDTO,
  PaginatedResponse,
  Product
} from '@/types';
import api from './api';

export interface GetProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  department?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const productService = {
  /**
   * Get all products with optional filters
   */
  async getProducts(params?: GetProductsParams): Promise<PaginatedResponse<Product>> {
    const response = await api.get<PaginatedResponse<Product>>('/products', { params });
    return response.data;
  },

  /**
   * Get a single product by ID
   */
  async getProduct(id: number): Promise<Product> {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  /**
   * Create a new product listing
   */
  async createProduct(data: CreateProductDTO): Promise<Product> {
    const response = await api.post<Product>('/products', data);
    return response.data;
  },

  /**
   * Update an existing product
   */
  async updateProduct(id: number, data: Partial<CreateProductDTO>): Promise<Product> {
    const response = await api.patch<Product>(`/products/${id}`, data);
    return response.data;
  },

  /**
   * Delete a product
   */
  async deleteProduct(id: number): Promise<void> {
    await api.delete(`/products/${id}`);
  },
};

export default productService;
