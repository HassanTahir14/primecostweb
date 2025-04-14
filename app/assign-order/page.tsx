'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Users, ChevronDown } from 'lucide-react';
import AssignOrder from '@/components/AssignOrder';

export default function AssignOrderPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f1fff7]">
      <Sidebar isOpen={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
      
      <div className={`flex-1 flex flex-col min-h-screen ${isSidebarOpen ? 'lg:pl-[400px]' : 'pl-16 md:pl-20'}`}>
        {/* Navbar */}
        <nav className="h-14 md:h-16 border-b bg-white flex items-center justify-end px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-7 h-7 md:w-8 md:h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            </div>
            <span className="text-gray-700 text-xs md:text-sm">Walid Sulieman</span>
            <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
          </div>
        </nav>

        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <AssignOrder onClose={() => {}} />
        </main>
      </div>
    </div>
  );
} 