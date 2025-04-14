import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Branches | Prime Cost',
  description: 'Manage restaurant branches and locations',
};

export default function BranchesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 