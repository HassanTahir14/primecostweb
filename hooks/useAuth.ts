'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { selectIsAuthenticated } from '@/store/authSlice'; // Adjust path if needed

interface UseAuthOptions {
  redirectTo?: string; // Path to redirect to if not authenticated
  redirectIfFound?: boolean; // If true, redirect if authenticated (e.g., for login page)
}

export function useAuth({ redirectTo = '/login', redirectIfFound = false }: UseAuthOptions = {}) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (!redirectIfFound && !isAuthenticated) {
      // If protection needed and user is not authenticated, redirect
      router.push(redirectTo);
    } else if (redirectIfFound && isAuthenticated) {
      // If redirection needed *if* authenticated (e.g., login page) and user is authenticated, redirect
       router.push(redirectTo); // Redirect to dashboard or intended page
    }
    // No need to redirect if conditions aren't met
  }, [isAuthenticated, redirectIfFound, redirectTo, router]);

  // Return the authentication status, could add user info too if needed
  return { isAuthenticated };
} 