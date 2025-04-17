'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import NonConformanceReportForm from '@/components/non-conformance/NonConformanceReportForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ConfirmationModal from '@/components/common/ConfirmationModal'; // For feedback

export default function CreateNonConformanceReportPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Feedback Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFormSubmit = async (formData: any) => {
    setIsLoading(true);
    console.log('Form Data Submitted:', formData);
    // Replace with actual API call/Redux dispatch
    try {
      // Mock success
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      setIsSuccess(true);
      setModalMessage('Non-conformance report submitted successfully!');
      setModalOpen(true);
      // Don't redirect immediately, wait for modal confirmation
    } catch (error) {
        console.error('Submission failed:', error);
        setIsSuccess(false);
        setModalMessage('Failed to submit report. Please try again.');
        setModalOpen(true);
    } finally {
        setIsLoading(false);
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