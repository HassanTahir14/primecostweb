import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SLA Report | Prime Cost',
  description: 'View Service Level Agreement reports',
};

export default function SlaReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 