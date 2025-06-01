'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import { AppDispatch, RootState } from '@/store/store';
import {
    fetchItemExpiries,
    clearReportError,
} from '@/store/purchaseReportsSlice';
import { ItemExpiryDetail } from '@/store/purchaseReportsApi';
import ReportTypeTable, { ColumnDefinition } from '@/components/reports/ReportTypeTable';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getDefaultDateRange } from '@/utils/dateUtils';
import { useTranslation } from '@/context/TranslationContext';

const ItemExpiryReportPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();

    // State for filters
    const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDateRange();
    const [startDate, setStartDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(defaultEndDate);
    const [validationError, setValidationError] = useState<string | null>(null);

    // Get report state from Redux
    const { data, loading, error } = useSelector((state: RootState) => state.purchaseReports.itemExpiries);

    // Fetch data on first load
    useEffect(() => {
        dispatch(clearReportError('itemExpiries'));
        dispatch(fetchItemExpiries({ startDate, endDate, "size": 1000, direction: "desc"}));
    }, []); // Empty dependency array means this runs once on mount

    const handleFetchReport = () => {
        if (!startDate || !endDate) {
            setValidationError('Please select both a Start Date and End Date.');
            return;
        }
        setValidationError(null);
        dispatch(clearReportError('itemExpiries'));
        dispatch(fetchItemExpiries({ startDate, endDate, "size": 1000,  direction: "desc" }));
    };

    const handleCloseErrorModal = () => {
        dispatch(clearReportError('itemExpiries'));
    };

    // Column Definitions for Item Expiry
    const itemExpiryColumns: ColumnDefinition<ItemExpiryDetail>[] = [
        { 
            header: t('purchaseReportsExpiry.colItemName'), 
            accessorKey: 'itemName',
            cell: (value) => (value as string).split('@')[0]
        },
        { header: t('purchaseReportsExpiry.colDateAdded'), accessorKey: 'dateAdded' },
        { header: t('purchaseReportsExpiry.colExpiryDate'), accessorKey: 'expiryDate', 
          cell: (value, row) => <span className={row.status === 'Expired' ? 'text-red-600' : 'text-gray-700'}>{value ?? t('purchaseReportsExpiry.na')}</span> },
        { header: t('purchaseReportsExpiry.colQuantity'), accessorKey: 'quantity' },
        { header: t('purchaseReportsExpiry.colStorageLocation'), accessorKey: 'storageLocationName' },
        { header: t('purchaseReportsExpiry.colBranchName'), accessorKey: 'branchName' },
        { header: t('purchaseReportsExpiry.colItemStatus'), accessorKey: 'status', 
          cell: (value) => <span className={`px-2 py-0.5 rounded text-xs font-medium ${value === 'Expired' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{value ?? t('purchaseReportsExpiry.na')}</span> },
        { header: t('purchaseReportsExpiry.colPOStatus'), accessorKey: 'purchaseOrderStatus' },
    ];

    return (
        <PageLayout title={t('purchaseReportsExpiry.pageTitle')}>
             <div className="mb-4">
                <Link href="/reports/purchase" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
                    <ArrowLeft size={20} />
                    <span>{t('purchaseReportsExpiry.backToPurchaseReports')}</span>
                </Link>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <Input 
                        label={t('purchaseReportsExpiry.labelStartDate')}
                        type="date"
                        name="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <Input 
                        label={t('purchaseReportsExpiry.labelEndDate')}
                        type="date"
                        name="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                    <Button onClick={handleFetchReport} disabled={loading}>
                        {loading ? t('purchaseReportsExpiry.loading') : t('purchaseReportsExpiry.fetchReport')}
                    </Button>
                </div>
                 {validationError && (
                    <p className="mt-2 text-sm text-red-600">{validationError}</p>
                )}
            </div>
            <ReportTypeTable
                title={t('purchaseReportsExpiry.tableTitle')}
                data={data}
                columns={itemExpiryColumns}
                isLoading={loading}
            />
            <ConfirmationModal
                isOpen={!!error}
                onClose={handleCloseErrorModal}
                title={t('purchaseReportsExpiry.errorTitle')}
                message={typeof error === 'string' ? error : (error as any)?.message || t('purchaseReportsExpiry.errorMsg')}
                isAlert={true}
                okText={t('purchaseReportsExpiry.ok')}
            />
        </PageLayout>
    );
}

export default ItemExpiryReportPage;