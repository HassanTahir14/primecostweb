'use client';

import React from 'react';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface ReportLink {
  name: string;
  path: string; // Path to navigate to for this report type
}

interface ReportIndexPageProps {
  title: string;
  reportLinks: ReportLink[];
  // Optional: Add filter/other controls if needed later
}

const ReportIndexPage: React.FC<ReportIndexPageProps> = ({ title, reportLinks }) => {
  return (
    <PageLayout title={title}>
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        {reportLinks.map((link) => (
          <div 
            key={link.path}
            className="flex justify-between items-center border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
          >
            <span className="text-gray-700 font-medium">{link.name}</span>
            <Link href={link.path}>
              <Button variant="secondary" size="sm" className="bg-[#00997B] hover:bg-[#007d63] text-white">
                View All Reports
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </Link>
          </div>
        ))}
        {reportLinks.length === 0 && (
            <p className="text-center text-gray-500 py-6">No report types available.</p>
        )}
      </div>
    </PageLayout>
  );
};

export default ReportIndexPage; 