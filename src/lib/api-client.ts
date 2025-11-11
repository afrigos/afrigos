import { API_BASE_URL } from './api-config';

/**
 * Wrapper for fetch that automatically handles authentication and 401 errors
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('afrigos-token');
  
  // Build full URL
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_BASE_URL}${endpoint}`;

  // Prepare headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      // Clear auth data
      localStorage.removeItem('afrigos-token');
      localStorage.removeItem('afrigos-user');
      
      // Dispatch custom event to notify AuthContext
      window.dispatchEvent(new CustomEvent('auth-logout'));
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      
      throw new Error('Session expired. Please login again.');
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Create error with response data attached
      const error: any = new Error(errorData.message || `API request failed: ${response.status} ${response.statusText}`);
      error.response = { data: errorData, status: response.status };
      throw error;
    }

    // Return parsed JSON
    return await response.json();
  } catch (error) {
    // Re-throw if it's already an Error
    if (error instanceof Error) {
      throw error;
    }
    
    // Handle network errors
    throw new Error('Network error. Please check your connection.');
  }
}

