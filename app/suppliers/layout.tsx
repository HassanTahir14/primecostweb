import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Suppliers | Prime Cost',
  description: 'Manage your suppliers',
};

export default function SuppliersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 