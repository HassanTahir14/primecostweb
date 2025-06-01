'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchSalaryBreakdown, clearEmployeeReportError } from '@/store/employeeReportsSlice';
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

// Updated data structure based on API response
interface SalaryBreakdownRecord {
  employeeName: string;
  position: string;
  iqamaId: string;
  iqamaExpiry: string; // Date string
  healthCardId: string;
  healthCardExpiry: string; // Date string
  totalPayroll: string; // Appears to be string in response, treat as number for display?
  // Removed: basicSalary, allowances, totalSalary, employeeId
}

const SalaryBreakdownReportPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { data: salaryBreakdownData, loading, error } = useSelector((state: RootState) => state.employeeReports.salaryBreakdown);
  const { currency } = useCurrency();
  const { t } = useTranslation();
  const [formattedPayrolls, setFormattedPayrolls] = useState<any>({});

  const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDateRange();

  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch data on first load
  useEffect(() => {
    dispatch(clearEmployeeReportError('salaryBreakdown'));
    const payload = { startDate, endDate, sortBy: "createdAt", page: 0, size: 1000, direction: "desc" };
    dispatch(fetchSalaryBreakdown(payload));
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    if (salaryBreakdownData?.salaryDetails && currency) {
      const formatPayrolls = async () => {
        try {
          const payrolls: {[key: string]: string} = {};
          for (const record of salaryBreakdownData.salaryDetails) {
            const payroll = parseFloat(record.totalPayroll || '0');
            payrolls[record.employeeName] = await formatCurrencyValue(payroll, currency);
          }
          setFormattedPayrolls(payrolls);
        } catch (error) {
          console.error('Error formatting payrolls:', error);
          setFormattedPayrolls({});
        }
      };
      formatPayrolls();
    }
  }, [salaryBreakdownData, currency]);

  const handleFetchReport = () => {
    if (!startDate || !endDate) {
        setValidationError('Please select both a Start Date and End Date.');
        return;
    }
    setValidationError(null);
    dispatch(clearEmployeeReportError('salaryBreakdown'));
    const payload = { startDate, endDate, sortBy: "createdAt", page: 0, size: 1000, direction: "desc" };
    dispatch(fetchSalaryBreakdown(payload));
  };

  const handleCloseErrorModal = () => {
    dispatch(clearEmployeeReportError('salaryBreakdown'));
  };

  const tableTitle = t('employeeReportSalary.tableTitle');

  const salaryBreakdownColumns: ColumnDefinition<SalaryBreakdownRecord>[] = [
    { header: t('employeeReportSalary.colEmployeeName'), accessorKey: 'employeeName' },
    { header: t('employeeReportSalary.colPosition'), accessorKey: 'position' },
    { header: t('employeeReportSalary.colIqamaId'), accessorKey: 'iqamaId' },
    { header: t('employeeReportSalary.colIqamaExpiry'), accessorKey: 'iqamaExpiry' },
    { header: t('employeeReportSalary.colHealthCardId'), accessorKey: 'healthCardId' },
    { header: t('employeeReportSalary.colHealthCardExpiry'), accessorKey: 'healthCardExpiry' },
    { 
      header: t('employeeReportSalary.colTotalPayroll'), 
      accessorKey: 'totalPayroll',
      cell: (value, record) => formattedPayrolls[record.employeeName] || t('employeeReportSalary.na')
    },
  ];

  return (
    <PageLayout title={t('employeeReportSalary.pageTitle')}>
      <div className="mb-4">
        <Link href="/reports/employee" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
          <ArrowLeft size={20} />
          <span>{t('employeeReportSalary.backToEmployeeReports')}</span>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Input
            label={t('employeeReportSalary.labelStartDate')}
            type="date"
            name="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label={t('employeeReportSalary.labelEndDate')}
            type="date"
            name="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Button onClick={handleFetchReport} disabled={loading}>
            {loading ? t('employeeReportSalary.generating') : t('employeeReportSalary.generateReport')}
          </Button>
        </div>
        {validationError && (
          <p className="mt-2 text-sm text-red-600">{t('employeeReportSalary.validationError')}</p>
        )}
      </div>

      <ReportTypeTable<SalaryBreakdownRecord>
        title={tableTitle}
        data={salaryBreakdownData?.salaryDetails || []}
        columns={salaryBreakdownColumns}
        isLoading={loading}
      />

      <ConfirmationModal
        isOpen={!!error}
        onClose={handleCloseErrorModal}
        title={t('employeeReportSalary.errorTitle')}
        message={typeof error === 'string' ? error : (error as any)?.message || t('employeeReportSalary.errorMsg')}
        isAlert={true}
        okText={t('employeeReportSalary.ok')}
      />
    </PageLayout>
  );
};

export default SalaryBreakdownReportPage;