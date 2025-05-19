'use client';

import React, { useState, useEffect } from 'react';
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
import { getDefaultDateRange } from '@/utils/dateUtils';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrencyValue } from '@/utils/currencyUtils';
import { useTranslation } from '@/context/TranslationContext';

export default function YieldAnalysisReportPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { currency } = useCurrency();
    const { t } = useTranslation();
    const [formattedCosts, setFormattedCosts] = useState<any>({});
    const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDateRange();
    const [startDate, setStartDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(defaultEndDate);
    const [validationError, setValidationError] = useState<string | null>(null);
    const { data, loading, error } = useSelector((state: RootState) => state.recipeReports.yieldAnalysis);

    // Fetch data on first load
    useEffect(() => {
        dispatch(clearRecipeReportError('yieldAnalysis'));
        dispatch(fetchYieldAnalysis({ startDate, endDate, sortBy: "preparedDate" }));
    }, []); // Empty dependency array means this runs once on mount

    useEffect(() => {
        if (data && currency) {
            const formatCosts = async () => {
                try {
                    const costs: {[key: string]: string} = {};
                    const details = Array.isArray(data) ? data : (data && typeof data === 'object' && 'details' in data ? data.details : []);
                    
                    for (const record of details) {
                        const key = `${record.itemName}-${record.preparedDate}`;
                        costs[`${key}-yield`] = await formatCurrencyValue(record.yieldCost || 0, currency);
                        costs[`${key}-waste`] = await formatCurrencyValue(record.wasteCost || 0, currency);
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
        dispatch(clearRecipeReportError('yieldAnalysis')); 
        dispatch(fetchYieldAnalysis({ startDate, endDate, sortBy: "preparedDate" }));
    };

    const handleCloseErrorModal = () => {
        dispatch(clearRecipeReportError('yieldAnalysis'));
    };

    // Column definitions moved inside component to access formattedCosts
    const yieldAnalysisColumns: ColumnDefinition<any>[] = [
        { header: t('recipeYieldAnalysis.colItemName'), accessorKey: 'itemName' },
        { header: t('recipeYieldAnalysis.colQuantityUsed'), accessorKey: 'quantityUsed' },
        { header: t('recipeYieldAnalysis.colYieldPercent'), accessorKey: 'percentageYield' },
        { header: t('recipeYieldAnalysis.colWastePercent'), accessorKey: 'wastePercentage' },
        { header: t('recipeYieldAnalysis.colYieldQuantity'), accessorKey: 'yieldQuantity' },
        { 
            header: t('recipeYieldAnalysis.colYieldCost'), 
            accessorKey: 'yieldCost',
            cellClassName: 'text-right',
            cell: (value, record) => formattedCosts[`${record.itemName}-${record.preparedDate}-yield`] || t('recipeYieldAnalysis.na')
        },
        { header: t('recipeYieldAnalysis.colWasteQuantity'), accessorKey: 'wasteQuantity' },
        { 
            header: t('recipeYieldAnalysis.colWasteCost'), 
            accessorKey: 'wasteCost',
            cellClassName: 'text-right',
            cell: (value, record) => formattedCosts[`${record.itemName}-${record.preparedDate}-waste`] || t('recipeYieldAnalysis.na')
        }
    ];

    return (
        <PageLayout title={t('recipeYieldAnalysis.pageTitle')}>
             <div className="mb-4">
                <Link href="/reports/recipe" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
                    <ArrowLeft size={20} />
                    <span>{t('recipeYieldAnalysis.backToRecipeReports')}</span>
                </Link>
            </div>
            {/* Filters Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <Input 
                        label={t('recipeYieldAnalysis.labelStartDate')} type="date" name="startDate"
                        value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    />
                    <Input 
                        label={t('recipeYieldAnalysis.labelEndDate')} type="date" name="endDate"
                        value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    />
                    <Button onClick={handleFetchReport} disabled={loading}>
                        {loading ? t('recipeYieldAnalysis.loading') : t('recipeYieldAnalysis.fetchReport')}
                    </Button>
                </div>
                 {validationError && (<p className="mt-2 text-sm text-red-600">{validationError}</p>)}
            </div>
            {/* Report Table Section */}
            <ReportTypeTable
                title={t('recipeYieldAnalysis.tableTitle')}
                data={Array.isArray(data) ? data : (data && typeof data === 'object' && 'details' in data ? data.details : [])}
                columns={yieldAnalysisColumns}
                isLoading={loading}
            />
            {/* Error Modal */}
            <ConfirmationModal
                isOpen={!!error} onClose={handleCloseErrorModal} title={t('recipeYieldAnalysis.errorTitle')}
                message={typeof error === 'string' ? error : (error as any)?.message || t('recipeYieldAnalysis.errorMsg')}
                isAlert={true} okText={t('recipeYieldAnalysis.ok')}
            />
        </PageLayout>
    );
}