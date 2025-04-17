'use client';

import React from 'react';
import Button from '@/components/common/button';
import { Download } from 'lucide-react';

// Generic Column Definition
export interface ColumnDefinition<T> {
  header: string;
  accessorKey: keyof T | string; // Allow nested accessors like 'details.name'
  // Optional cell formatter
  cell?: (value: any, row: T) => React.ReactNode;
  // Optional header/cell styling
  headerClassName?: string;
  cellClassName?: string;
}

interface ReportTypeTableProps<T> {
  data: T[];
  columns: ColumnDefinition<T>[];
  isLoading?: boolean;
  title?: string; // Optional title for the table card
  // Add props for pagination, filtering, sorting if needed later
  showExportButton?: boolean;
}

// Helper to get nested values
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

function ReportTypeTable<T extends { [key: string]: any }>({ 
  data = [], 
  columns = [], 
  isLoading = false, 
  title = "Report Data",
  showExportButton = true
}: ReportTypeTableProps<T>) {

  const handleExport = () => {
    console.log("Export data clicked");
    // TODO: Implement actual data export logic (e.g., CSV)
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">{title}</h2>
        {showExportButton && (
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Export Data
          </Button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b bg-gray-50">
              {columns.map((col) => (
                <th 
                  key={String(col.accessorKey)}
                  className={`text-left py-3 px-3 text-gray-600 font-semibold text-sm ${col.headerClassName || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-10 text-gray-500">Loading...</td>
              </tr>
            ) : !isLoading && data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-10 text-gray-500">No data available.</td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {columns.map((col) => {
                    // Get potentially nested value
                    const rawValue = getNestedValue(row, String(col.accessorKey));
                    // Check if a custom cell renderer is provided
                    const cellContent = col.cell 
                      ? col.cell(rawValue, row)
                      : rawValue !== null && rawValue !== undefined ? String(rawValue) : '-'; // Default rendering
                      
                    return (
                      <td 
                        key={String(col.accessorKey)} 
                        className={`py-3 px-3 text-sm text-gray-700 ${col.cellClassName || ''}`}
                      >
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
       {/* Add Pagination controls here if needed */}
    </div>
  );
}

export default ReportTypeTable; 