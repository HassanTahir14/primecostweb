'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function Sidebar({ isOpen, onOpenChange }: SidebarProps) {
  const pathname = usePathname();
  
  const menuItems = [
    { icon: '/assets/svgs/home.svg', label: 'Home', href: '/' },
    { icon: '/assets/svgs/fishSimple.svg', label: 'Items Master List', href: '/items' },
    { icon: '/assets/svgs/recipes.svg', label: 'Recipes', href: '#' },
    { icon: '/assets/svgs/scales.svg', label: 'Serving Size', href: '/serving-size' },
    { icon: '/assets/svgs/assign_order.svg', label: 'Assign Order', href: '/assign-order' },
    { icon: '/assets/svgs/purchaseOrder.svg', label: 'Purchase Orders', href: '/purchase-orders' },
    { icon: '/assets/svgs/transfers.svg', label: 'Transfers', href: '#' },
    { icon: '/assets/svgs/kitchenEmployees.svg', label: 'Kitchen Employees', href: '#' },
    { icon: '/assets/svgs/suppliers.svg', label: 'Suppliers', href: '#' },
  ];

  const moreItems = [
    { icon: '/assets/svgs/serviceLevelAgreements.svg', label: 'Service Level Agreement', href: '#' },
    { icon: '/assets/svgs/branches.svg', label: 'Branches', href: '#' },
    { icon: '/assets/svgs/taxes.svg', label: 'Taxes', href: '#' },
    { icon: '/assets/svgs/inventory.svg', label: 'Inventory', href: '#' },
    { icon: '/assets/svgs/tokens.svg', label: 'Tokens', href: '#' },
  ];

  if (!isOpen) {
    return (
      <div className="fixed h-screen bg-[#339A89] w-16 md:w-20 flex flex-col items-center py-4 z-50 left-0">
        <button
          onClick={() => onOpenChange(true)}
          className="text-white mb-8"
        >
          <Image src="/assets/svgs/menu.svg" alt="Menu" width={24} height={24} className="brightness-0 invert" />
        </button>

        <div className="flex flex-col items-center space-y-5 md:space-y-7">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`text-white hover:bg-[#2b8274] p-2 rounded-lg ${pathname === item.href ? 'bg-[#2b8274]' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Image src={item.icon} alt={item.label} width={20} height={20} className="brightness-0 invert" />
            </Link>
          ))}
        </div>

        <button
          onClick={() => onOpenChange(true)}
          className="text-white text-[10px] md:text-xs mt-6 md:mt-8"
        >
          MORE
        </button>

        <Link
          href="#"
          className="text-white mt-auto mb-4 md:mb-6"
        >
          <Image src="/assets/svgs/logout.svg" alt="Logout" width={20} height={20} className="brightness-0 invert" />
        </Link>
      </div>
    );
  }

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

        <div className="flex flex-col space-y-3 md:space-y-4">
          {/* First row */}
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Link href="/" className={`bg-gray-100 rounded-xl p-2 md:p-3 inline-flex items-center gap-2 w-fit ${pathname === '/' ? 'bg-[#E8FFFE]' : ''}`}>
              <Image src="/assets/svgs/home.svg" alt="Home" width={20} height={20} className="brightness-0" />
              <span className="text-xs md:text-sm text-gray-700">Home</span>
            </Link>
            <Link href="/items" className={`bg-gray-100 rounded-xl p-2 md:p-3 inline-flex items-center gap-2 w-fit ${pathname === '/items' ? 'bg-[#E8FFFE]' : ''}`}>
              <Image src="/assets/svgs/fishSimple.svg" alt="Items" width={20} height={20} className="brightness-0" />
              <span className="text-xs md:text-sm text-gray-700">Items Master List</span>
            </Link>
            <Link href="#" className="bg-gray-100 rounded-xl p-2 md:p-3 inline-flex items-center gap-2 w-fit">
              <Image src="/assets/svgs/recipes.svg" alt="Recipes" width={20} height={20} className="brightness-0" />
              <span className="text-xs md:text-sm text-gray-700">Recipes</span>
            </Link>
          </div>

          {/* Serving Size and Assign Order */}
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Link href="/serving-size" className={`bg-gray-100 rounded-xl p-2 md:p-3 inline-flex items-center gap-2 w-fit ${pathname === '/serving-size' ? 'bg-[#E8FFFE]' : ''}`}>
              <Image src="/assets/svgs/scales.svg" alt="Serving Size" width={20} height={20} className="brightness-0" />
              <span className="text-xs md:text-sm text-gray-700">Serving Size</span>
            </Link>
            <Link href="/assign-order" className={`bg-gray-100 rounded-xl p-2 md:p-3 inline-flex items-center gap-2 w-fit ${pathname === '/assign-order' ? 'bg-[#E8FFFE]' : ''}`}>
              <Image src="/assets/svgs/assign_order.svg" alt="Assign Order" width={20} height={20} className="brightness-0" />
              <span className="text-xs md:text-sm text-gray-700">Assign Order</span>
            </Link>
          </div>

          {/* Purchase Orders and Transfers */}
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Link href="/purchase-orders" className={`bg-gray-100 rounded-xl p-2 md:p-3 inline-flex items-center gap-2 w-fit ${pathname === '/purchase-orders' ? 'bg-[#E8FFFE]' : ''}`}>
              <Image src="/assets/svgs/purchaseOrder.svg" alt="Purchase Orders" width={20} height={20} className="brightness-0" />
              <span className="text-xs md:text-sm text-gray-700">Purchase Orders</span>
            </Link>
            <Link href="#" className="bg-gray-100 rounded-xl p-2 md:p-3 inline-flex items-center gap-2 w-fit">
              <Image src="/assets/svgs/transfers.svg" alt="Transfers" width={20} height={20} className="brightness-0" />
              <span className="text-xs md:text-sm text-gray-700">Transfers</span>
            </Link>
          </div>

          {/* Kitchen Employees and Suppliers */}
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Link href="#" className="bg-gray-100 rounded-xl p-2 md:p-3 inline-flex items-center gap-2 w-fit">
              <Image src="/assets/svgs/kitchenEmployees.svg" alt="Kitchen Employees" width={20} height={20} className="brightness-0" />
              <span className="text-xs md:text-sm text-gray-700">Kitchen Employees</span>
            </Link>
            <Link href="#" className="bg-gray-100 rounded-xl p-2 md:p-3 inline-flex items-center gap-2 w-fit">
              <Image src="/assets/svgs/suppliers.svg" alt="Suppliers" width={20} height={20} className="brightness-0" />
              <span className="text-xs md:text-sm text-gray-700">Suppliers</span>
            </Link>
          </div>

          {/* Service Level Agreement and Branches */}
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Link href="#" className="bg-gray-100 rounded-xl p-2 md:p-3 inline-flex items-center gap-2 w-fit">
              <Image src="/assets/svgs/serviceLevelAgreements.svg" alt="Service Level Agreement" width={20} height={20} className="brightness-0" />
              <span className="text-xs md:text-sm text-gray-700">Service Level Agreement</span>
            </Link>
            <Link href="#" className="bg-gray-100 rounded-xl p-2 md:p-3 inline-flex items-center gap-2 w-fit">
              <Image src="/assets/svgs/branches.svg" alt="Branches" width={20} height={20} className="brightness-0" />
              <span className="text-xs md:text-sm text-gray-700">Branches</span>
            </Link>
          </div>

          {/* Bottom row */}
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Link href="#" className="bg-gray-100 rounded-xl p-2 md:p-3 inline-flex items-center gap-2 w-fit">
              <Image src="/assets/svgs/taxes.svg" alt="Taxes" width={20} height={20} className="brightness-0" />
              <span className="text-xs md:text-sm text-gray-700">Taxes</span>
            </Link>
            <Link href="#" className="bg-gray-100 rounded-xl p-2 md:p-3 inline-flex items-center gap-2 w-fit">
              <Image src="/assets/svgs/inventory.svg" alt="Inventory" width={20} height={20} className="brightness-0" />
              <span className="text-xs md:text-sm text-gray-700">Inventory</span>
            </Link>
            <Link href="#" className="bg-gray-100 rounded-xl p-2 md:p-3 inline-flex items-center gap-2 w-fit">
              <Image src="/assets/svgs/tokens.svg" alt="Tokens" width={20} height={20} className="brightness-0" />
              <span className="text-xs md:text-sm text-gray-700">Tokens</span>
            </Link>
          </div>
        </div>

        <Link
          href="#"
          className="flex items-center gap-2 text-white absolute bottom-4 md:bottom-6 left-4 md:left-6"
        >
          <Image src="/assets/svgs/logout.svg" alt="Logout" width={20} height={20} className="brightness-0 invert" />
          <span className="text-xs md:text-sm">Logout</span>
        </Link>
      </div>
    </>
  );
}