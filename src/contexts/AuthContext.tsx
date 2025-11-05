import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api-config';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'vendor';
  avatar?: string;
  vendorId?: string; // For vendor users
  vendorName?: string; // For vendor users
  isActive?: boolean; // User's active status
  isVerified?: boolean; // User's verified status
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVendor: boolean;
  login: (email: string, password: string, userType: 'admin' | 'vendor') => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start and validate token
    const checkAuth = async () => {
      const token = localStorage.getItem('afrigos-token');
      const userData = localStorage.getItem('afrigos-user');
      
      // If no token or user data, clear everything and set loading to false
      if (!token || !userData) {
        localStorage.removeItem('afrigos-token');
        localStorage.removeItem('afrigos-user');
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Parse user data
        const parsedUser = JSON.parse(userData);
        
        // Validate token with backend
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        // If token is invalid or expired, clear everything
        if (!response.ok) {
          localStorage.removeItem('afrigos-token');
          localStorage.removeItem('afrigos-user');
          setUser(null);
          setLoading(false);
          return;
        }

        // Token is valid, update user data from response
        const result = await response.json();
        if (result.data) {
          const updatedUser: User = {
            id: result.data.id,
            email: result.data.email,
            name: `${result.data.firstName || ''} ${result.data.lastName || ''}`.trim() || result.data.email,
            role: result.data.role.toLowerCase() as 'admin' | 'vendor',
            vendorId: result.data.vendorId,
            vendorName: result.data.vendorName,
            isActive: result.data.isActive,
            isVerified: result.data.isVerified,
          };
          setUser(updatedUser);
          // Update localStorage with fresh data
          localStorage.setItem('afrigos-user', JSON.stringify(updatedUser));
        } else {
          // Fallback to existing user data if response format is different
          setUser(parsedUser);
        }
      } catch (error) {
        // If validation fails, clear everything
        console.error('Auth validation error:', error);
        localStorage.removeItem('afrigos-token');
        localStorage.removeItem('afrigos-user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for storage events (when localStorage is cleared from another tab/window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'afrigos-token' || e.key === 'afrigos-user') {
        if (!localStorage.getItem('afrigos-token') || !localStorage.getItem('afrigos-user')) {
          setUser(null);
        } else {
          // Re-validate if token was added
          checkAuth();
        }
      }
    };

    // Listen for custom logout event (when localStorage is cleared from same window)
    const handleLogoutEvent = () => {
      setUser(null);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-logout', handleLogoutEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-logout', handleLogoutEvent);
    };
  }, []);

  const login = async (email: string, password: string, userType: 'admin' | 'vendor'): Promise<boolean> => {
    // Mock login logic (frontend only)
    if (userType === 'admin') {
      if (email === 'admin@afrigos.com' && password === 'admin123') {
        const mockUser: User = {
          id: '1',
          email: email,
          name: 'Admin User',
          role: 'admin',
          avatar: null
        };
        setUser(mockUser);
        localStorage.setItem('afrigos-user', JSON.stringify(mockUser));
        return true;
      }
    } else if (userType === 'vendor') {
      // Mock vendor login - in real app, this would validate against vendor database
      if (email === 'mamaasha@afrigos.com' && password === 'vendor123') {
        const mockVendor: User = {
          id: 'V001',
          email: email,
          name: 'Mama Asha',
          role: 'vendor',
          vendorId: 'V001',
          vendorName: "Mama Asha's Kitchen",
          avatar: null
        };
        setUser(mockVendor);
        localStorage.setItem('afrigos-user', JSON.stringify(mockVendor));
        return true;
      }
      // Additional mock vendors
      if (email === 'adunni@afrigos.com' && password === 'vendor123') {
        const mockVendor: User = {
          id: 'V002',
          email: email,
          name: 'Adunni Beauty',
          role: 'vendor',
          vendorId: 'V002',
          vendorName: 'Adunni Beauty',
          avatar: null
        };
        setUser(mockVendor);
        localStorage.setItem('afrigos-user', JSON.stringify(mockVendor));
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('afrigos-token');
    localStorage.removeItem('afrigos-user');
    // Dispatch event for other components that might be listening
    window.dispatchEvent(new CustomEvent('auth-logout'));
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isVendor: user?.role === 'vendor',
    login,
    logout,
    loading,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};