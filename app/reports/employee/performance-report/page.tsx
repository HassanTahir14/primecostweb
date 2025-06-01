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
import { getDefaultDateRange } from '@/utils/dateUtils';
import { useTranslation } from '@/context/TranslationContext';

// Updated data structure based on API response
interface PerformanceRecord {
  employeeName: string;
  id: number; // Employee ID?
  orders: number;
  incidentReport: string; // "Yes" / "No"
  // Removed: position, department, rating, tasksCompleted, attendancePercentage, employeeId
}

const PerformanceReportPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { data: performanceData, loading, error } = useSelector((state: RootState) => state.employeeReports.performanceReport);

  const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDateRange();
  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { t } = useTranslation();

  // Fetch data on first load
  useEffect(() => {
    dispatch(clearEmployeeReportError('performanceReport'));
    const payload = { startDate, endDate, sortBy: "createdAt", page: 0, size: 1000, direction: "desc" };
    dispatch(fetchPerformanceReport(payload));
  }, []); // Empty dependency array means this runs once on mount

  const handleFetchReport = () => {
    if (!startDate || !endDate) {
        setValidationError('Please select both a Start Date and End Date.');
        return;
    }
    setValidationError(null);
    dispatch(clearEmployeeReportError('performanceReport'));
    const payload = { startDate, endDate, sortBy: "createdAt", page: 0, size: 1000, direction: "desc" };
    dispatch(fetchPerformanceReport(payload));
  };

  const handleCloseErrorModal = () => {
    dispatch(clearEmployeeReportError('performanceReport'));
  };

  // Placeholder title
  const tableTitle = t('employeeReportPerformance.tableTitle');

  const performanceColumns: ColumnDefinition<PerformanceRecord>[] = [
    { header: t('employeeReportPerformance.colEmployeeName'), accessorKey: 'employeeName' },
    { header: t('employeeReportPerformance.colEmployeeId'), accessorKey: 'id' },
    { header: t('employeeReportPerformance.colOrders'), accessorKey: 'orders' },
    { header: t('employeeReportPerformance.colIncidentReport'), accessorKey: 'incidentReport' },
  ];

  return (
    <PageLayout title={t('employeeReportPerformance.pageTitle')}>
       <div className="mb-4">
         <Link href="/reports/employee" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
           <ArrowLeft size={20} />
           <span>{t('employeeReportPerformance.backToEmployeeReports')}</span>
         </Link>
       </div>

       {/* Filters Section */}
       <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
           <Input
             label={t('employeeReportPerformance.labelStartDate')}
             type="date"
             name="startDate"
             value={startDate}
             onChange={(e) => setStartDate(e.target.value)}
           />
           <Input
             label={t('employeeReportPerformance.labelEndDate')}
             type="date"
             name="endDate"
             value={endDate}
             onChange={(e) => setEndDate(e.target.value)}
           />
           <Button onClick={handleFetchReport} disabled={loading}>
             {loading ? t('employeeReportPerformance.generating') : t('employeeReportPerformance.generateReport')}
           </Button>
         </div>
         {validationError && (
           <p className="mt-2 text-sm text-red-600">{t('employeeReportPerformance.validationError')}</p>
         )}
       </div>

       <ReportTypeTable<PerformanceRecord>
         title={tableTitle}
         data={performanceData?.performanceDetails || []}
         columns={performanceColumns}
         isLoading={loading}
       />

       <ConfirmationModal
         isOpen={!!error}
         onClose={handleCloseErrorModal}
         title={t('employeeReportPerformance.errorTitle')}
         message={typeof error === 'string' ? error : (error as any)?.message || t('employeeReportPerformance.errorMsg')}
         isAlert={true}
         okText={t('employeeReportPerformance.ok')}
       />
     </PageLayout>
  );
};

export default PerformanceReportPage;