'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchSubRecipesTransferred, clearTransferReportError } from '@/store/transferReportsSlice';
import { SubRecipeTransferRecord } from '@/store/transferReportsApi';
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

const SubRecipesTransferredReportPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { currency } = useCurrency();
  const { t } = useTranslation();
  const [formattedCosts, setFormattedCosts] = useState<any>({});
  const { data: reportData, loading, error } = useSelector((state: RootState) => state.transferReports.subRecipesTransferred);

  const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDateRange();
  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(clearTransferReportError('subRecipesTransferred'));
    dispatch(fetchSubRecipesTransferred({ startDate, endDate, sortBy: "createdAt", page: 0, size: 1000, direction: "asc" }));
  }, []); 

  useEffect(() => {
    if (reportData && currency) {
      const formatCosts = async () => {
        try {
          const costs: {[key: string]: string} = {};
          const details = reportData?.transferDetails || [];
          for (const record of details) {
            const key = `${record.transferCode}-${record.transferDate}`;
            costs[key] = await formatCurrencyValue(record.transferCost || 0, currency);
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
    dispatch(clearTransferReportError('subRecipesTransferred'));
    dispatch(fetchSubRecipesTransferred({ startDate, endDate, sortBy: "preparedDate", page: 0, size: 1000, direction: "asc" }));
  };

  const handleCloseErrorModal = () => {
    dispatch(clearTransferReportError('subRecipesTransferred'));
  };

  // Column definitions moved inside component to access formattedCosts
  const subRecipeColumns: ColumnDefinition<SubRecipeTransferRecord>[] = [
    { header: t('transferSubRecipesTransferred.colTransferDate'), accessorKey: 'transferDate' },
    { header: t('transferSubRecipesTransferred.colTransferCode'), accessorKey: 'transferCode' },
    { header: t('transferSubRecipesTransferred.colRequestedBy'), accessorKey: 'requestedBy' },
    { header: t('transferSubRecipesTransferred.colTransferredBy'), accessorKey: 'transferredBy' },
    { header: t('transferSubRecipesTransferred.colFromBranch'), accessorKey: 'fromBranch' },
    { header: t('transferSubRecipesTransferred.colToBranch'), accessorKey: 'toBranch' },
    { 
        header: t('transferSubRecipesTransferred.colTransferCost'), 
        accessorKey: 'transferCost',
        cell: (value, record) => formattedCosts[`${record.transferCode}-${record.transferDate}`] || t('transferSubRecipesTransferred.na')
    },
    { header: t('transferSubRecipesTransferred.colOtherCharges'), accessorKey: 'otherCharges' },
    { header: t('transferSubRecipesTransferred.colTotalCost'), accessorKey: 'totalTransferCost' },
  ];

  return (
    <PageLayout title={t('transferSubRecipesTransferred.pageTitle')}>
      <div className="mb-4">
        <Link href="/reports/transfer" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
          <ArrowLeft size={20} />
          <span>{t('transferSubRecipesTransferred.backToTransferReports')}</span>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Input
            label={t('transferSubRecipesTransferred.labelStartDate')}
            type="date"
            name="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label={t('transferSubRecipesTransferred.labelEndDate')}
            type="date"
            name="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Button onClick={handleFetchReport} disabled={loading}>
            {loading ? t('transferSubRecipesTransferred.generating') : t('transferSubRecipesTransferred.generateReport')}
          </Button>
        </div>
        {validationError && (
          <p className="mt-2 text-sm text-red-600">{validationError}</p>
        )}
      </div>

      <ReportTypeTable<SubRecipeTransferRecord>
        title={t('transferSubRecipesTransferred.tableTitle')}
        data={reportData?.transferDetails || []}
        columns={subRecipeColumns}
        isLoading={loading}
      />

      <ConfirmationModal
        isOpen={!!error}
        onClose={handleCloseErrorModal}
        title={t('transferSubRecipesTransferred.errorTitle')}
        message={typeof error === 'string' ? error : (error as any)?.message || t('transferSubRecipesTransferred.errorMsg')}
        isAlert={true}
        okText={t('transferSubRecipesTransferred.ok')}
      />
    </PageLayout>
  );
};

export default SubRecipesTransferredReportPage;