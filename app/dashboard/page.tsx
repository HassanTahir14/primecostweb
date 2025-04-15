'use client';

import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, Box, Users, PenTool } from 'lucide-react';

const data = [
  { name: 'Data 1', profit: 100, cost: 70, ideal: 120, menu: 140 },
  { name: 'Data 4', profit: 170, cost: 90, ideal: 150, menu: 160 },
  { name: 'Data 2', profit: 150, cost: 70, ideal: 100, menu: 130 },
  { name: 'Data 4', profit: 170, cost: 90, ideal: 150, menu: 160 },
  { name: 'Data 3', profit: 120, cost: 60, ideal: 130, menu: 110 },
  { name: 'Data 4', profit: 170, cost: 90, ideal: 150, menu: 160 },
  { name: 'Data 4', profit: 170, cost: 90, ideal: 150, menu: 160 },
  { name: 'Data 4', profit: 170, cost: 90, ideal: 150, menu: 160 },
];

export default function Dashboard() {
  return (
    <PageLayout title="Dashboard">
      <div>
        <div className="flex flex-col md:flex-row md:justify-end md:items-center gap-4 mb-6">
          <span className="text-gray-600 text-xs md:text-sm whitespace-nowrap">Select Date Range</span>
          <div className="flex gap-2 sm:gap-4 items-center w-full sm:w-auto">
            <input type="date" className="border rounded-full px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm w-full sm:w-auto" defaultValue="2025-04-15" />
            <span className="text-gray-600 text-xs md:text-sm">To</span>
            <input type="date" className="border rounded-full px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm w-full sm:w-auto" defaultValue="2025-04-15" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6">
          <div className="bg-[#FFE6E6] p-4 sm:p-5 md:p-6 rounded-2xl shadow-lg">
            <div className="bg-[#FF6B6B] w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-3 md:mb-4">
              <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-1">1</h2>
            <p className="text-gray-600 text-xs md:text-sm mb-1">Prepared Recipes</p>
          </div>
          <div className="bg-[#FFF2E6] p-4 sm:p-5 md:p-6 rounded-2xl shadow-lg">
            <div className="bg-[#FF9F6B] w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-3 md:mb-4">
              <Box className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-1">1</h2>
            <p className="text-gray-600 text-xs md:text-sm mb-1">Items by Supplier</p>
          </div>
          <div className="bg-[#E6FFE6] p-4 sm:p-5 md:p-6 rounded-2xl shadow-lg">
            <div className="bg-[#4CD964] w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-3 md:mb-4">
              <PenTool className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-1">2</h2>
            <p className="text-gray-600 text-xs md:text-sm mb-1">Total Orders</p>
          </div>
          <div className="bg-[#F2E6FF] p-4 sm:p-5 md:p-6 rounded-2xl shadow-lg">
            <div className="bg-[#B66BFF] w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-3 md:mb-4">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-1">4</h2>
            <p className="text-gray-600 text-xs md:text-sm mb-1">Total Employee</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm mb-6">
          <h2 className="text-base md:text-lg font-bold mb-4 md:mb-6">Profit Margin</h2>
          <div className="w-full h-[300px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="profit" name="Profit Margin" fill="#2196F3" />
                <Bar dataKey="cost" name="Total Cost" fill="#f44336" />
                <Bar dataKey="ideal" name="Ideal Selling Price" fill="#339A89" />
                <Bar dataKey="menu" name="Menu Price" fill="#9C27B0" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </PageLayout>
  );
} 