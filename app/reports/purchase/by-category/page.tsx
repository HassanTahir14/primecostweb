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
import { getDefaultDateRange } from '@/utils/dateUtils';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrencyValue } from '@/utils/currencyUtils';
import { useTranslation } from '@/context/TranslationContext';

export default function PurchaseByCategoryReportPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { currency } = useCurrency();
    const { t } = useTranslation();
    const [formattedAmounts, setFormattedAmounts] = useState<any>({});

    // State for filters
    const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDateRange();
    const [startDate, setStartDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(defaultEndDate);
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

    // Fetch data on first load when a category is selected
    useEffect(() => {
        if (selectedCategory) {
            dispatch(clearReportError('purchaseByCategory'));
            dispatch(fetchPurchaseByCategory({ 
                startDate, 
                endDate, 
                category: selectedCategory
            }));
        }
    }, [selectedCategory]); // Only run when category changes

    useEffect(() => {
        if (data && currency) {
            const formatAmounts = async () => {
                try {
                    const amounts: {[key: string]: string} = {};
                    for (const record of data) {
                        const key = `${record.itemName}-${record.date}`;
                        amounts[key] = await formatCurrencyValue(record.amount || 0, currency);
                    }
                    setFormattedAmounts(amounts);
                } catch (error) {
                    console.error('Error formatting amounts:', error);
                    setFormattedAmounts({});
                }
            };
            formatAmounts();
        }
    }, [data, currency]);

    // Update options to use category name as value
    const categoryOptions = [
        { value: '', label: t('purchaseReportsCategory.selectCategory'), disabled: true },
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
            category: selectedCategory
        }));
    };

    const handleCloseErrorModal = () => {
        dispatch(clearReportError('purchaseByCategory'));
    };

    // Column definitions moved inside component to access formattedAmounts
    const purchaseByCategoryColumns: ColumnDefinition<PurchaseByCategoryDetail>[] = [
        { 
            header: t('purchaseReportsCategory.colItemName'), 
            accessorKey: 'itemName',
            cell: (value) => (value as string).split('@')[0]
        },
        { header: t('purchaseReportsCategory.colQuantity'), accessorKey: 'quantity' },
        { header: t('purchaseReportsCategory.colUnit'), accessorKey: 'unit' },
        { header: t('purchaseReportsCategory.colDate'), accessorKey: 'date' },
        { 
            header: t('purchaseReportsCategory.colAmount'), 
            accessorKey: 'amount',
            cell: (value, record) => formattedAmounts[`${record.itemName}-${record.date}`] || t('purchaseReportsCategory.na')
        },
        { header: t('purchaseReportsCategory.colSupplier'), accessorKey: 'supplierName' },
    ];

    return (
        <PageLayout title={t('purchaseReportsCategory.pageTitle')}>
            <div className="mb-4">
                <Link href="/reports/purchase" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
                    <ArrowLeft size={20} />
                    <span>{t('purchaseReportsCategory.backToPurchaseReports')}</span>
                </Link>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <Input 
                        label={t('purchaseReportsCategory.labelStartDate')}
                        type="date"
                        name="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <Input 
                        label={t('purchaseReportsCategory.labelEndDate')}
                        type="date"
                        name="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                     <Select 
                        label={t('purchaseReportsCategory.labelCategory')}
                        name="category"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        options={categoryOptions}
                        disabled={categoriesLoading || loading}
                     />
                    <Button onClick={handleFetchReport} disabled={loading || !selectedCategory}>
                        {loading ? t('purchaseReportsCategory.loading') : t('purchaseReportsCategory.fetchReport')}
                    </Button>
                </div>
                 {validationError && (
                    <p className="mt-2 text-sm text-red-600">{validationError}</p>
                )}
            </div>

            {/* Report Table Section */}
            <ReportTypeTable
                title={t('purchaseReportsCategory.tableTitle')}
                data={data}
                columns={purchaseByCategoryColumns}
                isLoading={loading}
                // Add pagination props if needed, based on API response structure
            />

            {/* Error Modal */}
            <ConfirmationModal
                isOpen={!!error}
                onClose={handleCloseErrorModal}
                title={t('purchaseReportsCategory.errorTitle')}
                message={typeof error === 'string' ? error : (error as any)?.message || t('purchaseReportsCategory.errorMsg')}
                isAlert={true}
                okText={t('purchaseReportsCategory.ok')}
            />
        </PageLayout>
    );
}