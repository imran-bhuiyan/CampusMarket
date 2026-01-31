// ============================================
// CampusMarket - Product Service
// ============================================

import type {
  CreateProductDTO,
  PaginatedResponse,
  Product
} from '@/types';
import api, { API_BASE_URL } from './api';

export interface GetProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  department?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Transform image URLs to use the correct API_BASE_URL.
 * Handles relative paths (starting with /) and converts them to full URLs.
 * Leaves absolute URLs (http/https) unchanged.
 */
function transformImageUrls(images: string[]): string[] {
  return images.map(uri => {
    // If it's a relative path starting with /, prepend API_BASE_URL
    if (uri.startsWith('/')) {
      return `${API_BASE_URL}${uri}`;
    }
    // If it's localhost URL, replace with API_BASE_URL
    if (uri.startsWith('http://localhost:')) {
      return uri.replace(/^http:\/\/localhost:\d+/, API_BASE_URL!);
    }
    // Leave other URLs unchanged (external URLs, already correct URLs)
    return uri;
  });
}

/**
 * Transform a product's image URLs to use correct base URL
 */
function transformProduct(product: Product): Product {
  return {
    ...product,
    images: transformImageUrls(product.images || []),
  };
}

export const productService = {
  /**
   * Get all products with optional filters
   */
  async getProducts(params?: GetProductsParams): Promise<PaginatedResponse<Product>> {
    const response = await api.get<PaginatedResponse<Product>>('/products', { params });
    // Transform image URLs for each product
    return {
      ...response.data,
      data: response.data.data.map(transformProduct),
    };
  },

  /**
   * Get a single product by ID
   */
  async getProduct(id: number): Promise<Product> {
    const response = await api.get<Product>(`/products/${id}`);
    // Transform image URLs
    return transformProduct(response.data);
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

  /**
   * Upload product images to server.
   * Returns array of server URLs for the uploaded images.
   * Handles both web (blob:) and native (file://) URIs.
   */
  async uploadImages(imageUris: string[]): Promise<string[]> {
    const formData = new FormData();

    // Check if running on web
    const isWeb = typeof window !== 'undefined' && window.document;

    for (let i = 0; i < imageUris.length; i++) {
      const uri = imageUris[i];

      if (isWeb && uri.startsWith('blob:')) {
        // Web: fetch the blob and append it
        const response = await fetch(uri);
        const blob = await response.blob();
        const extension = blob.type.split('/')[1] || 'jpg';
        formData.append('images', blob, `product-${i}.${extension}`);
      } else {
        // Native: use the URI-based approach (React Native)
        const uriParts = uri.split('.');
        const fileType = uriParts[uriParts.length - 1] || 'jpg';
        formData.append('images', {
          uri: uri,
          name: `product-${i}.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }
    }

    const response = await api.post<{ images: string[] }>('/products/upload-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Prepend API_BASE_URL to relative paths to get full URLs
    // This ensures Android emulator uses 10.0.2.2 instead of localhost
    return response.data.images.map(path => `${API_BASE_URL}${path}`);
  },
};

export default productService;
