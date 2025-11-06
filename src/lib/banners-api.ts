import { apiFetch } from './api-client';

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  link?: string;
  buttonText?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BannersResponse {
  success: boolean;
  data: Banner[];
}

export const bannersApi = {
  /**
   * Fetch all active banners
   */
  getBanners: async (): Promise<BannersResponse> => {
    return apiFetch<BannersResponse>('/banners');
  },
};


export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  link?: string;
  buttonText?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BannersResponse {
  success: boolean;
  data: Banner[];
}

export const bannersApi = {
  /**
   * Fetch all active banners
   */
  getBanners: async (): Promise<BannersResponse> => {
    return apiFetch<BannersResponse>('/banners');
  },
};

