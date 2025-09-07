import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const AuthRedirect = () => {
  const { isAuthenticated, isAdmin, isVendor, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        if (isAdmin) {
          navigate('/admin/dashboard', { replace: true });
        } else if (isVendor) {
          navigate('/vendor/dashboard', { replace: true });
        }
      } else {
        navigate('/auth/login', { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, isVendor, loading, navigate]);

  return null; // This component doesn't render anything
};
