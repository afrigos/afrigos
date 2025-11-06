import { apiFetch } from './api-client';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number | null;
  sku?: string;
  stock: number;
  images: string[];
  tags: string[];
  isFeatured?: boolean;
  vendor: {
    id: string;
    businessName: string;
    email: string;
  };
  category: {
    id: string;
    name: string;
  };
  rating: number;
  reviewCount: number;
  salesCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductDetail extends Product {
  vendor: {
    id: string;
    businessName: string;
    email: string;
    contactName: string;
  };
  category: {
    id: string;
    name: string;
    description?: string;
  };
  reviews: Array<{
    id: string;
    rating: number;
    comment?: string;
    user: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    createdAt: string;
  }>;
  relatedProducts: Array<{
    id: string;
    name: string;
    price: number;
    comparePrice?: number | null;
    images: string[];
    vendor: {
      id: string;
      businessName: string;
    };
    category: {
      id: string;
      name: string;
    };
    rating: number;
    reviewCount: number;
  }>;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductDetailResponse {
  success: boolean;
  data: ProductDetail;
}

export interface FeaturedProductsResponse {
  success: boolean;
  data: Product[];
}

export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: 'newest' | 'price-low' | 'price-high' | 'name' | 'popular';
  minPrice?: number;
  maxPrice?: number;
  vendorId?: string;
}

export const productsApi = {
  /**
   * Fetch all public products with filters
   */
  getProducts: async (params: ProductsQueryParams = {}): Promise<ProductsResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.category) queryParams.append('category', params.category);
    if (params.search) queryParams.append('search', params.search);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.vendorId) queryParams.append('vendorId', params.vendorId);

    const queryString = queryParams.toString();
    const url = `/products/public${queryString ? `?${queryString}` : ''}`;
    
    return apiFetch<ProductsResponse>(url);
  },

  /**
   * Fetch a single product by ID
   */
  getProductById: async (id: string): Promise<ProductDetailResponse> => {
    return apiFetch<ProductDetailResponse>(`/products/public/${id}`);
  },

  /**
   * Fetch featured products
   */
  getFeaturedProducts: async (limit: number = 12): Promise<FeaturedProductsResponse> => {
    return apiFetch<FeaturedProductsResponse>(`/products/public/featured?limit=${limit}`);
  },

  /**
   * Search products
   */
  searchProducts: async (query: string, params: Omit<ProductsQueryParams, 'search'> = {}): Promise<ProductsResponse> => {
    return productsApi.getProducts({ ...params, search: query });
  },
};

