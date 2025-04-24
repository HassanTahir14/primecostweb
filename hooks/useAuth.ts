'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { selectIsAuthenticated, selectCurrentUser } from '@/store/authSlice';

interface UseAuthOptions {
  redirectTo?: string;
  redirectIfFound?: boolean;
  requiredRoles?: string[];
}

export function useAuth({ redirectTo = '/login', redirectIfFound = false, requiredRoles = [] }: UseAuthOptions = {}) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const router = useRouter();

  useEffect(() => {
    if (!redirectIfFound && !isAuthenticated) {
      // If protection needed and user is not authenticated, redirect to login
      router.push('/login');
    } else if (redirectIfFound && isAuthenticated) {
      // If redirection needed *if* authenticated (e.g., login page)
      // Determine where to redirect based on role
      let redirectPath = '/dashboard';
      if (currentUser?.role === 'CHEF' || currentUser?.role === 'HEAD_CHEF') {
        redirectPath = '/chef-dashboard';
      }
      router.push(redirectPath);
    } else if (isAuthenticated && requiredRoles.length > 0) {
      // Check if user has required role
      if (!currentUser || !requiredRoles.includes(currentUser.role)) {
        // If user doesn't have required role, redirect to appropriate dashboard
        let redirectPath = '/dashboard';
        if (currentUser?.role === 'CHEF' || currentUser?.role === 'HEAD_CHEF') {
          redirectPath = '/chef-dashboard';
        }
        router.push(redirectPath);
      }
    }
  }, [isAuthenticated, redirectIfFound, redirectTo, router, currentUser, requiredRoles]);

  return { 
    isAuthenticated,
    currentUser,
    hasRequiredRole: currentUser && requiredRoles.length > 0 ? requiredRoles.includes(currentUser.role) : true
  };
} 