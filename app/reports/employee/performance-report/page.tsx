'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchPerformanceReport, clearEmployeeReportError } from '@/store/employeeReportsSlice';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import ReportTypeTable, { ColumnDefinition } from '@/components/reports/ReportTypeTable';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { format, subDays } from 'date-fns';

// Updated data structure based on API response
interface PerformanceRecord {
  employeeName: string;
  id: number; // Employee ID?
  orders: number;
  incidentReport: string; // "Yes" / "No"
  // Removed: position, department, rating, tasksCompleted, attendancePercentage, employeeId
}

// Updated Column Definitions based on API response
const performanceColumns: ColumnDefinition<PerformanceRecord>[] = [
    { header: 'Employee Name', accessorKey: 'employeeName' },
    { header: 'Employee ID', accessorKey: 'id' }, // Assuming 'id' is Employee ID
    { header: 'Orders', accessorKey: 'orders', cellClassName: 'text-right' },
    { header: 'Incident Report?', accessorKey: 'incidentReport', cellClassName: 'text-center' },
];

const PerformanceReportPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  // Select the specific report state object
  const { data: performanceData, loading, error } = useSelector((state: RootState) => state.employeeReports.performanceReport);

  const defaultEndDate = format(new Date(), 'yyyy-MM-dd');
  const defaultStartDate = format(subDays(new Date(), 90), 'yyyy-MM-dd'); // Keep 90 days default for performance

  // Use string state for date inputs
  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFetchReport = () => {
    if (!startDate || !endDate) {
        setValidationError('Please select both a Start Date and End Date.');
        return;
    }
    setValidationError(null);
    // Clear previous errors before fetching
    dispatch(clearEmployeeReportError('performanceReport'));
    const payload = { startDate, endDate };
    dispatch(fetchPerformanceReport(payload));
  };

  const handleCloseErrorModal = () => {
    dispatch(clearEmployeeReportError('performanceReport'));
  };

  // Placeholder title
  const tableTitle = "Performance Report Results";

  return (
    <PageLayout title="Performance Report">
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

       {/* Report Table Section - Access nested array */}
       <ReportTypeTable<PerformanceRecord>
         title={tableTitle}
         // Access the performanceDetails array within the data object
         data={performanceData?.performanceDetails || []}
         columns={performanceColumns}
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

export default PerformanceReportPage; 