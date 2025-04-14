'use client';

import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/ui/button';
import Link from 'next/link';

// Mock data for employees
const mockEmployees = [
  { id: 1, name: 'Sulieman', position: 'Admin', iqamaId: 'IQ123456', iqamaExpiry: '2025-06-30', totalPayroll: 2180.00 },
  { id: 2, name: 'Omar', position: 'CHEF', iqamaId: '4453697508', iqamaExpiry: '2025-09-30', totalPayroll: 3985.55 },
  { id: 3, name: 'Muhammad J', position: 'CHEF', iqamaId: '1312312312', iqamaExpiry: '2025-03-27', totalPayroll: 6277.00 },
  { id: 4, name: 'Test', position: 'HEAD CHEF', iqamaId: '131231231', iqamaExpiry: '2025-03-28', totalPayroll: 10579.00 },
];

// Mock summary data
const totalEmployeesCount = mockEmployees.length;
const totalPayrollSum = mockEmployees.reduce((sum, emp) => sum + emp.totalPayroll, 0);

export default function EmployeesPage() {
  const [employees, setEmployees] = useState(mockEmployees);

  // Add Edit/Delete handlers if needed
  // const handleEdit = (id) => { ... }
  // const handleDelete = (id) => { ... }

  return (
    <PageLayout title="Kitchen Employees">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#00997B] text-white p-5 rounded-lg shadow flex justify-between items-center">
          <span className="font-medium">Total Employees</span>
          <span className="text-3xl font-semibold">{totalEmployeesCount}</span>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-lg shadow flex justify-between items-center">
          <span className="font-medium text-gray-700">Total Payroll</span>
          <span className="text-xl font-semibold text-[#00997B]">
            USD {totalPayrollSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-semibold text-gray-900">Employees</h1>
          <div className="flex gap-2 flex-shrink-0">
            <Link href="/employees/create">
              <Button>Create new employee</Button>
            </Link>
            <Button variant="secondary">Other payroll</Button> 
          </div>
        </div>

        {/* Employees Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-gray-500 text-sm">
              <tr>
                <th className="py-3 px-4 font-medium border-b">Employee Name</th>
                <th className="py-3 px-4 font-medium border-b">Positions</th>
                <th className="py-3 px-4 font-medium border-b">Iqama ID</th>
                <th className="py-3 px-4 font-medium border-b">Iqama Id Expiry</th>
                <th className="py-3 px-4 font-medium border-b">Total Payroll</th>
                {/* Add Actions header if needed */}
                {/* <th className="py-3 px-4 font-medium border-b">Actions</th> */} 
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {employees.length > 0 ? (
                employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b">{employee.name}</td>
                    <td className="py-3 px-4 border-b">{employee.position}</td>
                    <td className="py-3 px-4 border-b">{employee.iqamaId}</td>
                    <td className="py-3 px-4 border-b">{employee.iqamaExpiry}</td>
                    <td className="py-3 px-4 border-b">
                      USD {employee.totalPayroll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    {/* Add Edit/Delete buttons if needed */}
                    {/* <td className="py-3 px-4 border-b">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="destructive" size="sm">Delete</Button>
                      </div>
                    </td> */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500 border-b">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
} 