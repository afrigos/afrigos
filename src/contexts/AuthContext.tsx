import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
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
      const isLoggedIn = localStorage.getItem('afri-connect-admin');
      if (isLoggedIn === 'true') {
        // Mock user data (in real app, you'd fetch from API)
        setUser({
          id: '1',
          email: 'admin@africonnect.uk',
          name: 'Admin User',
          role: 'Super Admin',
          avatar: null
        });
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login logic (frontend only)
    if (email === 'admin@africonnect.uk' && password === 'admin123') {
      const mockUser = {
        id: '1',
        email: email,
        name: 'Admin User',
        role: 'Super Admin',
        avatar: null
      };
      setUser(mockUser);
      localStorage.setItem('afri-connect-admin', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('afri-connect-admin');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};