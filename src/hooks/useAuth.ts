import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'http://localhost:3002/api/v1';

// Types
interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'VENDOR' | 'CUSTOMER';
}

interface LoginData {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token?: string;
  };
}

// API functions
const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    // Ensure we have valid names before sending
    const sanitizedData = {
      ...data,
      firstName: data.firstName?.trim() || 'User',
      lastName: data.lastName?.trim() || 'Name'
    };
    
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitizedData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  },

  getCurrentUser: async (token: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user data');
    }

    const result = await response.json();
    return result.data;
  },

  healthCheck: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  }
};

// Custom hooks
export const useRegister = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      toast({
        title: "Account Request Submitted",
        description: data.message || "Your admin account request has been submitted for review. You'll receive an email once approved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useLogin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      if (data.data.token) {
        localStorage.setItem('afrigos-token', data.data.token);
        localStorage.setItem('afrigos-user', JSON.stringify(data.data.user));
        queryClient.setQueryData(['user'], data.data.user);
      }
      
      toast({
        title: "Welcome back!",
        description: "Successfully logged into AfriGos Admin Dashboard",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useCurrentUser = () => {
  const token = localStorage.getItem('afrigos-token');
  
  return useQuery({
    queryKey: ['user'],
    queryFn: () => authApi.getCurrentUser(token!),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: authApi.healthCheck,
    refetchInterval: 30000, // 30 seconds
  });
};

export { authApi };
