'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import ReportTypeTable, { ColumnDefinition } from '@/components/reports/ReportTypeTable';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Mock data structure for Recipe Report Type (Image 4)
interface RecipeReportTypeData {
  type: string;
  id: string;
  from: number | string; // Can be string or number based on context
  dated: string;
}

// Mock data - replace with actual data fetching based on reportType
const mockRecipeReportData: RecipeReportTypeData[] = [
  { type: 'type1', id: '123C786', from: 5, dated: '4/10/24' },
  { type: 'type2', id: '123C678', from: 7, dated: '4/10/24' },
  { type: 'type3', id: '123C678', from: 0, dated: '4/10/24' },
  { type: 'type4', id: '123C678', from: 0, dated: '4/10/24' },
];

// Define columns for the Recipe Report Type (Image 4)
const recipeReportTypeColumns: ColumnDefinition<RecipeReportTypeData>[] = [
  { header: 'Type', accessorKey: 'type' },
  { header: 'ID', accessorKey: 'id' },
  { header: 'From', accessorKey: 'from' },
  { header: 'Dated', accessorKey: 'dated' },
];

// Helper function to get report details based on slug
// In a real app, this might involve API calls or more complex logic
const getReportDetails = (reportTypeSlug: string | string[] | undefined) => {
  const slug = Array.isArray(reportTypeSlug) ? reportTypeSlug[0] : reportTypeSlug;
  
  // Example: Map slug to title, columns, and data
  switch (slug) {
    case 'food-cost': // Example slug
    case 'prepared-items-report':
    case 'prepared-items-category':
    case 'prepared-items-person':
    case 'yield-analysis':
    case 'recipe-category':
      // For now, all recipe report types use the same mock data/columns based on Image 4
      return {
        title: 'Recipe Report Type', // You might want a more dynamic title
        columns: recipeReportTypeColumns,
        data: mockRecipeReportData,
        isLoading: false, // Placeholder
      };
    // Add cases for other report types if they have different structures
    default:
      return {
        title: 'Unknown Report',
        columns: [],
        data: [],
        isLoading: false,
      };
  }
};

export default function DynamicRecipeReportPage() {
  const params = useParams();
  const router = useRouter();
  const { reportType } = params;

  const { title, columns, data, isLoading } = getReportDetails(reportType);

  if (!reportType) {
    // Handle case where reportType is not available (optional)
    return <PageLayout title="Error"><div>Report type not specified.</div></PageLayout>;
  }

  return (
    <PageLayout title={title}> 
       <div className="mb-4">
         <Link href="/reports/recipe" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
            <ArrowLeft size={20} />
            <span>Back to Recipe Reports</span>
          </Link>
      </div>
      <ReportTypeTable 
        title={title} // Pass title to the table component as well
        columns={columns as ColumnDefinition<any>[]} // Cast columns to any type
        data={data}
        isLoading={isLoading}
        showExportButton={true} // Show export button for this type
      />
    </PageLayout>
  );
} 