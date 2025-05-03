'use client';

import { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/authSlice';
import api from '@/store/api';
import AssignOrder from '@/components/AssignOrder';
import Loader from '@/components/common/Loader';
import Link from 'next/link';

interface DashboardStats {
  totalPreparedMainRecipes: number;
  totalPreparedSubRecipes: number;
  pendingOrders: number;
  completedOrders: number;
  inProgressOrders: number;
}

interface AssignedOrder {
  orderId: number;
  orderType: 'RECIPE' | 'SUB_RECIPE';
  orderStatus: 'PENDING' | 'FINISHED' | 'CANCELLED' | 'IN_PROGRESS';
  assignedTime: string;
  recipeId: number | null;
  subRecipeId: number | null;
  recipeName: string;
  branchId: number;
  branchName: string;
}

export default function ChefDashboard() {
  const router = useRouter();
  const currentUser = useSelector(selectCurrentUser);
  const [stats, setStats] = useState<DashboardStats>({
    totalPreparedMainRecipes: 0,
    totalPreparedSubRecipes: 0,
    pendingOrders: 0,
    completedOrders: 0,
    inProgressOrders: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [assignedOrders, setAssignedOrders] = useState<AssignedOrder[]>([]);

  useEffect(() => {
    // Redirect if not CHEF or HEAD_CHEF
    if (currentUser && !['CHEF', 'HEAD_CHEF'].includes(currentUser.role)) {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  useEffect(() => {
    if (currentUser) { // Only fetch if we have user info
      fetchDashboardStats();
    }
  }, [currentUser]); // Add currentUser as dependency

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/orders/my');
      if (response.data?.assignedOrders) {
        const orders = response.data.assignedOrders;
        setAssignedOrders(orders);

        // Calculate stats from orders
        const stats = {
          totalPreparedMainRecipes: orders.filter((order: AssignedOrder) => 
            order.orderType === 'RECIPE' && order.orderStatus === 'FINISHED'
          ).length,
          totalPreparedSubRecipes: orders.filter((order: AssignedOrder) => 
            order.orderType === 'SUB_RECIPE' && order.orderStatus === 'FINISHED'
          ).length,
          pendingOrders: orders.filter((order: AssignedOrder) => 
            order.orderStatus === 'PENDING'
          ).length,
          completedOrders: orders.filter((order: AssignedOrder) => 
            order.orderStatus === 'FINISHED'
          ).length,
          inProgressOrders: orders.filter((order: AssignedOrder) => 
            order.orderStatus === 'IN_PROGRESS'
          ).length
        };

        setStats(stats);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="medium" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="medium" />
      </div>
    );
  }

  return (
    <PageLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Prepared Main Recipes */}
          <div className="bg-pink-100 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold">{stats.totalPreparedMainRecipes}</h3>
                <p className="text-gray-600">Total Prepared Main Recipes</p>
              </div>
              <div className="bg-pink-200 p-3 rounded-full">
                <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Prepared Sub Recipes */}
          <div className="bg-purple-100 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold">{stats.totalPreparedSubRecipes}</h3>
                <p className="text-gray-600">Total Prepared Sub Recipes</p>
              </div>
              <div className="bg-purple-200 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-yellow-100 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold">{stats.pendingOrders}</h3>
                <p className="text-gray-600">Pending Orders</p>
              </div>
              <div className="bg-yellow-200 p-3 rounded-full">
                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Completed Orders */}
          <div className="bg-green-100 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold">{stats.completedOrders}</h3>
                <p className="text-gray-600">Completed Orders</p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* In Progress Orders */}
          <div className="bg-purple-100 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold">{stats.inProgressOrders}</h3>
                <p className="text-gray-600">In Progress Orders</p>
              </div>
              <div className="bg-purple-200 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {currentUser?.role === 'HEAD_CHEF' && (
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm mb-6">
            <h2 className="text-base md:text-lg font-bold mb-4 md:mb-6">
              Reports
            </h2>
            <div className="flex flex-wrap gap-2 md:gap-4">
              {[
                { name: "Non Conformance Report", path: "/non-conformance" },
              ].map((report) => (
                <Link
                  key={report.path}
                  href={report.path}
                  passHref
                  legacyBehavior
                >
                  <a className="bg-[#339A89] text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full hover:bg-[#2b8274] transition-colors text-xs md:text-sm no-underline">
                    {report.name}
                  </a>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Assigned Orders Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <AssignOrder onClose={() => {}} />
        </div>
      </div>
    </PageLayout>
  );
} 