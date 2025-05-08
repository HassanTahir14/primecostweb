'use client';

import React from 'react';
import PageLayout from '@/components/PageLayout';
import Link from 'next/link';
import { ArrowLeft, Globe, DollarSign } from 'lucide-react';
import CurrencySelector from '@/components/settings/CurrencySelector';

export default function SettingsPage() {
  return (
    <PageLayout title="Settings">
      <div className="max-w-2xl mx-auto">
        {/* Header with Back Arrow */}
        <div className="mb-8 flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={24} />
          </Link>
        </div>

        {/* Settings Options */}
        <div className="space-y-4">
          {/* Language Setting */}
          <div className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-center border border-gray-200 mb-4">
            <span className="text-gray-700 font-medium">Language</span>
            <div className="flex items-center gap-2 text-gray-600">
              <span>English</span>
              <Globe size={20} />
            </div>
          </div>



          {/* Currency Setting */}
          {/* <div className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-center border border-gray-200">
            <span className="text-gray-700 font-medium">Currency</span>
            <div className="flex items-center gap-2 text-gray-600">
              <span>USD</span>
              <DollarSign size={20} />
            </div>
          </div> */}
        </div>

        <CurrencySelector />
      </div>
    </PageLayout>
  );
} 