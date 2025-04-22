'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import { AppDispatch, RootState } from '@/store/store';
import {
    fetchProfitMargin,
    clearRecipeReportError,
} from '@/store/recipeReportsSlice';
// **Placeholder** 
// import { ProfitMarginDetail } from '@/store/recipeReportsApi'; 
import ReportTypeTable, { ColumnDefinition } from '@/components/reports/ReportTypeTable';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// --- !!! PLACEHOLDER COLUMN DEFINITION !!! ---
// --- Update this based on the actual API response for Profit Margin ---
const profitMarginColumns: ColumnDefinition<any>[] = [
    { header: 'Recipe Name', accessorKey: 'recipeName' }, // Example
    { header: 'Selling Price', accessorKey: 'sellingPrice', cellClassName: 'text-right', cell: (v) => v?.toFixed(2) }, // Example
    { header: 'Food Cost', accessorKey: 'foodCost', cellClassName: 'text-right', cell: (v) => v?.toFixed(2) }, // Example
    { header: 'Profit Margin ($)', accessorKey: 'profitAmount', cellClassName: 'text-right', cell: (v) => v?.toFixed(2) }, // Example
    { header: 'Profit Margin (%)', accessorKey: 'profitPercentage', cellClassName: 'text-right', cell: (v) => v?.toFixed(2) + '%' }, // Example
    // Add more columns based on the actual API response
];
// --- !!! END PLACEHOLDER !!! ---


export default function ProfitMarginReportPage() {
    const dispatch = useDispatch<AppDispatch>();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);
    const { data, loading, error } = useSelector((state: RootState) => state.recipeReports.profitMargin);

    const handleFetchReport = () => {
        if (!startDate || !endDate) {
            setValidationError('Please select both a Start Date and End Date.');
            return;
        }
        setValidationError(null);
        dispatch(clearRecipeReportError('profitMargin')); 
        dispatch(fetchProfitMargin({ startDate, endDate }));
    };

     const handleCloseErrorModal = () => {
        dispatch(clearRecipeReportError('profitMargin'));
    };

    return (
        <PageLayout title="Profit Margin Report">
             <div className="mb-4">
                <Link href="/reports/recipe" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
                    <ArrowLeft size={20} />
                    <span>Back to Recipe Reports</span>
                </Link>
            </div>
            {/* Filters Section */}
             <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <Input 
                        label="Start Date" type="date" name="startDate"
                        value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    />
                    <Input 
                        label="End Date" type="date" name="endDate"
                        value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    />
                    <Button onClick={handleFetchReport} disabled={loading}>
                        {loading ? 'Loading...' : 'Fetch Report'}
                    </Button>
                </div>
                 {validationError && (<p className="mt-2 text-sm text-red-600">{validationError}</p>)}
            </div>
            {/* Report Table Section */}
            <ReportTypeTable
                title="Profit Margin Details"
                data={data}
                columns={profitMarginColumns} // Use placeholder columns
                isLoading={loading}
            />
             {/* Error Modal */}
            <ConfirmationModal
                isOpen={!!error} onClose={handleCloseErrorModal} title="Error"
                message={typeof error === 'string' ? error : (error as any)?.message || 'An error occurred fetching the report.'}
                isAlert={true} okText="OK"
            />
        </PageLayout>
    );
} 