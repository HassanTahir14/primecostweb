'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchItemsTransferred, clearTransferReportError } from '@/store/transferReportsSlice';
import { ItemTransferRecord } from '@/store/transferReportsApi'; // Import record type
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import ReportTypeTable, { ColumnDefinition } from '@/components/reports/ReportTypeTable';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getDefaultDateRange } from '@/utils/dateUtils';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrencyValue } from '@/utils/currencyUtils';
import { useTranslation } from '@/context/TranslationContext';

const ItemsTransferredReportPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { currency } = useCurrency();
  const { t } = useTranslation();
  const [formattedCosts, setFormattedCosts] = useState<any>({});
  const { data: reportData, loading, error } = useSelector((state: RootState) => state.transferReports.itemsTransferred);

  const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDateRange();

  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(clearTransferReportError('itemsTransferred'));
    dispatch(fetchItemsTransferred({ startDate, endDate, sortBy: "createdAt", page: 0, size: 1000, direction: "asc" }));
  }, []);   

  useEffect(() => {
    if (reportData && currency) {
      const formatCosts = async () => {
        try {
          const costs: {[key: string]: string} = {};
          const details = reportData?.transferDetails || [];
          
          for (const record of details) {
            const key = `${record.transferCode}-${record.transferDate}`;
            costs[`${key}-transfer`] = await formatCurrencyValue(record.transferCost || 0, currency);
            costs[`${key}-other`] = await formatCurrencyValue(record.otherCharges || 0, currency);
            costs[`${key}-total`] = await formatCurrencyValue(record.totalTransferCost || 0, currency);
          }
          setFormattedCosts(costs);
        } catch (error) {
          console.error('Error formatting costs:', error);
          setFormattedCosts({});
        }
      };
      formatCosts();
    }
  }, [reportData, currency]);

  const handleFetchReport = () => {
    if (!startDate || !endDate) {
        setValidationError('Please select both a Start Date and End Date.');
        return;
    }
    setValidationError(null);
    dispatch(clearTransferReportError('itemsTransferred'));
    dispatch(fetchItemsTransferred({ startDate, endDate, sortBy: "createdAt", page: 0, size: 1000, direction: "asc" }));
  };

  const handleCloseErrorModal = () => {
    dispatch(clearTransferReportError('itemsTransferred'));
  };

  const tableTitle = t('transferItemsTransferred.tableTitle');

  // Column definitions moved inside component to access formattedCosts
  const itemColumns: ColumnDefinition<ItemTransferRecord>[] = [
    { header: t('transferItemsTransferred.colTransferDate'), accessorKey: 'transferDate' },
    { header: t('transferItemsTransferred.colTransferCode'), accessorKey: 'transferCode' },
    { header: t('transferItemsTransferred.colRequestedBy'), accessorKey: 'requestedBy' },
    { header: t('transferItemsTransferred.colTransferredBy'), accessorKey: 'transferredBy' },
    { header: t('transferItemsTransferred.colFromBranch'), accessorKey: 'fromBranch' },
    { header: t('transferItemsTransferred.colToBranch'), accessorKey: 'toBranch' },
    { 
        header: t('transferItemsTransferred.colTransferCost'), 
        accessorKey: 'transferCost',
        cell: (value, record) => formattedCosts[`${record.transferCode}-${record.transferDate}-transfer`] || t('transferItemsTransferred.na')
    },
    { 
        header: t('transferItemsTransferred.colOtherCharges'), 
        accessorKey: 'otherCharges',
        cell: (value, record) => formattedCosts[`${record.transferCode}-${record.transferDate}-other`] || t('transferItemsTransferred.na')
    },
    { 
        header: t('transferItemsTransferred.colTotalCost'), 
        accessorKey: 'totalTransferCost',
        cell: (value, record) => formattedCosts[`${record.transferCode}-${record.transferDate}-total`] || t('transferItemsTransferred.na')
    },
  ];

  return (
    <PageLayout title={t('transferItemsTransferred.pageTitle')}>
      <div className="mb-4">
        <Link href="/reports/transfer" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
          <ArrowLeft size={20} />
          <span>{t('transferItemsTransferred.backToTransferReports')}</span>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Input
            label={t('transferItemsTransferred.labelStartDate')}
            type="date"
            name="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label={t('transferItemsTransferred.labelEndDate')}
            type="date"
            name="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Button onClick={handleFetchReport} disabled={loading}>
            {loading ? t('transferItemsTransferred.generating') : t('transferItemsTransferred.generateReport')}
          </Button>
        </div>
        {validationError && (
          <p className="mt-2 text-sm text-red-600">{validationError}</p>
        )}
      </div>

      <ReportTypeTable<ItemTransferRecord>
        title={tableTitle}
        data={reportData?.transferDetails || []}
        columns={itemColumns}
        isLoading={loading}
      />

      <ConfirmationModal
        isOpen={!!error}
        onClose={handleCloseErrorModal}
        title={t('transferItemsTransferred.errorTitle')}
        message={typeof error === 'string' ? error : (error as any)?.message || t('transferItemsTransferred.errorMsg')}
        isAlert={true}
        okText={t('transferItemsTransferred.ok')}
      />
    </PageLayout>
  );
};

export default ItemsTransferredReportPage;