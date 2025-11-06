import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api-config';

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
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token?: string;
    isPendingApproval?: boolean;
  };
}

const loginApi = async (data: LoginData): Promise<AuthResponse> => {
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
};

export const useLogin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [searchParams] = useSearchParams();
  
  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      // Transform user data to match AuthContext interface
      const transformedUser = {
        id: data.data.user.id,
        email: data.data.user.email,
        name: `${data.data.user.firstName} ${data.data.user.lastName}`,
        role: data.data.user.role.toLowerCase() as 'admin' | 'vendor',
        avatar: null,
        isActive: data.data.user.isActive,
        isVerified: data.data.user.isVerified
      };
      
      if (data.data.token) {
        localStorage.setItem('afrigos-token', data.data.token);
        localStorage.setItem('afrigos-user', JSON.stringify(data.data.user));
        
        // Update AuthContext with the logged-in user
        setUser(transformedUser);
      }
      
      if (data.data.isPendingApproval) {
        toast({
          title: "Login Successful",
          description: data.message || "Your account is pending approval. Limited access granted.",
        });
        navigate("/auth/pending-approval");
      } else {
        // Check for redirect parameter
        const redirectTo = searchParams.get('redirect');
        
        // Determine default redirect based on user role
        let defaultRedirect = '/';
        if (transformedUser.role === 'admin') {
          defaultRedirect = '/admin';
        } else if (transformedUser.role === 'vendor') {
          defaultRedirect = '/vendor/dashboard';
        }
        
        toast({
          title: "Welcome back!",
          description: "Successfully logged in",
        });
        
        navigate(redirectTo || defaultRedirect);
      }
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
