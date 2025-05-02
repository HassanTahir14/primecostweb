'use client';

import React from 'react';
// Import the correct interface from the slice
import { NonConformanceReport } from '@/store/nonConformanceSlice'; 

// Interface for the props using the imported type
interface NonConformanceReportTableProps {
  reports: NonConformanceReport[]; 
  isLoading?: boolean;
}

const NonConformanceReportTable: React.FC<NonConformanceReportTableProps> = ({ 
  reports = [], // Default to empty array
  isLoading = false 
}) => {

  // Status logic based on API data (using approvedStatus)
  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return 'bg-green-100 text-green-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700'; // Default/Unknown status
    }
  };

  const renderStatus = (status?: string) => {
      return status || 'N/A'; // Display status or N/A if undefined/null
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow p-4 sm:p-6">
      <table className="w-full min-w-[1200px]"> {/* Adjusted min-width for more columns */}
        <thead>
          <tr className="border-b bg-gray-50">
            {/* Update Headers to match API response fields */}
            <th className="text-left py-3 px-3 text-gray-600 font-semibold text-sm">Order #</th>
            <th className="text-left py-3 px-3 text-gray-600 font-semibold text-sm">Item Name</th>
            <th className="text-left py-3 px-3 text-gray-600 font-semibold text-sm">Date</th>
            <th className="text-left py-3 px-3 text-gray-600 font-semibold text-sm">Supplier</th>
            <th className="text-left py-3 px-3 text-gray-600 font-semibold text-sm">Branch</th>
            <th className="text-left py-3 px-3 text-gray-600 font-semibold text-sm">Issue Desc.</th> 
            <th className="text-left py-3 px-3 text-gray-600 font-semibold text-sm">NC Desc.</th>
            <th className="text-left py-3 px-3 text-gray-600 font-semibold text-sm">Correction</th>
            <th className="text-left py-3 px-3 text-gray-600 font-semibold text-sm">Prepared By</th>
            <th className="text-left py-3 px-3 text-gray-600 font-semibold text-sm">Approved By</th>
            <th className="text-center py-3 px-3 text-gray-600 font-semibold text-sm">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isLoading ? (
            <tr>
               {/* Update colspan to match new number of columns */}
              <td colSpan={11} className="text-center py-10 text-gray-500">Loading...</td>
            </tr>
          ) : reports.length === 0 ? (
             <tr>
               {/* Update colspan */}
              <td colSpan={11} className="text-center py-10 text-gray-500">No reports found.</td>
            </tr>
          ) : (
            // Map over the actual reports data
            reports.map((report, index) => ( 
              // Use a more reliable key if ncrNo is available and unique
              <tr key={report.ncrNo ? `ncr-${report.ncrNo}` : `ncr-index-${index}`} className="hover:bg-gray-50"> 
                {/* Render actual data fields */}
                <td className="py-3 px-3 text-sm text-gray-700">{report.orderNo ?? 'N/A'}</td>
                <td className="py-3 px-3 text-sm text-gray-700">
                  {report.itemName ? report.itemName.split('@')[0].trim() : 'N/A'}
                </td>
                <td className="py-3 px-3 text-sm text-gray-700">{report.date ?? 'N/A'}</td>
                <td className="py-3 px-3 text-sm text-gray-700">{report.supplierName ?? 'N/A'}</td>
                <td className="py-3 px-3 text-sm text-gray-700">{report.branchName ?? 'N/A'}</td>
                <td className="py-3 px-3 text-sm text-gray-700">{report.description ?? 'N/A'}</td>
                <td className="py-3 px-3 text-sm text-gray-700">{report.nonConformanceDescription ?? 'N/A'}</td>
                <td className="py-3 px-3 text-sm text-gray-700">{report.correctiveAction ?? 'N/A'}</td>
                <td className="py-3 px-3 text-sm text-gray-700">{report.preparedBy ?? 'N/A'}</td>
                <td className="py-3 px-3 text-sm text-gray-700">{report.approvedBy ?? 'N/A'}</td>
                <td className="py-3 px-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.approvedStatus)}`}>
                    {renderStatus(report.approvedStatus)}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default NonConformanceReportTable; 