'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '../utils/auth';
import { useSystemThemeOverride } from '@/hooks/useSystemThemeOverride';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/' 
}) => {
  // Ensure system dark mode has no effect
  useSystemThemeOverride();
  
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const authenticated = !!(token && token !== 'null' && token !== 'undefined');
      setIsAuth(authenticated);
      
      if (requireAuth && !authenticated) {
        router.push(redirectTo);
      } else if (!requireAuth && authenticated) {
       
        router.push('/dashboard');
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [requireAuth, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (requireAuth && !isAuth) {
    return null; 
  }

  if (!requireAuth && isAuth) {
      return null; 
  }

  return <>{children}</>;
};

export default AuthGuard; 
