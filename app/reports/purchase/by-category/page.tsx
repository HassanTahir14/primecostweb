'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import Select from '@/components/common/select';
import { AppDispatch, RootState } from '@/store/store';
import {
    fetchPurchaseByCategory,
    clearReportError,
} from '@/store/purchaseReportsSlice';
import { PurchaseByCategoryDetail } from '@/store/purchaseReportsApi';
import { fetchAllCategories, ItemCategory } from '@/store/itemCategorySlice';
import ReportTypeTable, { ColumnDefinition } from '@/components/reports/ReportTypeTable';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Column Definitions for Purchase by Category
const purchaseByCategoryColumns: ColumnDefinition<PurchaseByCategoryDetail>[] = [
    // Define based on assumed successful response structure
    { header: 'Item Name', accessorKey: 'itemName' },
    { header: 'Quantity', accessorKey: 'quantity', cellClassName: 'text-right' },
    { header: 'Unit', accessorKey: 'unit', cellClassName: 'text-center' },
    { header: 'Date', accessorKey: 'date', cellClassName: 'text-center' },
    { header: 'Amount', accessorKey: 'amount', cellClassName: 'text-right', cell: (value) => value?.toFixed(2) ?? 'N/A' },
    { header: 'Supplier', accessorKey: 'supplierName' },
];

export default function PurchaseByCategoryReportPage() {
    const dispatch = useDispatch<AppDispatch>();

    // State for filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [validationError, setValidationError] = useState<string | null>(null);

    // Get report state from Redux
    const { data, loading, error } = useSelector((state: RootState) => state.purchaseReports.purchaseByCategory);
    
    // Fetch categories for the dropdown
    const { categories, loading: categoriesLoading } = useSelector((state: RootState) => state.itemCategory);
    useEffect(() => {
        if (!categories || categories.length === 0) {
            dispatch(fetchAllCategories());
        }
    }, [dispatch, categories]);

    // Update options to use category name as value
    const categoryOptions = [
        { value: '', label: 'Select Category', disabled: true },
        ...(categories?.map((cat: ItemCategory) => ({ 
            value: cat.name, // Use name as value
            label: cat.name 
        })) || [])
    ];

    const handleFetchReport = () => {
        // Basic validation
        if (!startDate || !endDate || !selectedCategory) {
            let errorMsg = 'Please select: ';
            const missing = [];
            if (!startDate) missing.push('Start Date');
            if (!endDate) missing.push('End Date');
            if (!selectedCategory) missing.push('Category');
            setValidationError(errorMsg + missing.join(', ') + '.');
            return;
        }
        setValidationError(null);
        dispatch(clearReportError('purchaseByCategory'));
        dispatch(fetchPurchaseByCategory({ 
            startDate, 
            endDate, 
            category: selectedCategory // Pass name
        }));
    };

    const handleCloseErrorModal = () => {
        dispatch(clearReportError('purchaseByCategory'));
    };

    return (
        <PageLayout title="Purchase by Category Report">
            <div className="mb-4">
                <Link href="/reports/purchase" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
                    <ArrowLeft size={20} />
                    <span>Back to Purchase Reports</span>
                </Link>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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
                     <Select 
                        label="Category"
                        name="category"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        options={categoryOptions}
                        disabled={categoriesLoading || loading}
                     />
                    <Button onClick={handleFetchReport} disabled={loading || !selectedCategory}>
                        {loading ? 'Loading...' : 'Fetch Report'}
                    </Button>
                </div>
                 {validationError && (
                    <p className="mt-2 text-sm text-red-600">{validationError}</p>
                )}
            </div>

            {/* Report Table Section */}
            <ReportTypeTable
                title="Purchase Details by Category"
                data={data}
                columns={purchaseByCategoryColumns}
                isLoading={loading}
                // Add pagination props if needed, based on API response structure
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