'use client';

import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/ui/button';

// Mock data for SLA report
const mockSlaData = [
  { id: 1, type: 'Test Item New Item', from: 'Sulieman walid', date: '2025-03-15', status: 'APPROVED' },
  { id: 2, type: 'Test Item-UpdateItem', from: 'Sulieman walid', date: '2025-03-15', status: 'APPROVED' },
  { id: 3, type: 'Test Item-Created New Purchase Order', from: 'Sulieman walid', date: '2025-03-15', status: 'APPROVED' },
  { id: 4, type: 'Test Item- Updated Purchase order Status', from: 'Sulieman walid', date: '2025-03-15', status: 'APPROVED' },
  { id: 5, type: 'Test Recipe New Recipe', from: 'Sulieman walid', date: '2025-03-15', status: 'APPROVED' },
  { id: 6, type: 'Test Item', from: 'Sulieman walid', date: '2025-03-16', status: 'REJECTED' },
  { id: 7, type: 'Test Item-Created New Purchase Order', from: 'Sulieman walid', date: '2025-03-22', status: 'PENDING' },
];

export default function SlaReportPage() {
  return (
    <PageLayout title="SLA Report">
      <div className="space-y-6">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#00997B] text-white rounded-lg p-4 flex justify-between items-center">
            <span className="font-medium">Total Request</span>
            <span className="bg-white text-[#00997B] rounded-full px-2 py-0.5 text-sm font-semibold">18</span>
          </div>
          <div className="bg-[#00997B] text-white rounded-lg p-4 flex justify-between items-center">
            <span className="font-medium">Approved</span>
            <span className="bg-white text-[#00997B] rounded-full px-2 py-0.5 text-sm font-semibold">5</span>
          </div>
          <div className="bg-[#00997B] text-white rounded-lg p-4 flex justify-between items-center">
            <span className="font-medium">Rejected</span>
            <span className="bg-white text-[#00997B] rounded-full px-2 py-0.5 text-sm font-semibold">1</span>
          </div>
          <div className="bg-[#00997B] text-white rounded-lg p-4 flex justify-between items-center">
            <span className="font-medium">Pending</span>
            <span className="bg-white text-[#00997B] rounded-full px-2 py-0.5 text-sm font-semibold">12</span>
          </div>
        </div>

        {/* SLA Report Table */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">SLA Report</h2>
            <Button>
              Export Data
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="py-3 px-4 font-medium text-gray-600">Type</th>
                  <th className="py-3 px-4 font-medium text-gray-600">ID</th>
                  <th className="py-3 px-4 font-medium text-gray-600">From</th>
                  <th className="py-3 px-4 font-medium text-gray-600">Dated</th>
                  <th className="py-3 px-4 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockSlaData.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 px-4">{item.type}</td>
                    <td className="py-3 px-4">{item.id}</td>
                    <td className="py-3 px-4">{item.from}</td>
                    <td className="py-3 px-4">{item.date}</td>
                    <td className="py-3 px-4 font-semibold">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageLayout>
  );
} 