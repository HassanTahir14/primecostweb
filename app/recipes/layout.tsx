import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recipes | Prime Cost',
  description: 'Manage recipes for your restaurant',
};

export default function RecipesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 