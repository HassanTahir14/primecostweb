'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import { AppDispatch, RootState } from '@/store/store';
import {
    fetchRejectedPOs,
    clearReportError,
} from '@/store/purchaseReportsSlice';
import { RejectedPODetail } from '@/store/purchaseReportsApi';
import ReportTypeTable, { ColumnDefinition } from '@/components/reports/ReportTypeTable';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Column Definitions for Rejected POs
const rejectedPOColumns: ColumnDefinition<RejectedPODetail>[] = [
    { 
        header: 'Item Name', 
        accessorKey: 'itemName',
        cell: (value) => {
            const itemName = value as string;
            return itemName.split('@')[0];
        }
    },
    { header: 'Quantity', accessorKey: 'quantity', cellClassName: 'text-right' },
    { header: 'Unit', accessorKey: 'unit', cellClassName: 'text-center' },
    { header: 'Date', accessorKey: 'dated', cellClassName: 'text-center' },
    { header: 'Reason', accessorKey: 'reason' },
];

export default function RejectedPurchaseOrdersReportPage() {
    const dispatch = useDispatch<AppDispatch>();

    // State for filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);

    // Get report state from Redux
    const { data, loading, error } = useSelector((state: RootState) => state.purchaseReports.rejectedPOs);

    const handleFetchReport = () => {
        // Basic validation
        if (!startDate || !endDate) {
            setValidationError('Please select both a Start Date and End Date.');
            return;
        }
        setValidationError(null);
        dispatch(clearReportError('rejectedPOs')); // Clear previous errors
        dispatch(fetchRejectedPOs({ startDate, endDate }));
    };

    const handleCloseErrorModal = () => {
        dispatch(clearReportError('rejectedPOs'));
    };

    return (
        <PageLayout title="Rejected Purchase Orders Report">
             <div className="mb-4">
                <Link href="/reports/purchase" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
                    <ArrowLeft size={20} />
                    <span>Back to Purchase Reports</span>
                </Link>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <Input 
                        label="Start Date"
                        type="date"
                        name="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <Input 
                        label="End Date"
                        type="date"
                        name="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                    <Button onClick={handleFetchReport} disabled={loading}>
                        {loading ? 'Loading...' : 'Fetch Report'}
                    </Button>
                </div>
                 {validationError && (
                    <p className="mt-2 text-sm text-red-600">{validationError}</p>
                )}
            </div>

            {/* Report Table Section */}
            <ReportTypeTable
                title="Rejected Purchase Orders"
                data={data}
                columns={rejectedPOColumns}
                isLoading={loading}
                // Pass additional props like pagination controls if needed
            />

            {/* Error Modal */}
            <ConfirmationModal
                isOpen={!!error}
                onClose={handleCloseErrorModal}
                title="Error"
                message={typeof error === 'string' ? error : (error as any)?.message || 'An error occurred fetching the report.'}
                isAlert={true}
                okText="OK"
            />
        </PageLayout>
    );
} 