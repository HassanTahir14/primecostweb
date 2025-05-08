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
  const [formattedPayrolls, setFormattedPayrolls] = useState<any>({});

  const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDateRange();

  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch data on first load
  useEffect(() => {
    dispatch(clearEmployeeReportError('salaryBreakdown'));
    const payload = { startDate, endDate, sortBy: "createdAt", page: 0, size: 1000, direction: "asc" };
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
    const payload = { startDate, endDate, sortBy: "createdAt", page: 0, size: 1000, direction: "asc" };
    dispatch(fetchSalaryBreakdown(payload));
  };

  const handleCloseErrorModal = () => {
    dispatch(clearEmployeeReportError('salaryBreakdown'));
  };

  const tableTitle = "Salary Breakdown Report Results";

  // Update the column definition to use formatted values
  const salaryBreakdownColumns: ColumnDefinition<SalaryBreakdownRecord>[] = [
    { header: 'Employee Name', accessorKey: 'employeeName' },
    { header: 'Position', accessorKey: 'position' },
    { header: 'Iqama ID', accessorKey: 'iqamaId' },
    { header: 'Iqama Expiry', accessorKey: 'iqamaExpiry' },
    { header: 'Health Card ID', accessorKey: 'healthCardId' },
    { header: 'Health Card Expiry', accessorKey: 'healthCardExpiry' },
    { 
      header: 'Total Payroll', 
      accessorKey: 'totalPayroll',
      cell: (value, record) => formattedPayrolls[record.employeeName] || 'N/A'
    },
  ];

  return (
    <PageLayout title="Salary Breakdown Report">
      <div className="mb-4">
        <Link href="/reports/employee" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
          <ArrowLeft size={20} />
          <span>Back to Employee Reports</span>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Input
            label="Start Date"
            type="date"
            name="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End Date"
            type="date"
            name="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Button onClick={handleFetchReport} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
        {validationError && (
          <p className="mt-2 text-sm text-red-600">{validationError}</p>
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
        title="Error"
        message={typeof error === 'string' ? error : (error as any)?.message || 'An error occurred fetching the report.'}
        isAlert={true}
        okText="OK"
      />
    </PageLayout>
  );
};

export default SalaryBreakdownReportPage; 