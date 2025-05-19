'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import ReportTypeTable, { ColumnDefinition } from '@/components/reports/ReportTypeTable';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/context/TranslationContext';

// Mock data structure for Employee Report Type (Image 9)
interface EmployeeReportData {
  employee: string;
  iqamaId: string;
  iqamaExpiry: string;
  status: 'Active' | 'Expired';
}

// Mock data - replace with actual data fetching based on reportType
const mockEmployeeReportData: EmployeeReportData[] = [
  { employee: 'emp1', iqamaId: '12/04/2025', iqamaExpiry: '12/04/2025', status: 'Active' },
  { employee: 'emp2', iqamaId: '12/04/2024', iqamaExpiry: '12/04/2024', status: 'Expired' },
  { employee: 'emp3', iqamaId: '12/04/2023', iqamaExpiry: '12/04/2023', status: 'Expired' },
  { employee: 'emp4', iqamaId: '12/04/2027', iqamaExpiry: '12/04/2027', status: 'Active' },
  { employee: 'emp5', iqamaId: '12/04/2029', iqamaExpiry: '12/04/2029', status: 'Active' },
];

export default function DynamicEmployeeReportPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { reportType } = params;

  // Define columns for the Employee Report Type (Image 9)
  const employeeReportColumns: ColumnDefinition<EmployeeReportData>[] = [
    { header: t('employeeReportDynamic.colEmployee'), accessorKey: 'employee' },
    { header: t('employeeReportDynamic.colIqamaId'), accessorKey: 'iqamaId' },
    { header: t('employeeReportDynamic.colIqamaExpiry'), accessorKey: 'iqamaExpiry' },
    {
      header: t('employeeReportDynamic.colStatus'),
      accessorKey: 'status',
      cell: (status) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {status === 'Active'
            ? t('employeeReportDynamic.statusActive')
            : t('employeeReportDynamic.statusExpired')}
        </span>
      ),
      cellClassName: 'text-center'
    },
  ];

  // Helper function to get report details based on slug
  const getReportDetails = (reportTypeSlug: string | string[] | undefined) => {
    const slug = Array.isArray(reportTypeSlug) ? reportTypeSlug[0] : reportTypeSlug;
    switch (slug) {
      case 'items-expiry':
      case 'items-supplier':
      case 'purchase-summary':
      case 'stock-summary':
      case 'purchase-supplier':
      case 'purchase-category':
        return {
          title: t('employeeReportDynamic.pageTitle'),
          columns: employeeReportColumns,
          data: mockEmployeeReportData,
          isLoading: false,
        };
      default:
        return {
          title: t('employeeReportDynamic.unknownTitle'),
          columns: [],
          data: [],
          isLoading: false,
        };
    }
  };

  const { title, columns, data, isLoading } = getReportDetails(reportType);

  if (!reportType) {
    return <PageLayout title={t('employeeReportDynamic.errorTitle')}><div>{t('employeeReportDynamic.errorNoType')}</div></PageLayout>;
  }

  return (
    <PageLayout title={title}>
      <div className="mb-4">
        <Link href="/reports/employee" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
          <ArrowLeft size={20} />
          <span>{t('employeeReportDynamic.backToEmployeeReports')}</span>
        </Link>
      </div>
      <ReportTypeTable
        title={title}
        columns={columns as ColumnDefinition<any>[]}
        data={data}
        isLoading={isLoading}
        showExportButton={true}
      />
    </PageLayout>
  );
}