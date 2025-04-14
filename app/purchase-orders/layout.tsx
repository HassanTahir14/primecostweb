import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Purchase Orders | Prime Cost',
  description: 'Manage purchase orders for your kitchen',
};

export default function PurchaseOrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 