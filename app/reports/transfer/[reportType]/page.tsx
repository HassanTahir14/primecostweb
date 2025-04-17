'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import ReportTypeTable, { ColumnDefinition } from '@/components/reports/ReportTypeTable';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/common/button'; // For filter buttons
import Select from '@/components/common/select'; // For filters

// Mock data structure for Materials Transfer Report (Image 11)
interface MaterialTransferData {
  rawMaterial: string;
  branch: string;
  quantity: number;
  unit: string;
  cost: string; // e.g., "SAR 5.33"
  orderDate: string;
}

// Mock data - replace with actual data fetching based on reportType
const mockMaterialTransferData: MaterialTransferData[] = [
  { rawMaterial: 'Potato', branch: 'name', quantity: 500, unit: 'kg', cost: 'SAR 5.33', orderDate: '4/10/24' },
  { rawMaterial: 'Onion', branch: 'name', quantity: 500, unit: 'kg', cost: 'SAR 5.33', orderDate: '4/10/24' },
  { rawMaterial: 'Beef', branch: 'name', quantity: 300, unit: 'kg', cost: 'SAR 5.33', orderDate: '4/10/24' },
  { rawMaterial: 'Chicken', branch: 'name', quantity: 200, unit: 'kg', cost: 'SAR 5.33', orderDate: '4/10/24' },
  { rawMaterial: 'Fish', branch: 'name', quantity: 300, unit: 'kg', cost: 'SAR 5.33', orderDate: '4/10/24' },
];

// Define columns for the Materials Transfer Report (Image 11)
const materialTransferColumns: ColumnDefinition<MaterialTransferData>[] = [
  { header: 'Raw materials', accessorKey: 'rawMaterial' },
  { header: 'Branch', accessorKey: 'branch' },
  { header: 'Quantity', accessorKey: 'quantity' },
  { header: 'Unit', accessorKey: 'unit' },
  { header: 'Cost', accessorKey: 'cost' },
  { header: 'Order Date', accessorKey: 'orderDate' },
];

// Mock options for filters
const BRANCH_OPTIONS = [
    { value: '', label: 'All Branches' },
    { value: 'branch1', label: 'Main Branch' },
    { value: 'branch2', label: 'Downtown Branch' },
];

const RAW_MATERIAL_OPTIONS = [
    { value: '', label: 'All Raw Materials' },
    { value: 'potato', label: 'Potato' },
    { value: 'onion', label: 'Onion' },
    { value: 'beef', label: 'Beef' },
     { value: 'chicken', label: 'Chicken' },
      { value: 'fish', label: 'Fish' },
];

// Helper function to get report details based on slug
const getReportDetails = (reportTypeSlug: string | string[] | undefined) => {
  const slug = Array.isArray(reportTypeSlug) ? reportTypeSlug[0] : reportTypeSlug;
  
  // Example: Map slug to title, columns, and data
  // Add cases for other transfer report types if needed
  switch (slug) {
    case 'items-branch': // This slug corresponds to the Materials Transfer Report in Image 11
    case 'items-category':
    case 'items-name':
    case 'prepared-recipe':
    case 'prepared-recipe-category':
      // Use Materials Transfer Report config for now
      return {
        title: 'Materials Transfer Report', // Adjust title based on actual report
        columns: materialTransferColumns,
        data: mockMaterialTransferData,
        isLoading: false,
        showFilters: true, // Indicate that this report type should show filters
      };
    default:
      return {
        title: 'Unknown Report',
        columns: [],
        data: [],
        isLoading: false,
        showFilters: false,
      };
  }
};

export default function DynamicTransferReportPage() {
  const params = useParams();
  const router = useRouter();
  const { reportType } = params;

  // State for filters
  const [selectedBranch, setSelectedBranch] = React.useState('');
  const [selectedMaterial, setSelectedMaterial] = React.useState('');

  const { title, columns, data, isLoading, showFilters } = getReportDetails(reportType);

  // Apply filtering logic (example, replace with actual logic/API calls)
  const filteredData = React.useMemo(() => {
      return data.filter(item => 
          (selectedBranch ? item.branch === BRANCH_OPTIONS.find(b => b.value === selectedBranch)?.label : true) && // Filter by label for mock
          (selectedMaterial ? item.rawMaterial.toLowerCase() === RAW_MATERIAL_OPTIONS.find(m => m.value === selectedMaterial)?.label.toLowerCase() : true) // Filter by label for mock
      );
  }, [data, selectedBranch, selectedMaterial]);

  if (!reportType) {
    return <PageLayout title="Error"><div>Report type not specified.</div></PageLayout>;
  }

  return (
    <PageLayout title={title}>
      <div className="mb-4">
         <Link href="/reports/transfer" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
            <ArrowLeft size={20} />
            <span>Back to Transfer Reports</span>
          </Link>
      </div>

      {/* Filter Section - Conditionally render based on report type */}
      {showFilters && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center">
              <Select 
                label="Select Branch" 
                options={BRANCH_OPTIONS} 
                value={selectedBranch} 
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="min-w-[150px]"
              />
               <Select 
                label="Raw Materials" 
                options={RAW_MATERIAL_OPTIONS} 
                value={selectedMaterial} 
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="min-w-[150px]"
              />
              {/* Add date range picker if needed */}
          </div>
      )}

      {/* Use ReportTypeTable but customize props */}
      <ReportTypeTable 
        title={title} 
        columns={columns as ColumnDefinition<any>[]} 
        data={filteredData} // Use filtered data
        isLoading={isLoading}
        // Hide the table's default export button if filters are present
        // The main export button might consider filters
        showExportButton={!showFilters} 
      />
    </PageLayout>
  );
} 