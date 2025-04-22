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
import { format, addDays } from 'date-fns';

// Updated data structure based on API response
interface IqamaExpiryRecord {
  employeeName: string;
  iqamaId: string;
  iqamaExpiry: string; // Date string
  status: string;
  // Removed: employeeId, position, daysUntilExpiry
}

// Updated Column Definitions based on API response
const iqamaExpiryColumns: ColumnDefinition<IqamaExpiryRecord>[] = [
    { header: 'Employee Name', accessorKey: 'employeeName' },
    { header: 'Iqama ID', accessorKey: 'iqamaId' },
    { header: 'Iqama Expiry', accessorKey: 'iqamaExpiry', cellClassName: 'text-center' },
    { header: 'Status', accessorKey: 'status', cellClassName: 'text-center' }, // Added status
];

const IqamaExpiryReportPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  // Select the specific report state object
  const { data: iqamaExpiryData, loading, error } = useSelector((state: RootState) => state.employeeReports.iqamaExpiry);

  // Default range: today to 90 days from now
  const defaultStartDate = format(new Date(), 'yyyy-MM-dd');
  const defaultEndDate = format(addDays(new Date(), 90), 'yyyy-MM-dd');

  // Use string state for date inputs
  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFetchReport = () => {
    if (!startDate || !endDate) {
        setValidationError('Please select both an Expiry Start Date and End Date.');
        return;
    }
    setValidationError(null);
    // Clear previous errors before fetching
    dispatch(clearEmployeeReportError('iqamaExpiry'));
    const payload = { startDate, endDate, sortBy: "preparedDate", page: 0, size: 100, direction: "asc" };
    dispatch(fetchIqamaExpiry(payload));
  };

  const handleCloseErrorModal = () => {
    dispatch(clearEmployeeReportError('iqamaExpiry'));
  };

  // Placeholder title
  const tableTitle = "Upcoming Iqama Expiries";

  return (
    <PageLayout title="Iqama Expiry Report">
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
            label="Expiry After (Start Date)"
            type="date"
            name="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="Expiry Before (End Date)"
            type="date"
            name="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Button onClick={handleFetchReport} disabled={loading}>
            {loading ? 'Fetching...' : 'Fetch Report'}
          </Button>
        </div>
        {validationError && (
          <p className="mt-2 text-sm text-red-600">{validationError}</p>
        )}
      </div>

      {/* Report Table Section - Access nested array */}
      <ReportTypeTable<IqamaExpiryRecord>
        title={tableTitle}
        // Access the iqamaExpiryDetails array within the data object
        data={iqamaExpiryData?.iqamaExpiryDetails || []}
        columns={iqamaExpiryColumns}
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

export default IqamaExpiryReportPage; 