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
import { useTranslation } from '@/context/TranslationContext';

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

export default function Sidebar({ isOpen, onOpenChange }: SidebarProps) {
  const pathname = usePathname();
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const router = useRouter();
  const { isRTL, t } = useTranslation();

  

// Update menuConfig to use translation keys for labels
const menuConfig: { [key: string]: { icon: string; href: string; label: string } } = {
  'Home': { icon: '/assets/svgs/home.svg', href: 'dynamic', label: t('sidebar.menu.home') },
  'Items Master List': { icon: '/assets/svgs/fishSimple.svg', href: '/items', label: t('sidebar.menu.itemsMasterList') },
  'Recipes': { icon: '/assets/svgs/recipes.svg', href: '/recipes', label: t('sidebar.menu.recipes') },
  'Serving Size': { icon: '/assets/svgs/scales.svg', href: '/serving-size', label: t('sidebar.menu.servingSize') },
  'Assign Order': { icon: '/assets/svgs/assign_order.svg', href: '/assign-order', label: t('sidebar.menu.assignOrder') },
  'Purchase Orders': { icon: '/assets/svgs/purchaseOrder.svg', href: '/purchase-orders', label: t('sidebar.menu.purchaseOrders') },
  'Transfers': { icon: '/assets/svgs/transfers.svg', href: '/transfers', label: t('sidebar.menu.transfers') },
  'Kitchen Employees': { icon: '/assets/svgs/kitchenEmployees.svg', href: '/employees', label: t('sidebar.menu.kitchenEmployees') },
  'Suppliers': { icon: '/assets/svgs/suppliers.svg', href: '/suppliers', label: t('sidebar.menu.suppliers') },
  'Service Level Agreement': { icon: '/assets/svgs/serviceLevelAgreements.svg', href: '/sla-report', label: t('sidebar.menu.serviceLevelAgreement') },
  'Branches': { icon: '/assets/svgs/branches.svg', href: '/branches', label: t('sidebar.menu.branches') },
  'Taxes': { icon: '/assets/svgs/taxes.svg', href: '/taxes', label: t('sidebar.menu.taxes') },
  'Inventory': { icon: '/assets/svgs/inventory.svg', href: '/inventory', label: t('sidebar.menu.inventory') },
  'Tokens': { icon: '/assets/svgs/tokens.svg', href: '/tokens', label: t('sidebar.menu.tokens') },
  'Finished Orders': { icon: '/assets/svgs/orders.svg', href: '/finished-orders', label: t('sidebar.menu.printLabels') },
};


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
      <div className={`fixed h-screen bg-[#339A89] w-16 md:w-20 flex flex-col items-center py-4 z-50 ${isRTL ? 'right-0' : 'left-0'}`}>
        <button
          onClick={() => onOpenChange(true)}
          className="text-white mb-8"
        >
          <Image src="/assets/svgs/menu.svg" alt={t('sidebar.menu.openMenu')} width={24} height={24} className="brightness-0 invert" />
        </button>

        <div className="flex flex-col items-center space-y-5 md:space-y-7">
          {/* Render directly accessible items */}
          {collapsedDirectItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`text-white hover:bg-[#2b8274] p-2 rounded-lg ${pathname === item.href ? 'bg-[#2b8274]' : ''}`}
              title={item.label} // Already translated
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
            title={t('sidebar.menu.showMore')}
          >
            {t('sidebar.menu.more')}
          </button>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="text-white mt-auto mb-4 md:mb-6"
          title={t('sidebar.menu.logout')}
        >
          <Image src="/assets/svgs/logout.svg" alt={t('sidebar.menu.logout')} width={20} height={20} className="brightness-0 invert" />
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
      
      <div className={`fixed h-screen bg-[#339A89] w-[85%] sm:w-[320px] lg:w-[400px] p-4 md:p-6 z-50 ${isRTL ? 'right-0' : 'left-0'} overflow-y-auto`}>
        <div className="flex items-center gap-2 text-white mb-6 md:mb-8">
          <button
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2"
          >
            <Image src="/assets/svgs/menu.svg" alt="Menu" width={24} height={24} className="brightness-0 invert" />
            <span>{t('sidebar.menu.menu')}</span>
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
          className={`flex items-center gap-2 text-white absolute bottom-4 md:bottom-6 ${isRTL ? 'right-4 md:right-6' : 'left-4 md:left-6'} hover:opacity-80`}
        >
          <Image src="/assets/svgs/logout.svg" alt="Logout" width={20} height={20} className="brightness-0 invert" />
          <span className="text-xs md:text-sm">{t('sidebar.menu.logout')}</span>
        </button>
      </div>
    </>
  );
}