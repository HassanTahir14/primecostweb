'use client';

import React, { useState, useEffect } from 'react';
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
import { getDefaultDateRange } from '@/utils/dateUtils';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrencyValue } from '@/utils/currencyUtils';
import { useTranslation } from '@/context/TranslationContext';

// --- !!! PLACEHOLDER COLUMN DEFINITION !!! ---
// --- Update this based on the actual API response for Profit Margin ---
const profitMarginColumns: ColumnDefinition<any>[] = [
    { header: 'Recipe Name', accessorKey: 'recipeName' },
    { 
        header: 'Cost Per Recipe', 
        accessorKey: 'costPerRecipe',
        cell: (v) => parseFloat(v).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    },
    { 
        header: 'Cost Per Portion', 
        accessorKey: 'costPerPortion',
        cell: (v) => parseFloat(v).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    },
    { 
        header: 'Profit Margin Per Portion', 
        accessorKey: 'profitMarginPerPortion',
        cell: (v) => parseFloat(v).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    }
];
// --- !!! END PLACEHOLDER !!! ---


export default function ProfitMarginReportPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { currency } = useCurrency();
    const { t } = useTranslation();
    const [formattedCosts, setFormattedCosts] = useState<any>({});
    const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDateRange();
    const [startDate, setStartDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(defaultEndDate);
    const [validationError, setValidationError] = useState<string | null>(null);
    const { data, loading, error } = useSelector((state: RootState) => state.recipeReports.profitMargin);

    // Fetch data on first load
    useEffect(() => {
        dispatch(clearRecipeReportError('profitMargin'));
        dispatch(fetchProfitMargin({ startDate, endDate, sortBy: "preparedDate", direction: "desc",  page: 0, size: 1000 }));
    }, []); // Empty dependency array means this runs once on mount

    useEffect(() => {
        if (data && currency) {
            const formatCosts = async () => {
                try {
                    const costs: {[key: string]: string} = {};
                    const details = Array.isArray(data) ? data : (data && typeof data === 'object' && 'details' in data ? data.details : []);
                    
                    for (const record of details) {
                        const key = `${record.recipeName}-${record.preparedDate}`;
                        costs[`${key}-recipe`] = await formatCurrencyValue(record.costPerRecipe || 0, currency);
                        costs[`${key}-portion`] = await formatCurrencyValue(record.costPerPortion || 0, currency);
                        costs[`${key}-profit`] = await formatCurrencyValue(record.profitMarginPerPortion || 0, currency);
                    }
                    setFormattedCosts(costs);
                } catch (error) {
                    console.error('Error formatting costs:', error);
                    setFormattedCosts({});
                }
            };
            formatCosts();
        }
    }, [data, currency]);

    const handleFetchReport = () => {
        if (!startDate || !endDate) {
            setValidationError('Please select both a Start Date and End Date.');
            return;
        }
        setValidationError(null);
        dispatch(clearRecipeReportError('profitMargin'));
        dispatch(fetchProfitMargin({ startDate, endDate, sortBy: "preparedDate", direction: "desc", page: 0, size: 1000 }));
    };

     const handleCloseErrorModal = () => {
        dispatch(clearRecipeReportError('profitMargin'));
    };

    // Column definitions moved inside component to access formattedCosts
    const profitMarginColumns: ColumnDefinition<any>[] = [
        { header: t('recipeProfitMargin.colRecipeName'), accessorKey: 'recipeName' },
        { 
            header: t('recipeProfitMargin.colCostPerRecipe'), 
            accessorKey: 'costPerRecipe',
            cell: (value, record) => formattedCosts[`${record.recipeName}-${record.preparedDate}-recipe`] || t('recipeProfitMargin.na')
        },
        { 
            header: t('recipeProfitMargin.colCostPerPortion'), 
            accessorKey: 'costPerPortion',
            cell: (value, record) => formattedCosts[`${record.recipeName}-${record.preparedDate}-portion`] || t('recipeProfitMargin.na')
        },
        { 
            header: t('recipeProfitMargin.colProfitMarginPerPortion'), 
            accessorKey: 'profitMarginPerPortion',
            cell: (value, record) => formattedCosts[`${record.recipeName}-${record.preparedDate}-profit`] || t('recipeProfitMargin.na')
        }
    ];

    return (
        <PageLayout title={t('recipeProfitMargin.pageTitle')}>
             <div className="mb-4">
                <Link href="/reports/recipe" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
                    <ArrowLeft size={20} />
                    <span>{t('recipeProfitMargin.backToRecipeReports')}</span>
                </Link>
            </div>
            {/* Filters Section */}
             <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <Input 
                        label={t('recipeProfitMargin.labelStartDate')} type="date" name="startDate"
                        value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    />
                    <Input 
                        label={t('recipeProfitMargin.labelEndDate')} type="date" name="endDate"
                        value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    />
                    <Button onClick={handleFetchReport} disabled={loading}>
                        {loading ? t('recipeProfitMargin.loading') : t('recipeProfitMargin.fetchReport')}
                    </Button>
                </div>
                 {validationError && (<p className="mt-2 text-sm text-red-600">{validationError}</p>)}
            </div>
            {/* Report Table Section */}
            <ReportTypeTable
                title={t('recipeProfitMargin.tableTitle')}
                data={Array.isArray(data) ? data : (data && typeof data === 'object' && 'details' in data ? data.details : [])}
                columns={profitMarginColumns}
                isLoading={loading}
            />
             {/* Error Modal */}
            <ConfirmationModal
                isOpen={!!error} onClose={handleCloseErrorModal} title={t('recipeProfitMargin.errorTitle')}
                message={typeof error === 'string' ? error : (error as any)?.message || t('recipeProfitMargin.errorMsg')}
                isAlert={true} okText={t('recipeProfitMargin.ok')}
            />
        </PageLayout>
    );
}