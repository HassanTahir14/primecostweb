'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchGeneralEmployeeReport, clearEmployeeReportError } from '@/store/employeeReportsSlice';
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
interface GeneralEmployeeRecord {
  employeeName: string;
  dob: string; // Date string
  iqamaId: string;
  healthCardNumber: string;
  iqamaExpiry: string; // Date string
  healthCardExpiry: string; // Date string
  basicSalary: number;
  otherAllowances: number;
  totalItemsPrepared: number;
  images?: { imageId: number; path: string; }[]; // Optional image array
  // Removed: employeeId, position, department, nationality, mobileNumber, totalAllowances, hireDate, status
}

const GeneralEmployeeReportPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { data: generalReportData, loading, error } = useSelector((state: RootState) => state.employeeReports.general);
  const { currency } = useCurrency();
  const [formattedSalaries, setFormattedSalaries] = useState<any>({});

  const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDateRange();
  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Column definitions moved inside component to access formattedSalaries
  const generalColumns: ColumnDefinition<GeneralEmployeeRecord>[] = [
    { header: 'Name', accessorKey: 'employeeName' },
    { header: 'DOB', accessorKey: 'dob' },
    { header: 'Iqama ID', accessorKey: 'iqamaId' },
    { header: 'Iqama Expiry', accessorKey: 'iqamaExpiry' },
    { header: 'Health Card #', accessorKey: 'healthCardNumber' },
    { header: 'Health Card Expiry', accessorKey: 'healthCardExpiry' },
    { 
      header: 'Basic Salary', 
      accessorKey: 'basicSalary',
      cell: (value, record) => formattedSalaries[record.employeeName]?.basic || 'N/A'
    },
    { 
      header: 'Other Allowances', 
      accessorKey: 'otherAllowances',
      cell: (value, record) => formattedSalaries[record.employeeName]?.allowances || 'N/A'
    },
    { header: 'Items Prepared', accessorKey: 'totalItemsPrepared' },
    // Removed: Employee ID, Position, Department, Nationality, Mobile, Hire Date, Status
    // Note: Images are not typically displayed directly in a table column
  ];

  // Fetch data on first load
  useEffect(() => {
    dispatch(clearEmployeeReportError('general'));
    const payload = { startDate, endDate, sortBy: "createdAt", page: 0, size: 1000, direction: "asc"};
    dispatch(fetchGeneralEmployeeReport(payload));
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    if (generalReportData?.employees && currency) {
      const formatSalaries = async () => {
        try {
          const salaries: {[key: string]: { basic: string, allowances: string }} = {};
          for (const record of generalReportData.employees) {
            salaries[record.employeeName] = {
              basic: await formatCurrencyValue(record.basicSalary || 0, currency),
              allowances: await formatCurrencyValue(record.otherAllowances || 0, currency)
            };
          }
          setFormattedSalaries(salaries);
        } catch (error) {
          console.error('Error formatting salaries:', error);
          setFormattedSalaries({});
        }
      };
      formatSalaries();
    }
  }, [generalReportData, currency]);

  const handleFetchReport = () => {
    if (!startDate || !endDate) {
        setValidationError('Please select both a Start Date and End Date.');
        return;
    }
    setValidationError(null);
    dispatch(clearEmployeeReportError('general'));
    const payload = { startDate, endDate, sortBy: "createdAt", page: 0, size: 1000, direction: "asc"};
    dispatch(fetchGeneralEmployeeReport(payload));
  };

  const handleCloseErrorModal = () => {
    dispatch(clearEmployeeReportError('general'));
  };

  // Placeholder title
  const tableTitle = "General Employee Report Results";

  return (
    <PageLayout title="General Employee Report">
      <div className="mb-4">
        <Link href="/reports/employee" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
          <ArrowLeft size={20} />
          <span>Back to Employee Reports</span>
        </Link>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Input
            label="Start Date (e.g., Hire Date)"
            type="date"
            name="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End Date (e.g., Hire Date)"
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

      {/* Report Table Section - Access nested array */}
      <ReportTypeTable<GeneralEmployeeRecord>
        title={tableTitle}
        // Access the employees array within the data object
        data={generalReportData?.employees || []}
        columns={generalColumns}
        isLoading={loading}
      />

      {/* Error Modal */}
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

export default GeneralEmployeeReportPage; 