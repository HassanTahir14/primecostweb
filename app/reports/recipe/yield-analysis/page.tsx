'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import { AppDispatch, RootState } from '@/store/store';
import {
    fetchYieldAnalysis,
    clearRecipeReportError,
} from '@/store/recipeReportsSlice';
// **Placeholder** - Update with actual data interface if known
// import { YieldAnalysisDetail } from '@/store/recipeReportsApi'; 
import ReportTypeTable, { ColumnDefinition } from '@/components/reports/ReportTypeTable';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// --- !!! PLACEHOLDER COLUMN DEFINITION !!! ---
// --- Update this based on the actual API response for Yield Analysis ---
const yieldAnalysisColumns: ColumnDefinition<any>[] = [
    { header: 'Recipe Name', accessorKey: 'recipeName' }, // Example field
    { header: 'Expected Yield', accessorKey: 'expectedYield', cellClassName: 'text-right' }, // Example field
    { header: 'Actual Yield', accessorKey: 'actualYield', cellClassName: 'text-right' }, // Example field
    { header: 'Variance (%)', accessorKey: 'variancePercentage', cellClassName: 'text-right' }, // Example field
    // Add more columns based on the actual API response
];
// --- !!! END PLACEHOLDER !!! ---


export default function YieldAnalysisReportPage() {
    const dispatch = useDispatch<AppDispatch>();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);
    const { data, loading, error } = useSelector((state: RootState) => state.recipeReports.yieldAnalysis);

    const handleFetchReport = () => {
        if (!startDate || !endDate) {
            setValidationError('Please select both a Start Date and End Date.');
            return;
        }
        setValidationError(null);
        dispatch(clearRecipeReportError('yieldAnalysis')); 
        dispatch(fetchYieldAnalysis({ startDate, endDate }));
    };

    const handleCloseErrorModal = () => {
        dispatch(clearRecipeReportError('yieldAnalysis'));
    };

    return (
        <PageLayout title="Yield Analysis Report">
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
                title="Yield Analysis"
                data={data}
                columns={yieldAnalysisColumns} // Use placeholder columns
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