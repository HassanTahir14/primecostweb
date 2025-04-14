import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Storage Locations | Prime Cost',
  description: 'Manage storage locations for your restaurant',
};

export default function StorageLocationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 