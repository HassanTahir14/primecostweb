'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import { AppDispatch, RootState } from '@/store/store';
import {
    fetchItemExpiries,
    clearReportError,
} from '@/store/purchaseReportsSlice';
import { ItemExpiryDetail } from '@/store/purchaseReportsApi';
import ReportTypeTable, { ColumnDefinition } from '@/components/reports/ReportTypeTable';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Column Definitions for Item Expiry
const itemExpiryColumns: ColumnDefinition<ItemExpiryDetail>[] = [
    { 
        header: 'Item Name', 
        accessorKey: 'itemName',
        cell: (value) => {
            const itemName = value as string;
            return itemName.split('@')[0];
        }
    },
    { header: 'Date Added', accessorKey: 'dateAdded', cellClassName: 'text-center' },
    { header: 'Expiry Date', accessorKey: 'expiryDate', cellClassName: 'text-center font-medium', 
      cell: (value, row) => <span className={row.status === 'Expired' ? 'text-red-600' : 'text-gray-700'}>{value ?? 'N/A'}</span> },
    { header: 'Quantity', accessorKey: 'quantity', cellClassName: 'text-right' },
    { header: 'Storage Location', accessorKey: 'storageLocationName' },
    { header: 'Branch Name', accessorKey: 'branchName' },
    { header: 'Item Status', accessorKey: 'status', cellClassName: 'text-center', 
      cell: (value) => <span className={`px-2 py-0.5 rounded text-xs font-medium ${value === 'Expired' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{value ?? 'N/A'}</span> },
    { header: 'PO Status', accessorKey: 'purchaseOrderStatus', cellClassName: 'text-center' },
];

export default function ItemExpiryReportPage() {
    const dispatch = useDispatch<AppDispatch>();

    // State for filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);

    // Get report state from Redux
    const { data, loading, error } = useSelector((state: RootState) => state.purchaseReports.itemExpiries);

    const handleFetchReport = () => {
        if (!startDate || !endDate) {
            setValidationError('Please select both a Start Date and End Date.');
            return;
        }
        setValidationError(null);
        dispatch(clearReportError('itemExpiries'));
        dispatch(fetchItemExpiries({ startDate, endDate }));
    };

    const handleCloseErrorModal = () => {
        dispatch(clearReportError('itemExpiries'));
    };

    return (
        <PageLayout title="Item Expiry Report">
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
                title="Item Expiry Details"
                data={data}
                columns={itemExpiryColumns}
                isLoading={loading}
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