'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageLayout from '@/components/PageLayout';
import NonConformanceReportTable from '@/components/non-conformance/NonConformanceReportTable';
import Button from '@/components/common/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { AppDispatch, RootState } from '@/store/store'; // Import store types
import { fetchAllNonConformanceReports, clearError } from '@/store/nonConformanceSlice'; // Import actions
import ConfirmationModal from '@/components/common/ConfirmationModal'; // For error display

// This page will display the list/table of non-conformance reports.
// Data fetching logic (e.g., using Redux or local state with useEffect)
// would be added here in a real application.

export default function NonConformanceReportsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    reports, 
    loading: isLoading, 
    error 
  } = useSelector((state: RootState) => state.nonConformance);

  useEffect(() => {
    dispatch(fetchAllNonConformanceReports());
    // Optional: Clear error on component mount if needed
    // dispatch(clearError()); 

    // Optional: Cleanup function to clear error on unmount
    return () => {
      // dispatch(clearError()); 
    };
  }, [dispatch]);

  const handleCloseErrorModal = () => {
    dispatch(clearError()); // Clear error state when modal is closed
  };

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

      {/* Error Modal */}
      <ConfirmationModal
        isOpen={!!error} // Open modal if error exists
        onClose={handleCloseErrorModal}
        title="Error"
        message={typeof error === 'string' ? error : (error as any)?.message || 'An unexpected error occurred while fetching reports.'}
        isAlert={true}
        okText="OK"
      />
    </PageLayout>
  );
} 