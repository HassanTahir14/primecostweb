import React from 'react';
import { OtherPayrollItem } from '@/store/otherPayrollSlice'; // Import the type
import { useTranslation } from '@/context/TranslationContext';

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
  const { t } = useTranslation();
  return (
    <div className="overflow-x-auto">
      {isLoading ? (
        <div className="text-center py-10 text-gray-500">{t('employees.loadingPayroll')}</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{t('employees.errorLoadingPayroll')}</div>
      ) : (
        <table className="w-full text-left">
          <thead className="text-gray-500 text-sm">
            <tr>
              <th className="py-3 px-4 font-medium border-b">{t('employees.userId')}</th>
              <th className="py-3 px-4 font-medium border-b">{t('employees.employeeName')}</th>
              <th className="py-3 px-4 font-medium border-b">{t('employees.type')}</th>
              <th className="py-3 px-4 font-medium border-b">{t('employees.date')}</th>
              <th className="py-3 px-4 font-medium border-b">{t('employees.amount')}</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {payrolls && payrolls.length > 0 ? (
              payrolls.map((item: OtherPayrollItem) => (
                <tr key={item.userId} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border-b">{item.userId}</td>
                  <td className="py-3 px-4 border-b">{item.employeeName || t('common.na')}</td>
                  <td className="py-3 px-4 border-b capitalize">{item.type || t('common.na')}</td>
                  <td className="py-3 px-4 border-b">
                    {item.dated ? new Date(item.dated).toLocaleDateString() : t('common.na')}
                  </td>
                  <td className="py-3 px-4 border-b">
                    {item.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500 border-b">
                  {t('employees.noOtherPayrollData')}
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