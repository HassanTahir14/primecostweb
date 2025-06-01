'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import { AppDispatch, RootState } from '@/store/store';
import {
    fetchFoodCost,
    clearRecipeReportError,
} from '@/store/recipeReportsSlice';
// **Placeholder** 
// import { FoodCostDetail } from '@/store/recipeReportsApi'; 
import ReportTypeTable, { ColumnDefinition } from '@/components/reports/ReportTypeTable';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getDefaultDateRange } from '@/utils/dateUtils';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrencyValue } from '@/utils/currencyUtils';
import { useTranslation } from '@/context/TranslationContext';

export default function FoodCostReportPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { currency } = useCurrency();
    const { t } = useTranslation();
    const [formattedCosts, setFormattedCosts] = useState<any>({});
    const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDateRange();
    const [startDate, setStartDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(defaultEndDate);
    const [validationError, setValidationError] = useState<string | null>(null);
    const { data, loading, error } = useSelector((state: RootState) => state.recipeReports.foodCost);

    // Fetch data on first load
    useEffect(() => {
        dispatch(clearRecipeReportError('foodCost'));
        dispatch(fetchFoodCost({ startDate, endDate, sortBy: "preparedDate", direction: "desc", page: 0, size: 1000 }));
    }, []); // Empty dependency array means this runs once on mount

    useEffect(() => {
        if (data && currency) {
            const formatCosts = async () => {
                try {
                    const costs: {[key: string]: string} = {};
                    const details = Array.isArray(data) ? data : (data && typeof data === 'object' && 'details' in data ? data.details : []);
                    
                    for (const record of details) {
                        const key = `${record.recipeName}`;
                        costs[key] = await formatCurrencyValue(parseFloat(record.idealSellingPrice) || 0, currency);
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
        dispatch(clearRecipeReportError('foodCost'));
        dispatch(fetchFoodCost({ startDate, endDate, sortBy: "preparedDate", direction: "desc", page: 0, size: 1000 }));
    };

    const handleCloseErrorModal = () => {
        dispatch(clearRecipeReportError('foodCost'));
    };

    // Column definitions moved inside component to access formattedCosts
    const foodCostColumns: ColumnDefinition<any>[] = [
        { header: t('recipeFoodCost.colRecipeName'), accessorKey: 'recipeName' },
        { 
            header: t('recipeFoodCost.colBudgetFoodCost'), 
            accessorKey: 'foodCostBudget',
            cell: (v) => v // Keep as is since it's already a percentage
        },
        { 
            header: t('recipeFoodCost.colActualFoodCost'), 
            accessorKey: 'foodCostActual',
            cell: (v) => v // Keep as is since it's already a percentage
        },
        { 
            header: t('recipeFoodCost.colIdealSellingPrice'), 
            accessorKey: 'idealSellingPrice',
            cell: (value, record) => formattedCosts[record.recipeName] || t('recipeFoodCost.na')
        }
    ];

    return (
        <PageLayout title={t('recipeFoodCost.pageTitle')}>
            <div className="mb-4">
                <Link href="/reports/recipe" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
                    <ArrowLeft size={20} />
                    <span>{t('recipeFoodCost.backToRecipeReports')}</span>
                </Link>
            </div>
            {/* Filters Section */}
             <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <Input 
                        label={t('recipeFoodCost.labelStartDate')} type="date" name="startDate"
                        value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    />
                    <Input 
                        label={t('recipeFoodCost.labelEndDate')} type="date" name="endDate"
                        value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    />
                    <Button onClick={handleFetchReport} disabled={loading}>
                        {loading ? t('recipeFoodCost.loading') : t('recipeFoodCost.fetchReport')}
                    </Button>
                </div>
                 {validationError && (<p className="mt-2 text-sm text-red-600">{validationError}</p>)}
            </div>
            {/* Report Table Section */}
            <ReportTypeTable
                title={t('recipeFoodCost.tableTitle')}
                data={Array.isArray(data) ? data : (data && typeof data === 'object' && 'details' in data ? data.details : [])}
                columns={foodCostColumns}
                isLoading={loading}
            />
             {/* Error Modal */}
            <ConfirmationModal
                isOpen={!!error} onClose={handleCloseErrorModal} title={t('recipeFoodCost.errorTitle')}
                message={typeof error === 'string' ? error : (error as any)?.message || t('recipeFoodCost.errorMsg')}
                isAlert={true} okText={t('recipeFoodCost.ok')}
            />
        </PageLayout>
    );
}