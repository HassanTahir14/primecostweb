'use client';

import React from 'react';
import Button from '@/components/common/button'; // Assuming Button component exists

// Interface for Non Conformance Report Data
interface NonConformanceReport {
  id: string;
  issue: string;
  raisedBy: string;
  raisedDate: string;
  findings: string;
  actions: string;
  evidence: string;
  status: 'Closed' | 'Open' | 'Pending';
}

// Mock Data based on image
const mockReports: NonConformanceReport[] = [
  { id: '001', issue: 'Defect in Beef', raisedBy: 'Muhammad Hamza', raisedDate: '2/8/2024', findings: 'Smelling', actions: 'Replace', evidence: 'No Evidence', status: 'Closed' },
  { id: '002', issue: 'Packaging Issue', raisedBy: 'Ali Khan', raisedDate: '3/8/2024', findings: 'Broken seal', actions: 'Repack', evidence: 'No Evidence', status: 'Open' },
  { id: '003', issue: 'Wrong Labeling', raisedBy: 'Ayesha Siddiqui', raisedDate: '4/8/2024', findings: 'Incorrect details', actions: 'Relabel', evidence: 'No Evidence', status: 'Pending' },
];

interface NonConformanceReportTableProps {
  reports?: NonConformanceReport[]; // Make reports optional, use mock if not provided
  isLoading?: boolean;
  // Add handlers for actions if needed (e.g., onViewDetails)
}

const NonConformanceReportTable: React.FC<NonConformanceReportTableProps> = ({ 
  reports = mockReports, // Use mock data as default
  isLoading = false 
}) => {

  const getStatusColor = (status: NonConformanceReport['status']) => {
    switch (status) {
      case 'Closed': return 'bg-gray-100 text-gray-700';
      case 'Open': return 'bg-red-100 text-red-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow p-4 sm:p-6">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left py-3 px-3 text-gray-600 font-semibold text-sm">#</th>
            <th className="text-left py-3 px-3 text-gray-600 font-semibold text-sm">Issue</th>
            <th className="text-left py-3 px-3 text-gray-600 font-semibold text-sm">Raised By</th>
            <th className="text-left py-3 px-3 text-gray-600 font-semibold text-sm">Raised</th>
            <th className="text-left py-3 px-3 text-gray-600 font-semibold text-sm">Findings</th>
            <th className="text-left py-3 px-3 text-gray-600 font-semibold text-sm">Actions</th>
            <th className="text-left py-3 px-3 text-gray-600 font-semibold text-sm">Evidence</th>
            <th className="text-center py-3 px-3 text-gray-600 font-semibold text-sm">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isLoading && reports.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-10 text-gray-500">Loading...</td>
            </tr>
          ) : !isLoading && reports.length === 0 ? (
             <tr>
              <td colSpan={8} className="text-center py-10 text-gray-500">No reports found.</td>
            </tr>
          ) : (
            reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="py-3 px-3 text-sm text-gray-700">{report.id}</td>
                <td className="py-3 px-3 text-sm text-gray-700">{report.issue}</td>
                <td className="py-3 px-3 text-sm text-gray-700">{report.raisedBy}</td>
                <td className="py-3 px-3 text-sm text-gray-700">{report.raisedDate}</td>
                <td className="py-3 px-3 text-sm text-gray-700">{report.findings}</td>
                <td className="py-3 px-3 text-sm text-gray-700">{report.actions}</td>
                <td className="py-3 px-3 text-sm text-gray-700">{report.evidence}</td>
                <td className="py-3 px-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {report.status}
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