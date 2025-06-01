'use client';

import React, { useState, useEffect  } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import { AppDispatch, RootState } from '@/store/store';
import {
    fetchRejectedPOs,
    clearReportError,
} from '@/store/purchaseReportsSlice';
import { RejectedPODetail } from '@/store/purchaseReportsApi';
import ReportTypeTable, { ColumnDefinition } from '@/components/reports/ReportTypeTable';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getDefaultDateRange } from '@/utils/dateUtils';
import { useTranslation } from '@/context/TranslationContext';

export default function RejectedPurchaseOrdersReportPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();

    // State for filters
    const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDateRange();
    const [startDate, setStartDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(defaultEndDate);
    const [validationError, setValidationError] = useState<string | null>(null);

    // Get report state from Redux
    const { data, loading, error } = useSelector((state: RootState) => state.purchaseReports.rejectedPOs);

    useEffect(() => {
        dispatch(clearReportError('rejectedPOs'));
        const payload = { startDate, endDate, sortBy: "createdAt", page: 0, size: 1000, direction: "desc" };
        dispatch(fetchRejectedPOs(payload));
    }, []);

    const handleFetchReport = () => {
        // Basic validation
        if (!startDate || !endDate) {
            setValidationError('Please select both a Start Date and End Date.');
            return;
        }
        setValidationError(null);
        dispatch(clearReportError('rejectedPOs')); // Clear previous errors
        const payload = { startDate, endDate, sortBy: "createdAt", page: 0, size: 1000, direction: "desc" };
        dispatch(fetchRejectedPOs(payload));
    };

    const handleCloseErrorModal = () => {
        dispatch(clearReportError('rejectedPOs'));
    };

    const rejectedPOColumns: ColumnDefinition<RejectedPODetail>[] = [
        { 
            header: t('purchaseReportsRejected.colItemName'), 
            accessorKey: 'itemName',
            cell: (value) => {
                const itemName = value as string;
                return itemName.split('@')[0];
            }
        },
        { header: t('purchaseReportsRejected.colQuantity'), accessorKey: 'quantity' },
        { header: t('purchaseReportsRejected.colUnit'), accessorKey: 'unit' },
        { header: t('purchaseReportsRejected.colDate'), accessorKey: 'dated' },
        { header: t('purchaseReportsRejected.colReason'), accessorKey: 'reason' },
    ];

    return (
        <PageLayout title={t('purchaseReportsRejected.pageTitle')}>
             <div className="mb-4">
                <Link href="/reports/purchase" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
                    <ArrowLeft size={20} />
                    <span>{t('purchaseReportsRejected.backToPurchaseReports')}</span>
                </Link>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <Input 
                        label={t('purchaseReportsRejected.labelStartDate')}
                        type="date"
                        name="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <Input 
                        label={t('purchaseReportsRejected.labelEndDate')}
                        type="date"
                        name="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                    <Button onClick={handleFetchReport} disabled={loading}>
                        {loading ? t('purchaseReportsRejected.loading') : t('purchaseReportsRejected.fetchReport')}
                    </Button>
                </div>
                 {validationError && (
                    <p className="mt-2 text-sm text-red-600">{validationError}</p>
                )}
            </div>

            {/* Report Table Section */}
            <ReportTypeTable
                title={t('purchaseReportsRejected.tableTitle')}
                data={data}
                columns={rejectedPOColumns}
                isLoading={loading}
                // Pass additional props like pagination controls if needed
            />

            {/* Error Modal */}
            <ConfirmationModal
                isOpen={!!error}
                onClose={handleCloseErrorModal}
                title={t('purchaseReportsRejected.errorTitle')}
                message={typeof error === 'string' ? error : (error as any)?.message || t('purchaseReportsRejected.errorMsg')}
                isAlert={true}
                okText={t('purchaseReportsRejected.ok')}
            />
        </PageLayout>
    );
}