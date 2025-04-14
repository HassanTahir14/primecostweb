import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Taxes | Prime Cost',
  description: 'Manage your tax settings',
};

export default function TaxesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 