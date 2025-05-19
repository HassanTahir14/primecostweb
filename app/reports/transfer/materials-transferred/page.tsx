'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchMaterialsTransferred, clearTransferReportError } from '@/store/transferReportsSlice';
import { MaterialTransferRecord } from '@/store/transferReportsApi';
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
import { fetchAllCategories, selectAllCategories } from '@/store/itemCategorySlice';
import SelectComponent from '@/components/common/select';
import { useTranslation } from '@/context/TranslationContext';

const MaterialsTransferredReportPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { currency } = useCurrency();
  const { t } = useTranslation();
  const [formattedCosts, setFormattedCosts] = useState<any>({});
  const { data: reportData, loading, error } = useSelector((state: RootState) => state.transferReports.materialsTransferred);
  const categories = useSelector(selectAllCategories);

  const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDateRange();
  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAllCategories());
    dispatch(clearTransferReportError('materialsTransferred'));
    dispatch(fetchMaterialsTransferred({ startDate, endDate }));
  }, []);

  useEffect(() => {
    if (reportData && currency) {
      const formatCosts = async () => {
        try {
          const costs: {[key: string]: string} = {};
          const details = reportData?.materials || [];
          
          for (const record of details) {
            const key = `${record.itemName}-${record.orderDate}`;
            costs[key] = await formatCurrencyValue(record.cost || 0, currency);
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
    dispatch(clearTransferReportError('materialsTransferred'));
    dispatch(fetchMaterialsTransferred({ startDate, endDate, categoryName: selectedCategory } as any));
  };

  const handleCloseErrorModal = () => {
    dispatch(clearTransferReportError('materialsTransferred'));
  };

  // Column definitions moved inside component to access formattedCosts
  const materialColumns: ColumnDefinition<MaterialTransferRecord>[] = [
    { 
        header: t('transferMaterialsTransferred.colItemName'), 
        accessorKey: 'itemName',
        cell: (value) => {
            const itemName = value as string;
            return itemName.split('@')[0];
        }
    },
    { header: t('transferMaterialsTransferred.colBranch'), accessorKey: 'branch' },
    { header: t('transferMaterialsTransferred.colQuantity'), accessorKey: 'quantity' },
    { header: t('transferMaterialsTransferred.colUnit'), accessorKey: 'unit' },
    { 
        header: t('transferMaterialsTransferred.colCost'), 
        accessorKey: 'cost',
        cell: (value, record) => formattedCosts[`${record.itemName}-${record.orderDate}`] || t('transferMaterialsTransferred.na')
    },
    { header: t('transferMaterialsTransferred.colDate'), accessorKey: 'orderDate' },
  ];

  return (
    <PageLayout title={t('transferMaterialsTransferred.pageTitle')}>
      <div className="mb-4">
        <Link href="/reports/transfer" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
          <ArrowLeft size={20} />
          <span>{t('transferMaterialsTransferred.backToTransferReports')}</span>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <Input
            label={t('transferMaterialsTransferred.labelStartDate')}
            type="date"
            name="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label={t('transferMaterialsTransferred.labelEndDate')}
            type="date"
            name="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <SelectComponent
            label={t('transferMaterialsTransferred.labelCategory')}
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            options={[{ label: t('transferMaterialsTransferred.allCategories'), value: '' }, ...categories.map(cat => ({ label: cat.name, value: cat.name }))]}
          />
          <Button onClick={handleFetchReport} disabled={loading}>
            {loading ? t('transferMaterialsTransferred.generating') : t('transferMaterialsTransferred.generateReport')}
          </Button>
        </div>
        {validationError && (
          <p className="mt-2 text-sm text-red-600">{validationError}</p>
        )}
      </div>

      <ReportTypeTable<MaterialTransferRecord>
        title={t('transferMaterialsTransferred.tableTitle')}
        data={reportData?.materials || []}
        columns={materialColumns}
        isLoading={loading}
      />

      <ConfirmationModal
        isOpen={!!error}
        onClose={handleCloseErrorModal}
        title={t('transferMaterialsTransferred.errorTitle')}
        message={typeof error === 'string' ? error : (error as any)?.message || t('transferMaterialsTransferred.errorMsg')}
        isAlert={true}
        okText={t('transferMaterialsTransferred.ok')}
      />
    </PageLayout>
  );
};

export default MaterialsTransferredReportPage;