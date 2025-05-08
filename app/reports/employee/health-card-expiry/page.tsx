'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchHealthCardExpiry, clearEmployeeReportError } from '@/store/employeeReportsSlice';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import ReportTypeTable, { ColumnDefinition } from '@/components/reports/ReportTypeTable';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getDefaultDateRange } from '@/utils/dateUtils';

// Updated data structure based on API response
interface HealthCardExpiryRecord {
  employeeName: string;
  healthCardId: string; // Renamed from healthCardNumber
  cardExpiry: string; // Renamed from expiryDate
  status: string;
  // Removed: employeeId, position, daysUntilExpiry
}

// Updated Column Definitions based on API response
const healthCardExpiryColumns: ColumnDefinition<HealthCardExpiryRecord>[] = [
    { header: 'Employee Name', accessorKey: 'employeeName' },
    { header: 'Health Card ID', accessorKey: 'healthCardId' }, // Updated header and key
    { header: 'Expiry Date', accessorKey: 'cardExpiry' }, // Updated key
    { header: 'Status', accessorKey: 'status' }, // Added status
];

const HealthCardExpiryReportPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { data: healthCardExpiryData, loading, error } = useSelector((state: RootState) => state.employeeReports.healthCardExpiry);

  const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDateRange();
  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch data on first load
  useEffect(() => {
    dispatch(clearEmployeeReportError('healthCardExpiry'));
    const payload = { startDate, endDate, sortBy: "createdAt", page: 0, size: 1000, direction: "asc" };
    dispatch(fetchHealthCardExpiry(payload));
  }, []); // Empty dependency array means this runs once on mount

  const handleFetchReport = () => {
    if (!startDate || !endDate) {
        setValidationError('Please select both a Start Date and End Date.');
        return;
    }
    setValidationError(null);
    dispatch(clearEmployeeReportError('healthCardExpiry'));
    const payload = { startDate, endDate, sortBy: "createdAt", page: 0, size: 1000, direction: "asc" };
    dispatch(fetchHealthCardExpiry(payload));
  };

  const handleCloseErrorModal = () => {
    dispatch(clearEmployeeReportError('healthCardExpiry'));
  };

  // Placeholder title
  const tableTitle = "Upcoming Health Card Expiries";

  return (
    <PageLayout title="Health Card Expiry Report">
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
      <ReportTypeTable<HealthCardExpiryRecord>
        title={tableTitle}
        // Access the healthCardExpiryDetails array within the data object
        data={healthCardExpiryData?.healthCardExpiryDetails || []}
        columns={healthCardExpiryColumns}
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

export default HealthCardExpiryReportPage; 