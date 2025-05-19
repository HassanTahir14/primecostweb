'use client';

import React from 'react';
import { useTranslation } from '@/context/TranslationContext';
// Import the correct interface from the slice
import { NonConformanceReport } from '@/store/nonConformanceSlice'; 
import Loader from '../common/Loader';

// Interface for the props using the imported type
interface NonConformanceReportTableProps {
  reports: NonConformanceReport[]; 
  isLoading?: boolean;
}

const NonConformanceReportTable: React.FC<NonConformanceReportTableProps> = ({ 
  reports = [], // Default to empty array
  isLoading = false 
}) => {
  const { t } = useTranslation();

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
      <table className="w-full min-w-[1200px]">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left py-3 px-3 text-gray-600 font-semibold text-sm">{t('nonConformance.table.orderNo')}</th>
            <th className="text-left py-3 px-3 text-gray-600 font-semibold text-sm">{t('nonConformance.table.itemName')}</th>
            <th className="text-left py-3 px-3 text-gray-600 font-semibold text-sm">{t('nonConformance.table.date')}</th>
            <th className="text-left py-3 px-3 text-gray-600 font-semibold text-sm">{t('nonConformance.table.supplier')}</th>
            <th className="text-left py-3 px-3 text-gray-600 font-semibold text-sm">{t('nonConformance.table.branch')}</th>
            <th className="text-left py-3 px-3 text-gray-600 font-semibold text-sm">{t('nonConformance.table.issueDesc')}</th>
            <th className="text-left py-3 px-3 text-gray-600 font-semibold text-sm">{t('nonConformance.table.ncDesc')}</th>
            <th className="text-left py-3 px-3 text-gray-600 font-semibold text-sm">{t('nonConformance.table.correction')}</th>
            <th className="text-left py-3 px-3 text-gray-600 font-semibold text-sm">{t('nonConformance.table.preparedBy')}</th>
            <th className="text-left py-3 px-3 text-gray-600 font-semibold text-sm">{t('nonConformance.table.approvedBy')}</th>
            <th className="text-center py-3 px-3 text-gray-600 font-semibold text-sm">{t('nonConformance.table.status')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isLoading ? (
            <tr>
              <td colSpan={11} className="text-center py-10 text-gray-500">
                <Loader size="medium" />
              </td>
            </tr>
          ) : reports.length === 0 ? (
            <tr>
              <td colSpan={11} className="text-center py-10 text-gray-500">{t('nonConformance.table.noReports')}</td>
            </tr>
          ) : (
            reports.map((report, index) => (
              <tr key={report.ncrNo ? `ncr-${report.ncrNo}` : `ncr-index-${index}`} className="hover:bg-gray-50">
                <td className="py-3 px-3 text-sm text-gray-700">{report.orderNo ?? 'N/A'}</td>
                <td className="py-3 px-3 text-sm text-gray-700">{report.itemName ? report.itemName.split('@')[0].trim() : 'N/A'}</td>
                <td className="py-3 px-3 text-sm text-gray-700">{report.date ?? 'N/A'}</td>
                <td className="py-3 px-3 text-sm text-gray-700">{report.supplierName ?? 'N/A'}</td>
                <td className="py-3 px-3 text-sm text-gray-700">{report.branchName ?? 'N/A'}</td>
                <td className="py-3 px-3 text-sm text-gray-700">{report.description ?? 'N/A'}</td>
                <td className="py-3 px-3 text-sm text-gray-700">{report.nonConformanceDescription ?? 'N/A'}</td>
                <td className="py-3 px-3 text-sm text-gray-700">{report.correctiveAction ?? 'N/A'}</td>
                <td className="py-3 px-3 text-sm text-gray-700">{report.preparedBy ?? 'N/A'}</td>
                <td className="py-3 px-3 text-sm text-gray-700">{report.approvedBy ?? 'N/A'}</td>
                <td className="py-3 px-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.approvedStatus)}`}>{renderStatus(report.approvedStatus)}</span>
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