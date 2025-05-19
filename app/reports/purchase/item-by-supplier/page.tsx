'use client';

import React, { useState, useEffect } from 'react';
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
import { getDefaultDateRange } from '@/utils/dateUtils';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrencyValue } from '@/utils/currencyUtils';
import { useTranslation } from '@/context/TranslationContext';

export default function ItemsBySupplierReportPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { currency } = useCurrency();
    const { t } = useTranslation();
    const [formattedAmounts, setFormattedAmounts] = useState<any>({});
    const [formattedTotalCost, setFormattedTotalCost] = useState<string>('N/A');

    // State for filters
    const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDateRange();
    const [startDate, setStartDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(defaultEndDate);
    const [validationError, setValidationError] = useState<string | null>(null);

    // Get report state from Redux
    const { data, loading, error, totalItems, totalCost } = useSelector((state: RootState) => state.purchaseReports.itemsBySupplier);

    // Fetch data on first load
    useEffect(() => {
        dispatch(clearReportError('itemsBySupplier'));
        dispatch(fetchItemsBySupplier({ startDate, endDate }));
    }, []); // Empty dependency array means this runs once on mount

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

                    // Format total cost
                    if (totalCost !== undefined) {
                        const formattedTotal = await formatCurrencyValue(totalCost, currency);
                        setFormattedTotalCost(formattedTotal);
                    }
                } catch (error) {
                    console.error('Error formatting amounts:', error);
                    setFormattedAmounts({});
                    setFormattedTotalCost('N/A');
                }
            };
            formatAmounts();
        }
    }, [data, currency, totalCost]);

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

    // Column definitions moved inside component to access formattedAmounts
    const itemsBySupplierColumns: ColumnDefinition<ItemsBySupplierDetail>[] = [
        { 
            header: t('purchaseReportsSupplier.colItemName'), 
            accessorKey: 'itemName',
            cell: (value) => (value as string).split('@')[0]
        },
        { header: t('purchaseReportsSupplier.colQuantity'), accessorKey: 'quantity' },
        { header: t('purchaseReportsSupplier.colUnit'), accessorKey: 'unit' },
        { header: t('purchaseReportsSupplier.colDate'), accessorKey: 'date' },
        { 
            header: t('purchaseReportsSupplier.colAmount'), 
            accessorKey: 'amount',
            cell: (value, record) => formattedAmounts[`${record.itemName}-${record.date}`] || t('purchaseReportsSupplier.na')
        },
        { header: t('purchaseReportsSupplier.colPOStatus'), accessorKey: 'purchaseOrderStatus' },
    ];

    // Update table title to use formatted total cost
    const tableTitle = t('purchaseReportsSupplier.tableTitle', { totalItems: totalItems ?? 0, totalCost: formattedTotalCost });

    return (
        <PageLayout title={t('purchaseReportsSupplier.pageTitle')}>
             <div className="mb-4">
                <Link href="/reports/purchase" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
                    <ArrowLeft size={20} />
                    <span>{t('purchaseReportsSupplier.backToPurchaseReports')}</span>
                </Link>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <Input 
                        label={t('purchaseReportsSupplier.labelStartDate')}
                        type="date"
                        name="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <Input 
                        label={t('purchaseReportsSupplier.labelEndDate')}
                        type="date"
                        name="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                    <Button onClick={handleFetchReport} disabled={loading}>
                        {loading ? t('purchaseReportsSupplier.loading') : t('purchaseReportsSupplier.fetchReport')}
                    </Button>
                </div>
                 {validationError && (
                    <p className="mt-2 text-sm text-red-600">{validationError}</p>
                )}
            </div>
            <ReportTypeTable
                title={tableTitle}
                data={data}
                columns={itemsBySupplierColumns}
                isLoading={loading}
            />
            <ConfirmationModal
                isOpen={!!error}
                onClose={handleCloseErrorModal}
                title={t('purchaseReportsSupplier.errorTitle')}
                message={typeof error === 'string' ? error : (error as any)?.message || t('purchaseReportsSupplier.errorMsg')}
                isAlert={true}
                okText={t('purchaseReportsSupplier.ok')}
            />
        </PageLayout>
    );
}