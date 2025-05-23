'use client';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/authSlice';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NotFound() {
  const router = useRouter();
  const currentUser = useSelector(selectCurrentUser);

  useEffect(() => {
    // Redirect based on user role
    if (currentUser) {
      if (currentUser.role === 'CHEF' || currentUser.role === 'HEAD_CHEF') {
        router.push('/chef-dashboard');
      } else if (currentUser.role === 'Admin') {
        router.push('/dashboard');
      }
    }
  }, [currentUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <h2 className="mt-6 text-3xl font-bold text-gray-900">Page Not Found</h2>
        <p className="mt-2 text-sm text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-5">
          <Link
            href={currentUser?.role === 'CHEF' || currentUser?.role === 'HEAD_CHEF' ? '/chef-dashboard' : '/dashboard'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#339A89] hover:bg-[#339A89] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#339A89]"
          >
            Go back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
} 