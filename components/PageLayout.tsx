'use client';

import { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Bell, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Loader from '@/components/common/Loader';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectCurrentUser } from '@/store/authSlice';
import api from '@/store/api';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function PageLayout({ children, title }: PageLayoutProps) {
  const { isAuthenticated } = useAuth({ redirectTo: '/login' });
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  console.log("currentUser", currentUser);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [pendingTokensCount, setPendingTokensCount] = useState(0);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch pending tokens count
  useEffect(() => {
    const fetchPendingTokensCount = async () => {
      try {
        const response = await api.get('/tokens');
        if (response.data && response.data.tokens) {
          const pendingCount = response.data.tokens.filter((token: any) => token.tokenStatus === 'PENDING').length;
          setPendingTokensCount(pendingCount);
        }
      } catch (error) {
        console.error('Error fetching pending tokens count:', error);
      }
    };

    if (isAuthenticated) {
      fetchPendingTokensCount();
    }
  }, [isAuthenticated]);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuRef]);

  const handleLogout = () => {
    dispatch(logout());
    setIsUserMenuOpen(false);
    router.push('/login');
  }

  // Show loader while checking auth / redirecting
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F4F7FA]">
        <Loader size="medium" />
      </div>
    );
  }

  // If authenticated, render the layout
  return (
    <div className="flex h-screen bg-[#F4F7FA]">
      <Sidebar isOpen={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-[85%] sm:ml-[320px] lg:ml-[400px]' : 'ml-16 md:ml-20'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm px-4 sm:px-6 py-3 flex justify-between items-center sticky top-0 z-30">
          {/* Left side - Display Page Title */}
          <div className="flex items-center">
             <h1 className="text-lg sm:text-xl font-semibold text-gray-800">{title}</h1>
          </div>

          {/* Right side - User Info & Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button className="relative text-gray-500 hover:text-gray-700"
            onClick={() => router.push('/tokens')}>
              <Bell size={20} />
              {pendingTokensCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                  {pendingTokensCount}
                </span>
              )}
            </button>
            
            {/* User Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1 sm:gap-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <span>{currentUser?.username || 'User'}</span>
                <ChevronDown size={16} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-40 ring-1 ring-black ring-opacity-5">
                  <Link 
                    href="/settings" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserMenuOpen(false)} // Close menu on click
                  >
                    Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Title removed from here, now handled in header */}
          {children}
        </main>
      </div>
    </div>
  );
}