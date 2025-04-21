'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FC } from 'react';
import PageLayout from '@/components/PageLayout';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface TableRowProps {
  label: string;
  value: any;
}

interface DutySchedule {
  day: string;
  openingShift: string;
  breakTime: string;
  closingShift: string;
}

const TableRow: FC<TableRowProps> = ({ label, value }) => (
  <tr className="border-b border-gray-200">
    <td className="py-3 px-4 text-sm font-medium text-gray-500">{label}</td>
    <td className="py-3 px-4 text-sm text-gray-900">{value || 'N/A'}</td>
  </tr>
);

export default function EmployeeDetailPage() {
  const router = useRouter();
  const { employeeId } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const employee: any = useSelector((state: RootState) => 
    state.employee.employees.find(emp => emp.employeeId === Number(employeeId))
  );

  useEffect(() => {
    if (!employee && !isLoading) {
      setError('Employee not found');
    } else {
      setIsLoading(false);
    }
  }, [employee, isLoading]);

  const handleBack = () => {
    router.push('/employees');
  };

  const formatCurrency = (amount: any) => {
    return `USD ${(amount || 0).toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`;
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    if (error) {
      return <div className="text-center text-red-500">{error}</div>;
    }

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center gap-2 mb-4">
          <Link href="/employees" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </Link>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
          </div>
          <table className="w-full">
            <tbody>
              <TableRow 
                label="First Name" 
                value={employee?.employeeDetailsDTO?.firstname} 
              />
              <TableRow 
                label="Family Name" 
                value={employee?.employeeDetailsDTO?.familyName} 
              />
              <TableRow 
                label="Date of Birth" 
                value={employee?.employeeDetailsDTO?.dateOfBirth} 
              />
              <TableRow 
                label="Mobile Number" 
                value={employee?.employeeDetailsDTO?.mobileNumber} 
              />
              <TableRow 
                label="Position" 
                value={employee?.employeeDetailsDTO?.position} 
              />
            </tbody>
          </table>
        </div>

        {/* Documents & IDs */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <h3 className="text-lg font-medium text-gray-900">Documents & IDs</h3>
          </div>
          <table className="w-full">
            <tbody>
              <TableRow 
                label="Health Card Number" 
                value={employee?.employeeDetailsDTO?.healthCardNumber} 
              />
              <TableRow 
                label="Health Card Expiry" 
                value={employee?.employeeDetailsDTO?.healthCardExpiry} 
              />
              <TableRow 
                label="Iqama ID" 
                value={employee?.employeeDetailsDTO?.iqamaId} 
              />
              <TableRow 
                label="Iqama Expiry Date" 
                value={employee?.employeeDetailsDTO?.iqamaExpiryDate} 
              />
            </tbody>
          </table>
        </div>

        {/* Login Details */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <h3 className="text-lg font-medium text-gray-900">Login Details</h3>
          </div>
          <table className="w-full">
            <tbody>
              <TableRow 
                label="Login ID" 
                value={employee?.employeeDetailsDTO?.loginId} 
              />
            </tbody>
          </table>
        </div>

        {/* Duty Schedule */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <h3 className="text-lg font-medium text-gray-900">Duty Schedule</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Day</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Opening</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Break</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Closing</th>
                </tr>
              </thead>
              <tbody>
                {(employee?.dutyScheduleResponseList || []).map((schedule: DutySchedule, index: number) => (
                  <tr 
                    key={schedule.day} 
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{schedule.day}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {schedule.openingShift === '00:00:00' ? '-' : schedule.openingShift}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {!schedule.breakTime || schedule.breakTime === '00:00:00' ? '-' : schedule.breakTime}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {schedule.closingShift === '00:00:00' ? '-' : schedule.closingShift}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Salary Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
              <h3 className="text-lg font-medium text-gray-900">Salary Details</h3>
            </div>
            <table className="w-full">
              <tbody>
                <TableRow 
                  label="Basic Salary" 
                  value={formatCurrency(employee?.salaryDTO?.basicSalary)} 
                />
                <TableRow 
                  label="Food Allowance" 
                  value={formatCurrency(employee?.salaryDTO?.foodAllowance)} 
                />
                <TableRow 
                  label="Accommodation" 
                  value={formatCurrency(employee?.salaryDTO?.accommodationAllowance)} 
                />
                <TableRow 
                  label="Transport" 
                  value={formatCurrency(employee?.salaryDTO?.transportAllowance)} 
                />
                <TableRow 
                  label="Other Allowance" 
                  value={formatCurrency(employee?.salaryDTO?.otherAllowance)} 
                />
                <TableRow 
                  label="Mobile Allowance" 
                  value={formatCurrency(employee?.salaryDTO?.mobileAllowance)} 
                />
              </tbody>
            </table>
          </div>
          <div className="bg-[#00997B] rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium text-white">Total Salary</h4>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(employee?.salaryDTO?.totalSalary)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <PageLayout 
      title={`Employee Details: ${employee?.employeeDetailsDTO?.firstname || ''} ${employee?.employeeDetailsDTO?.familyName || ''}`}
    >
      <div className="space-y-6">
        {renderContent()}
      </div>
    </PageLayout>
  );
} 