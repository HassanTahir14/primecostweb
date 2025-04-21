import React from 'react';
import { OtherPayrollItem } from '@/store/otherPayrollSlice'; // Import the type

interface OtherPayrollTableProps {
  payrolls: OtherPayrollItem[];
  isLoading: boolean;
  error: any | null;
}

const OtherPayrollTable: React.FC<OtherPayrollTableProps> = ({ 
  payrolls,
  isLoading,
  error
}) => {
  return (
    <div className="overflow-x-auto">
      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Loading payroll data...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">Error loading data. Please try again.</div>
      ) : (
        <table className="w-full text-left">
          <thead className="text-gray-500 text-sm">
            <tr>
              <th className="py-3 px-4 font-medium border-b">ID</th>
              <th className="py-3 px-4 font-medium border-b">Employee Name</th>
              <th className="py-3 px-4 font-medium border-b">Payroll Type</th>
              <th className="py-3 px-4 font-medium border-b">Amount (USD)</th>
              <th className="py-3 px-4 font-medium border-b">Date</th>
              <th className="py-3 px-4 font-medium border-b">Description</th>
              {/* Add Actions column if needed */}
              {/* <th className="py-3 px-4 font-medium border-b text-center">Actions</th> */}
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {payrolls && payrolls.length > 0 ? (
              payrolls.map((item: OtherPayrollItem) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border-b">{item.id}</td>
                  <td className="py-3 px-4 border-b">{item.employeeName || 'N/A'}</td>
                  <td className="py-3 px-4 border-b">{item.payrollType || 'N/A'}</td>
                  <td className="py-3 px-4 border-b">
                    {item.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </td>
                  <td className="py-3 px-4 border-b">{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</td>
                  <td className="py-3 px-4 border-b">{item.description || '-'}</td>
                  {/* Render actions if needed */}
                  {/* <td className="py-3 px-4 border-b text-center"> ... buttons ... </td> */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500 border-b">
                  No other payroll data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OtherPayrollTable; 