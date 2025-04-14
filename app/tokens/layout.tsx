import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tokens | Prime Cost',
  description: 'Manage tokens for your restaurant',
};

export default function TokensLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 