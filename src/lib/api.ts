const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api/v1';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Health check
  async getHealth() {
    return this.request<{ status: string; message: string; timestamp: string }>('/health');
  }

  // Dashboard stats
  async getDashboardStats() {
    return this.request<{
      totalRevenue: number;
      activeVendors: number;
      productsListed: number;
      customerOrders: number;
    }>('/dashboard/stats');
  }

  // Vendor management
  async getPendingVendors() {
    return this.request<{ vendors: Array<{ id: string; name: string; email: string; status: string }> }>('/vendors/pending');
  }

  // Product management
  async getPendingProducts() {
    return this.request<{ products: Array<{ id: string; name: string; vendor: string; status: string }> }>('/products/pending');
  }
}

// Create and export API service instance
export const apiService = new ApiService(API_BASE_URL);

// Export for testing or custom instances
export { ApiService };
