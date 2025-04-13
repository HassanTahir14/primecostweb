'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, Box, Users, PenTool, ChevronDown } from 'lucide-react';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f8fdf9]">
      <Sidebar isOpen={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
      
      <div className={`flex-1 flex flex-col min-h-screen ${isSidebarOpen ? 'lg:pl-[400px]' : 'pl-16 md:pl-20'}`}>
        {/* Navbar */}
        <nav className="h-14 md:h-16 border-b bg-white flex items-center justify-end px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-7 h-7 md:w-8 md:h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            </div>
            <span className="text-gray-700 text-xs md:text-sm">Walid Sulieman</span>
            <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
          </div>
        </nav>

        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-[#1a2b3c]">Dashboard</h1>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center">
              <span className="text-gray-600 text-xs md:text-sm whitespace-nowrap">Select Date Range</span>
              <div className="flex gap-2 sm:gap-4 items-center w-full sm:w-auto">
                <input type="date" className="border rounded-full px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm w-full sm:w-auto" value="2025-04-13" />
                <span className="text-gray-600 text-xs md:text-sm">To</span>
                <input type="date" className="border rounded-full px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm w-full sm:w-auto" value="2025-04-13" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6">
            <div className="bg-red-50 p-4 sm:p-5 md:p-6 rounded-2xl shadow-sm">
              <div className="bg-red-400 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-3 md:mb-4">
                <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-1">42</h2>
              <p className="text-gray-600 text-xs md:text-sm mb-1">Prepared Recipes</p>
              <p className="text-blue-500 text-xs md:text-sm">+8% from yesterday</p>
            </div>

            <div className="bg-orange-50 p-4 sm:p-5 md:p-6 rounded-2xl shadow-sm">
              <div className="bg-orange-400 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-3 md:mb-4">
                <Box className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-1">300</h2>
              <p className="text-gray-600 text-xs md:text-sm mb-1">Items by Supplier</p>
              <p className="text-blue-500 text-xs md:text-sm">+5% from yesterday</p>
            </div>

            <div className="bg-green-50 p-4 sm:p-5 md:p-6 rounded-2xl shadow-sm">
              <div className="bg-green-400 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-3 md:mb-4">
                <PenTool className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-1">SAR 400.5</h2>
              <p className="text-gray-600 text-xs md:text-sm mb-1">Total Purchases</p>
              <p className="text-blue-500 text-xs md:text-sm">+1.2% from yesterday</p>
            </div>

            <div className="bg-purple-50 p-4 sm:p-5 md:p-6 rounded-2xl shadow-sm">
              <div className="bg-purple-400 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-3 md:mb-4">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-1">8</h2>
              <p className="text-gray-600 text-xs md:text-sm mb-1">Items by Employee</p>
              <p className="text-blue-500 text-xs md:text-sm">+0.5% from yesterday</p>
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
                  <Bar dataKey="ideal" name="Ideal Selling Price" fill="#4CAF50" />
                  <Bar dataKey="menu" name="Menu Price" fill="#9C27B0" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm mb-6">
            <h2 className="text-base md:text-lg font-bold mb-4 md:mb-6">Reports</h2>
            <div className="flex flex-wrap gap-2 md:gap-4">
              {[
                'Non Conformance Report',
                'Recipe Report',
                'Purchase Report',
                'Employee Data Report',
                'Transfer Report'
              ].map((report) => (
                <button
                  key={report}
                  className="bg-emerald-600 text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full hover:bg-emerald-700 transition-colors text-xs md:text-sm"
                >
                  {report}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
                <h2 className="text-base md:text-lg font-bold">Top Suppliers by Trade</h2>
                <button className="bg-emerald-600 text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full hover:bg-emerald-700 transition-colors text-xs md:text-sm w-full sm:w-auto">
                  View Report
                </button>
              </div>
              {[
                { name: 'Supplier 1', percentage: 45 },
                { name: 'Supplier 2', percentage: 35 },
                { name: 'Supplier 3', percentage: 25 },
                { name: 'Supplier 4', percentage: 15 },
              ].map((supplier, index) => (
                <div key={supplier.name} className="mb-4 last:mb-0">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs md:text-sm">{index + 1}. {supplier.name}</span>
                    <span className="text-emerald-600 rounded-full border border-emerald-600 px-3 md:px-4 py-1 text-xs md:text-sm">
                      {supplier.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 md:h-2">
                    <div
                      className="bg-emerald-600 h-1.5 md:h-2 rounded-full"
                      style={{ width: `${supplier.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
                <h2 className="text-base md:text-lg font-bold">Items by Country Origin</h2>
                <button className="bg-emerald-600 text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full hover:bg-emerald-700 transition-colors text-xs md:text-sm w-full sm:w-auto">
                  View Report
                </button>
              </div>
              <div className="h-[200px] sm:h-[300px] bg-blue-50 rounded-2xl flex items-center justify-center">
                <span className="text-gray-500 text-xs md:text-sm">World Map Visualization</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 