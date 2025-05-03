'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/authSlice';
import { logout } from '@/store/authSlice';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Function to get dashboard route based on user role
const getDashboardRoute = (role?: string): string => {
  console.log(role, "role");
  switch (role) {
    case 'CHEF':
      return '/chef-dashboard';
    case 'Admin':
      return '/dashboard';
    case 'HEAD_CHEF':
      return '/chef-dashboard';
    default:
      return '/login';
  }
};

// Base configuration mapping menu names to icons and paths
const menuConfig: { [key: string]: { icon: string; href: string; label: string } } = {
  'Home': { icon: '/assets/svgs/home.svg', href: 'dynamic', label: 'Home' }, // href will be set dynamically
  'Items Master List': { icon: '/assets/svgs/fishSimple.svg', href: '/items', label: 'Items Master List' },
  'Recipes': { icon: '/assets/svgs/recipes.svg', href: '/recipes', label: 'Recipes' },
  'Serving Size': { icon: '/assets/svgs/scales.svg', href: '/serving-size', label: 'Serving Size' },
  'Assign Order': { icon: '/assets/svgs/assign_order.svg', href: '/assign-order', label: 'Assign Order' },
  'Purchase Orders': { icon: '/assets/svgs/purchaseOrder.svg', href: '/purchase-orders', label: 'Purchase Orders' },
  'Transfers': { icon: '/assets/svgs/transfers.svg', href: '/transfers', label: 'Transfers' },
  'Kitchen Employees': { icon: '/assets/svgs/kitchenEmployees.svg', href: '/employees', label: 'Kitchen Employees' },
  'Suppliers': { icon: '/assets/svgs/suppliers.svg', href: '/suppliers', label: 'Suppliers' },
  'Service Level Agreement': { icon: '/assets/svgs/serviceLevelAgreements.svg', href: '/sla-report', label: 'Service Level Agreement' },
  'Branches': { icon: '/assets/svgs/branches.svg', href: '/branches', label: 'Branches' },
  'Taxes': { icon: '/assets/svgs/taxes.svg', href: '/taxes', label: 'Taxes' },
  'Inventory': { icon: '/assets/svgs/inventory.svg', href: '/inventory', label: 'Inventory' },
  'Tokens': { icon: '/assets/svgs/tokens.svg', href: '/tokens', label: 'Tokens' },
  'Finished Orders': { icon: '/assets/svgs/orders.svg', href: '/finished-orders', label: 'Print Labels' },
  // Add other potential menu items here if needed
};

export default function Sidebar({ isOpen, onOpenChange }: SidebarProps) {
  const pathname = usePathname();
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const router = useRouter();

  // Get the dashboard route based on user role
  const dashboardRoute = getDashboardRoute(currentUser?.role);

  // Get the list of allowed menu names for the current user
  const allowedMenuNames = currentUser?.dashboardMenuList?.map(item => item.menuName) || [];

  // Filter the base config to get only the items the user should see
  const accessibleMenuItems = Object.entries(menuConfig)
    .filter(([key, value]) => {
      // Special handling for Finished Orders - only show for CHEF and HEAD_CHEF
      if (key === 'Finished Orders') {
        return currentUser?.role === 'CHEF' || currentUser?.role === 'HEAD_CHEF';
      }
      return allowedMenuNames.includes(key);
    })
    .map(([key, value]) => ({
      ...value,
      href: value.href === 'dynamic' ? dashboardRoute : value.href
    })); // Get the value objects and replace dynamic hrefs

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  // --- Collapsed View --- 
  if (!isOpen) {
    // Determine items to show directly in collapsed view (e.g., first 8?)
    const maxCollapsedItems = 8; // Adjust as needed
    const collapsedDirectItems = accessibleMenuItems.slice(0, maxCollapsedItems);
    const showMoreButton = accessibleMenuItems.length > maxCollapsedItems;

    return (
      <div className="fixed h-screen bg-[#339A89] w-16 md:w-20 flex flex-col items-center py-4 z-50 left-0">
        <button
          onClick={() => onOpenChange(true)}
          className="text-white mb-8"
        >
          <Image src="/assets/svgs/menu.svg" alt="Menu" width={24} height={24} className="brightness-0 invert" />
        </button>

        <div className="flex flex-col items-center space-y-5 md:space-y-7">
          {/* Render directly accessible items */}
          {collapsedDirectItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`text-white hover:bg-[#2b8274] p-2 rounded-lg ${pathname === item.href ? 'bg-[#2b8274]' : ''}`}
              title={item.label} // Add title for tooltip on hover
            >
              <Image src={item.icon} alt={item.label} width={20} height={20} className="brightness-0 invert" />
            </Link>
          ))}
        </div>

        {/* Conditionally show MORE button */}
        {showMoreButton && (
          <button
            onClick={() => onOpenChange(true)}
            className="text-white text-[10px] md:text-xs mt-6 md:mt-8"
            title="Show More Menu Items"
          >
            MORE
          </button>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="text-white mt-auto mb-4 md:mb-6"
          title="Logout"
        >
          <Image src="/assets/svgs/logout.svg" alt="Logout" width={20} height={20} className="brightness-0 invert" />
        </button>
      </div>
    );
  }

  // --- Expanded View --- 
  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 ${isOpen ? 'block' : 'hidden'}`}
        onClick={() => onOpenChange(false)}
      />
      
      <div className="fixed h-screen bg-[#339A89] w-[85%] sm:w-[320px] lg:w-[400px] p-4 md:p-6 z-50 left-0 overflow-y-auto">
        <div className="flex items-center gap-2 text-white mb-6 md:mb-8">
          <button
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2"
          >
            <Image src="/assets/svgs/menu.svg" alt="Menu" width={24} height={24} className="brightness-0 invert" />
            <span>Menu</span>
          </button>
        </div>

        {/* Group items dynamically - simpler approach: just list them */}
        <div className="flex flex-wrap gap-2 md:gap-3">
          {accessibleMenuItems.map((item, index) => (
             <Link 
                key={index}
                href={item.href} 
                className={`bg-gray-100 rounded-xl p-2 md:p-3 inline-flex items-center gap-2 w-fit ${pathname === item.href ? 'bg-[#E8FFFE] text-[#339A89] font-medium' : 'text-gray-700'} hover:bg-gray-200`}
                onClick={() => onOpenChange(false)} // Close sidebar on item click
            >
              <Image src={item.icon} alt={item.label} width={20} height={20} className="brightness-0" />
              <span className="text-xs md:text-sm">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-white absolute bottom-4 md:bottom-6 left-4 md:left-6 hover:opacity-80"
        >
          <Image src="/assets/svgs/logout.svg" alt="Logout" width={20} height={20} className="brightness-0 invert" />
          <span className="text-xs md:text-sm">Logout</span>
        </button>
      </div>
    </>
  );
}