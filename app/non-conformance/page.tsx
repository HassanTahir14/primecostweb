'use client';

import React from 'react';
import PageLayout from '@/components/PageLayout';
import NonConformanceReportTable from '@/components/non-conformance/NonConformanceReportTable';
import Button from '@/components/common/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

// This page will display the list/table of non-conformance reports.
// Data fetching logic (e.g., using Redux or local state with useEffect)
// would be added here in a real application.

export default function NonConformanceReportsPage() {
  // Placeholder state - replace with actual data fetching
  const isLoading = false;
  const reports = undefined; // Use mock data from the table component by default

  return (
    <PageLayout title="Non Conformance Reports">
      <div className="space-y-6">
        <div className="flex justify-end">
           <Link href="/non-conformance/create"> 
            <Button>
              <Plus size={18} className="mr-2" />
              Create Report
            </Button>
          </Link>
        </div>

        <NonConformanceReportTable 
          isLoading={isLoading} 
          reports={reports} 
        />
      </div>
    </PageLayout>
  );
} 