'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchRecipesTransferred, clearTransferReportError } from '@/store/transferReportsSlice';
import { RecipeTransferRecord } from '@/store/transferReportsApi';
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

const RecipesTransferredReportPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { currency } = useCurrency();
  const { t } = useTranslation();
  const [formattedCosts, setFormattedCosts] = useState<any>({});
  const { data: reportData, loading, error } = useSelector((state: RootState) => state.transferReports.recipesTransferred);

  const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDateRange();
  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(clearTransferReportError('recipesTransferred'));
    dispatch(fetchRecipesTransferred({ startDate, endDate }));
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
    dispatch(clearTransferReportError('recipesTransferred'));
    dispatch(fetchRecipesTransferred({ startDate, endDate, sortBy: "createdAt", page: 0, size: 1000, direction: "asc" }));
  };

  const handleCloseErrorModal = () => {
    dispatch(clearTransferReportError('recipesTransferred'));
  };

  // Column definitions moved inside component to access formattedCosts
  const recipeColumns: ColumnDefinition<RecipeTransferRecord>[] = [
    { header: t('transferRecipesTransferred.colTransferDate'), accessorKey: 'transferDate' },
    { header: t('transferRecipesTransferred.colTransferCode'), accessorKey: 'transferCode' },
    { header: t('transferRecipesTransferred.colRequestedBy'), accessorKey: 'requestedBy' },
    { header: t('transferRecipesTransferred.colTransferredBy'), accessorKey: 'transferredBy' },
    { header: t('transferRecipesTransferred.colFromBranch'), accessorKey: 'fromBranch' },
    { header: t('transferRecipesTransferred.colToBranch'), accessorKey: 'toBranch' },
    { 
        header: t('transferRecipesTransferred.colTransferCost'), 
        accessorKey: 'transferCost',
        cell: (value, record) => formattedCosts[`${record.transferCode}-${record.transferDate}`] || t('transferRecipesTransferred.na')
    },
    { header: t('transferRecipesTransferred.colOtherCharges'), accessorKey: 'otherCharges' },
    { header: t('transferRecipesTransferred.colTotalCost'), accessorKey: 'totalTransferCost' },
  ];

  return (
    <PageLayout title={t('transferRecipesTransferred.pageTitle')}>
      <div className="mb-4">
        <Link href="/reports/transfer" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
          <ArrowLeft size={20} />
          <span>{t('transferRecipesTransferred.backToTransferReports')}</span>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Input
            label={t('transferRecipesTransferred.labelStartDate')}
            type="date"
            name="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label={t('transferRecipesTransferred.labelEndDate')}
            type="date"
            name="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Button onClick={handleFetchReport} disabled={loading}>
            {loading ? t('transferRecipesTransferred.generating') : t('transferRecipesTransferred.generateReport')}
          </Button>
        </div>
        {validationError && (
          <p className="mt-2 text-sm text-red-600">{validationError}</p>
        )}
      </div>

      <ReportTypeTable<RecipeTransferRecord>
        title={t('transferRecipesTransferred.tableTitle')}
        data={reportData?.transferDetails || []}
        columns={recipeColumns}
        isLoading={loading}
      />

      <ConfirmationModal
        isOpen={!!error}
        onClose={handleCloseErrorModal}
        title={t('transferRecipesTransferred.errorTitle')}
        message={typeof error === 'string' ? error : (error as any)?.message || t('transferRecipesTransferred.errorMsg')}
        isAlert={true}
        okText={t('transferRecipesTransferred.ok')}
      />
    </PageLayout>
  );
};

export default RecipesTransferredReportPage;