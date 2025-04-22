'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import { AppDispatch, RootState } from '@/store/store';
import {
    fetchItemsBySupplier,
    clearReportError,
} from '@/store/purchaseReportsSlice';
import { ItemsBySupplierDetail } from '@/store/purchaseReportsApi';
import ReportTypeTable, { ColumnDefinition } from '@/components/reports/ReportTypeTable';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Column Definitions for Items by Supplier
const itemsBySupplierColumns: ColumnDefinition<ItemsBySupplierDetail>[] = [
    { header: 'Item Name', accessorKey: 'itemName' },
    { header: 'Quantity', accessorKey: 'quantity', cellClassName: 'text-right' },
    { header: 'Unit', accessorKey: 'unit', cellClassName: 'text-center' },
    { header: 'Date', accessorKey: 'date', cellClassName: 'text-center' },
    { header: 'Amount', accessorKey: 'amount', cellClassName: 'text-right', cell: (value) => value?.toFixed(2) ?? 'N/A' }, 
    { header: 'PO Status', accessorKey: 'purchaseOrderStatus', cellClassName: 'text-center' },
];

export default function ItemsBySupplierReportPage() {
    const dispatch = useDispatch<AppDispatch>();

    // State for filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);

    // Get report state from Redux
    const { data, loading, error, totalItems, totalCost } = useSelector((state: RootState) => state.purchaseReports.itemsBySupplier);

    const handleFetchReport = () => {
        if (!startDate || !endDate) {
            setValidationError('Please select both a Start Date and End Date.');
            return;
        }
        setValidationError(null);
        dispatch(clearReportError('itemsBySupplier'));
        dispatch(fetchItemsBySupplier({ startDate, endDate }));
    };

    const handleCloseErrorModal = () => {
        dispatch(clearReportError('itemsBySupplier'));
    };

    // Construct dynamic title including totals
    const tableTitle = `Items Purchased by Supplier (Total Items: ${totalItems ?? 0}, Total Cost: ${totalCost?.toFixed(2) ?? '0.00'})`;

    return (
        <PageLayout title="Items Purchased by Supplier Report">
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
                title={tableTitle} // Use dynamic title
                data={data}
                columns={itemsBySupplierColumns}
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