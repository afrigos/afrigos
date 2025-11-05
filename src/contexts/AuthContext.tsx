import React, { createContext, useContext, useState, useEffect } from 'react';

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
    // Check if user is logged in on app start
    const checkAuth = () => {
      const userData = localStorage.getItem('afrigos-user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          localStorage.removeItem('afrigos-user');
        }
      }
      setLoading(false);
    };

    checkAuth();
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
    localStorage.removeItem('afrigos-user');
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