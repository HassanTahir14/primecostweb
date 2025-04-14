'use client';

import { useState } from 'react';
import PageLayout from '@/components/PageLayout';

// Mock data for tokens
const mockTokens = [
  { 
    id: 1, 
    type: 'Test Item New Item',
    status: 'APPROVED',
    createdAt: '15/03/2025 01:14 AM',
    updatedAt: '15/03/2025 01:14 AM',
    requestedBy: 'Sulieman'
  },
  { 
    id: 2, 
    type: 'Test Item-UpdateItem',
    status: 'APPROVED',
    createdAt: '15/03/2025 01:17 AM',
    updatedAt: '15/03/2025 01:17 AM',
    requestedBy: 'Sulieman'
  },
  { 
    id: 3, 
    type: 'Test Item-Created New Purchase Order',
    status: 'APPROVED',
    createdAt: '15/03/2025 01:17 AM',
    updatedAt: '15/03/2025 01:17 AM',
    requestedBy: 'Sulieman'
  },
  { 
    id: 4, 
    type: 'Test Item- Updated Purchase order Status',
    status: 'APPROVED',
    createdAt: '15/03/2025 01:18 AM',
    updatedAt: '15/03/2025 01:18 AM',
    requestedBy: 'Sulieman'
  },
  { 
    id: 5, 
    type: 'Test Recipe New Recipe',
    status: 'APPROVED',
    createdAt: '15/03/2025 01:19 AM',
    updatedAt: '15/03/2025 01:20 AM',
    requestedBy: 'Sulieman'
  }
];

export default function TokensPage() {
  const [isLatestTokens, setIsLatestTokens] = useState(true);
  
  return (
    <PageLayout title="Tokens">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h1 className="text-3xl font-semibold text-gray-900">Token</h1>
            
            <div className="flex space-x-4">
              <div className="bg-[#00997B] text-white rounded-lg py-3 px-5 text-center">
                <p className="font-medium">Pending: 12</p>
              </div>
              <div className="bg-[#00997B] text-white rounded-lg py-3 px-5 text-center">
                <p className="font-medium">Rejected: 1</p>
              </div>
              <div className="bg-[#00997B] text-white rounded-lg py-3 px-5 text-center">
                <p className="font-medium">Approved: 5</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end items-center">
            <label className="flex items-center cursor-pointer">
              <span className="mr-3 text-gray-700 font-medium">Latest Tokens</span>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={isLatestTokens}
                  onChange={() => setIsLatestTokens(!isLatestTokens)} 
                />
                <div className={`block w-14 h-8 rounded-full ${isLatestTokens ? 'bg-gray-400' : 'bg-gray-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ${isLatestTokens ? 'transform translate-x-6' : ''}`}></div>
              </div>
            </label>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="py-4 px-6 font-medium text-gray-600 w-1/5">Token Type</th>
                  <th className="py-4 px-6 font-medium text-gray-600 w-1/6">Status</th>
                  <th className="py-4 px-6 font-medium text-gray-600 w-1/4">
                    <div>Created at:</div>
                  </th>
                  <th className="py-4 px-6 font-medium text-gray-600 w-1/4">
                    <div>Updated at:</div>
                  </th>
                  <th className="py-4 px-6 font-medium text-gray-600 w-1/6">Requested By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockTokens.map((token) => (
                  <tr key={token.id} className="border-b border-gray-100">
                    <td className="py-4 px-6">{token.type}</td>
                    <td className="py-4 px-6 font-semibold">{token.status}</td>
                    <td className="py-4 px-6 text-gray-600">
                      Created at:{token.createdAt}
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      Updated at:{token.updatedAt}
                    </td>
                    <td className="py-4 px-6 text-[#00997B] font-semibold">{token.requestedBy}</td>
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