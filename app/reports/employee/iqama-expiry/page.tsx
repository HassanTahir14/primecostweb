'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchIqamaExpiry, clearEmployeeReportError } from '@/store/employeeReportsSlice';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import ReportTypeTable, { ColumnDefinition } from '@/components/reports/ReportTypeTable';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getDefaultDateRange } from '@/utils/dateUtils';
import { useTranslation } from '@/context/TranslationContext';

// Updated data structure based on API response
interface IqamaExpiryRecord {
  employeeName: string;
  iqamaId: string;
  iqamaExpiry: string; // Date string
  status: string;
  // Removed: employeeId, position, daysUntilExpiry
}

const IqamaExpiryReportPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { data: iqamaExpiryData, loading, error } = useSelector((state: RootState) => state.employeeReports.iqamaExpiry);

  const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDateRange();
  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { t } = useTranslation();

  // Fetch data on first load
  useEffect(() => {
    dispatch(clearEmployeeReportError('iqamaExpiry'));
    const payload = { startDate, endDate, sortBy: "createdAt", page: 0, size: 1000, direction: "desc" };
    dispatch(fetchIqamaExpiry(payload));
  }, []); // Empty dependency array means this runs once on mount

  const handleFetchReport = () => {
    if (!startDate || !endDate) {
        setValidationError('Please select both a Start Date and End Date.');
        return;
    }
    setValidationError(null);
    dispatch(clearEmployeeReportError('iqamaExpiry'));
    const payload = { startDate, endDate, sortBy: "createdAt", page: 0, size: 1000, direction: "desc" };
    dispatch(fetchIqamaExpiry(payload));
  };

  const handleCloseErrorModal = () => {
    dispatch(clearEmployeeReportError('iqamaExpiry'));
  };

  // Placeholder title
  const tableTitle = t('employeeReportIqama.tableTitle');

  const iqamaExpiryColumns: ColumnDefinition<IqamaExpiryRecord>[] = [
    { header: t('employeeReportIqama.colEmployeeName'), accessorKey: 'employeeName' },
    { header: t('employeeReportIqama.colIqamaId'), accessorKey: 'iqamaId' },
    { header: t('employeeReportIqama.colIqamaExpiry'), accessorKey: 'iqamaExpiry' },
    { header: t('employeeReportIqama.colStatus'), accessorKey: 'status' },
  ];

  return (
    <PageLayout title={t('employeeReportIqama.pageTitle')}>
      <div className="mb-4">
        <Link href="/reports/employee" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
          <ArrowLeft size={20} />
          <span>{t('employeeReportIqama.backToEmployeeReports')}</span>
        </Link>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Input
            label={t('employeeReportIqama.labelStartDate')}
            type="date"
            name="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label={t('employeeReportIqama.labelEndDate')}
            type="date"
            name="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Button onClick={handleFetchReport} disabled={loading}>
            {loading ? t('employeeReportIqama.fetching') : t('employeeReportIqama.fetchReport')}
          </Button>
        </div>
        {validationError && (
          <p className="mt-2 text-sm text-red-600">{t('employeeReportIqama.validationError')}</p>
        )}
      </div>

      <ReportTypeTable<IqamaExpiryRecord>
        title={tableTitle}
        data={iqamaExpiryData?.iqamaExpiryDetails || []}
        columns={iqamaExpiryColumns}
        isLoading={loading}
      />

      <ConfirmationModal
        isOpen={!!error}
        onClose={handleCloseErrorModal}
        title={t('employeeReportIqama.errorTitle')}
        message={typeof error === 'string' ? error : (error as any)?.message || t('employeeReportIqama.errorMsg')}
        isAlert={true}
        okText={t('employeeReportIqama.ok')}
      />
    </PageLayout>
  );
};

export default IqamaExpiryReportPage;