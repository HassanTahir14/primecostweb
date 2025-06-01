'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import { AppDispatch, RootState } from '@/store/store';
import { useTranslation } from '@/context/TranslationContext';
import {
    fetchPreparedItems,
    clearRecipeReportError,
} from '@/store/recipeReportsSlice';
// **Placeholder** 
// import { PreparedItemsDetail } from '@/store/recipeReportsApi'; 
import ReportTypeTable, { ColumnDefinition } from '@/components/reports/ReportTypeTable';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getDefaultDateRange } from '@/utils/dateUtils';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrencyValue } from '@/utils/currencyUtils';

export default function PreparedItemsReportPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { currency } = useCurrency();
    const [formattedCosts, setFormattedCosts] = useState<any>({});
    const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDateRange();
    const [startDate, setStartDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(defaultEndDate);
    const [validationError, setValidationError] = useState<string | null>(null);
    const { data, loading, error } = useSelector((state: RootState) => state.recipeReports.preparedItems);
    const { t } = useTranslation();
    // Fetch data on first load
    useEffect(() => {
        dispatch(clearRecipeReportError('preparedItems'));
        dispatch(fetchPreparedItems({ startDate, endDate, sortBy: "preparedDate", direction: "desc", page: 0, size: 1000 }));
    }, []); // Empty dependency array means this runs once on mount

    useEffect(() => {
        if (data && currency) {
            const formatCosts = async () => {
                try {
                    const costs: {[key: string]: string} = {};
                    const details = Array.isArray(data) ? data : (data && typeof data === 'object' && 'details' in data ? data.details : []);
                    
                    for (const record of details) {
                        const key = `${record.itemName}-${record.preparedDate}`;
                        costs[key] = await formatCurrencyValue(record.itemCost || 0, currency);
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
        dispatch(clearRecipeReportError('preparedItems'));
        dispatch(fetchPreparedItems({ startDate, endDate, sortBy: "preparedDate", direction: "desc", page: 0, size: 1000 }));
    };

    const handleCloseErrorModal = () => {
        dispatch(clearRecipeReportError('preparedItems'));
    };

    // Column definitions moved inside component to access formattedCosts
    const preparedItemsColumns: ColumnDefinition<any>[] = [
        { header: 'Employee Name', accessorKey: 'employeeName' },
        { header: 'Item Name', accessorKey: 'itemName' },
        { header: 'Category', accessorKey: 'category' },
        { header: 'Batch Number', accessorKey: 'batchNumber' },
        { 
            header: 'Quantity (Unit)',
            accessorKey: 'quantityPrepared',
            cell: (v, row) => {
                let unit = '';
                if (row.unitOfMeasurement && typeof row.unitOfMeasurement === 'string') {
                    if (row.unitOfMeasurement.startsWith('37@recipecost')) {
                        unit = 'KG';
                    }
                }
                return `${parseFloat(v).toFixed(2)}${unit ? ' ' + unit : ''}`;
            }
        },
        { 
            header: 'Item Cost', 
            accessorKey: 'itemCost',
            cell: (value, record) => formattedCosts[`${record.itemName}-${record.preparedDate}`] || 'N/A'
        },
        { header: 'Storage Location', accessorKey: 'storageLocation' },
        { header: 'Branch', accessorKey: 'branch' },
        { 
            header: 'Prepared Date', 
            accessorKey: 'preparedDate',
            cell: (v) => new Date(v).toLocaleDateString()
        },
        { 
            header: 'Expiration Date', 
            accessorKey: 'expirationDate',
            cell: (v) => new Date(v).toLocaleDateString()
        },
        { header: 'Status', accessorKey: 'preparationStatus' }
    ];

    return (
        <PageLayout title="Prepared Items Report">
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
                        {loading ? t('common.loading') : t('common.fetchReport')}
                    </Button>
                </div>
                 {validationError && (<p className="mt-2 text-sm text-red-600">{validationError}</p>)}
            </div>
            {/* Report Table Section */}
            <ReportTypeTable
                title="Prepared Items Details"
                data={Array.isArray(data) ? data : (data && typeof data === 'object' && 'details' in data ? data.details : [])}
                columns={preparedItemsColumns}
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