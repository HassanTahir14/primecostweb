'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import PageLayout from '@/components/PageLayout';
import NonConformanceReportForm from '@/components/non-conformance/NonConformanceReportForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { AppDispatch } from '@/store/store'; // Import AppDispatch
import { addNonConformanceReport, clearError } from '@/store/nonConformanceSlice'; // Import actions

export default function CreateNonConformanceReportPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>(); // Use AppDispatch
  const [isLoading, setIsLoading] = useState(false);
  
  // Feedback Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFormSubmit = async (formData: any) => {
    setIsLoading(true);
    dispatch(clearError()); // Clear previous errors
    console.log('Submitting Non Conformance Data:', formData);

    // --- Map form data to API payload --- 
    // Ensure names match the AddNonConformancePayload interface
    const payload = {
        orderNo: Number(formData.orderNo) || 0, // Convert to number
        supplierId: Number(formData.supplierId) || 0, // Convert to number
        branchId: Number(formData.branchId) || 0, // Convert to number
        date: formData.date, 
        description: formData.title, // Map form's title to API's description
        nonConformanceDescription: formData.description, // Map form's description to API's nonConformanceDescription
        correctiveAction: formData.correctiveAction, 
        impactOnDeliverySchedule: formData.impact, // Map form's impact to API's impactOnDeliverySchedule
        dateCloseOut: formData.dateCloseOut, // Add the missing dateCloseOut field
    };
    // --- End Mapping --- 

    try {
      const resultAction = await dispatch(addNonConformanceReport(payload));

      if (addNonConformanceReport.fulfilled.match(resultAction)) {
        setIsSuccess(true);
        setModalMessage(resultAction.payload?.description || 'Non-conformance report submitted successfully!');
      } else {
        // Handle rejected case (API error or validation error)
        setIsSuccess(false);
        const errorMsg = resultAction.payload as any; // Error payload from rejectWithValue
        setModalMessage(errorMsg?.message || errorMsg || 'Failed to submit report. Please check the details and try again.');
      }
    } catch (error) {
        // Catch unexpected errors during dispatch
        console.error('Submission failed unexpectedly:', error);
        setIsSuccess(false);
        setModalMessage('An unexpected error occurred. Please try again later.');
    } finally {
        setIsLoading(false);
        setModalOpen(true); // Open modal regardless of success/failure
    }
  };

  const handleCancel = () => {
    router.push('/non-conformance'); // Navigate back to the list page
  };

  const handleModalClose = () => {
    setModalOpen(false);
    if (isSuccess) {
        router.push('/non-conformance'); // Redirect after closing success modal
    }
  };

  return (
    <PageLayout title="Non Conformance Report">
      <div className="mb-4">
         <Link href="/non-conformance" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
            <ArrowLeft size={20} />
            <span>Back to Reports List</span>
          </Link>
      </div>
      <NonConformanceReportForm 
        onSubmit={handleFormSubmit} 
        onCancel={handleCancel} 
        isLoading={isLoading} 
      />
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        title={isSuccess ? 'Success' : 'Error'}
        message={modalMessage}
        isAlert={true}
        okText="OK"
       />
    </PageLayout>
  );
} 