'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchRecipesTransferred, clearTransferReportError } from '@/store/transferReportsSlice';
import { RecipeTransferRecord } from '@/store/transferReportsApi'; // Import record type
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import ReportTypeTable, { ColumnDefinition } from '@/components/reports/ReportTypeTable';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getDefaultDateRange } from '@/utils/dateUtils';

// Column Definitions
const recipeColumns: ColumnDefinition<RecipeTransferRecord>[] = [
    { header: 'Recipe Name', accessorKey: 'recipeName' },
    { header: 'Branch', accessorKey: 'branch' },
    { header: 'Quantity', accessorKey: 'quantity', cellClassName: 'text-right' },
    { header: 'Unit', accessorKey: 'unit', cellClassName: 'text-center' },
    { header: 'Cost', accessorKey: 'cost', cellClassName: 'text-right', cell: (value) => value?.toFixed(2) ?? 'N/A' },
    { header: 'Date', accessorKey: 'orderDate', cellClassName: 'text-center' }, // Assuming orderDate is transfer date
];

const RecipesTransferredReportPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { data: reportData, loading, error } = useSelector((state: RootState) => state.transferReports.recipesTransferred);

  const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDateRange();
  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch data on first load
  useEffect(() => {
    dispatch(clearTransferReportError('recipesTransferred'));
    dispatch(fetchRecipesTransferred({ startDate, endDate }));
  }, []); // Empty dependency array means this runs once on mount

  const handleFetchReport = () => {
    if (!startDate || !endDate) {
        setValidationError('Please select both a Start Date and End Date.');
        return;
    }
    setValidationError(null);
    dispatch(clearTransferReportError('recipesTransferred'));
    dispatch(fetchRecipesTransferred({ startDate, endDate }));
  };

  const handleCloseErrorModal = () => {
    dispatch(clearTransferReportError('recipesTransferred'));
  };

  const tableTitle = "Transferred Recipes Report Results";

  return (
    <PageLayout title="Recipes Transferred Report">
      <div className="mb-4">
        <Link href="/reports/transfer" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
          <ArrowLeft size={20} />
          <span>Back to Transfer Reports</span>
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

      <ReportTypeTable<RecipeTransferRecord>
        title={tableTitle}
        data={reportData?.recipes || []} // Access nested array
        columns={recipeColumns}
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

export default RecipesTransferredReportPage; 