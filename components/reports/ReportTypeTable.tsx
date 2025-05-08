'use client';

import React from 'react';
import Button from '@/components/common/button';
import { Download } from 'lucide-react';
import { exportToCSV } from '@/utils/exportUtils';
import Loader from '../common/Loader';

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
  exportFileName?: string;
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
  showExportButton = true,
  exportFileName = "report"
}: ReportTypeTableProps<T>) {

  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];

  const handleExport = () => {
    if (safeData.length === 0) {
      console.warn('No data available for export');
      return;
    }

    // Create headers mapping from columns
    const headers = columns.reduce((acc, col) => {
      acc[String(col.accessorKey)] = col.header;
      return acc;
    }, {} as Record<string, string>);

    // Transform data to match column structure
    const exportData = safeData.map(row => {
      const transformedRow: Record<string, any> = {};
      columns.forEach(col => {
        const key = String(col.accessorKey);
        const value = getNestedValue(row, key);
        transformedRow[key] = col.cell ? col.cell(value, row) : value;
      });
      return transformedRow;
    });

    const date = new Date().toISOString().split('T')[0];
    const filename = `${exportFileName}-${date}`;
    exportToCSV(exportData, filename, headers);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">{title}</h2>
        {showExportButton && safeData.length > 0 && (
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Export to PDF
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
            {isLoading ? (
              <tr>
                    <td colSpan={columns.length} className="text-center py-10 text-gray-500">
                      <Loader size="medium" />
                    </td>
              </tr>
            ) : safeData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-10 text-gray-500">No data available.</td>
              </tr>
            ) : (
              safeData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {columns.map((col) => {
                    const rawValue = getNestedValue(row, String(col.accessorKey));
                    const cellContent = col.cell 
                      ? col.cell(rawValue, row)
                      : rawValue !== null && rawValue !== undefined ? String(rawValue) : '-';
                      
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