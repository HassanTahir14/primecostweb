'use client';

import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/ui/button';
import Link from 'next/link';

type TransferTab = 'Inventory Items' | 'Recipe' | 'Sub Recipe';

const tabs: { name: TransferTab; param: string }[] = [
  { name: 'Inventory Items', param: 'inventory' },
  { name: 'Recipe', param: 'recipe' },
  { name: 'Sub Recipe', param: 'sub-recipe' },
];

export default function TransfersPage() {
  const [activeTab, setActiveTab] = useState<TransferTab>('Inventory Items');

  const renderContent = () => {
    // In a real app, you would fetch data based on the active tab
    // For now, we just show the empty state
    
    let emptyMessage = '';
    let createLink = '';

    switch (activeTab) {
      case 'Inventory Items':
        emptyMessage = 'No transfer item found!';
        createLink = '/transfers/create?type=inventory';
        break;
      case 'Recipe':
        emptyMessage = 'No transfer recipe found!';
        createLink = '/transfers/create?type=recipe';
        break;
      case 'Sub Recipe':
        emptyMessage = 'No transfer sub recipe found!';
        createLink = '/transfers/create?type=sub-recipe';
        break;
      default:
        return null;
    }

    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
        <div className="flex justify-between items-center">
          <p className="text-gray-500">{emptyMessage}</p>
          <Link href={createLink}>
            <Button>Create New</Button>
          </Link>
        </div>
         {/* TODO: Add table here when data exists */}
      </div>
    );
  };

  return (
    <PageLayout title="Transfers">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-lg shadow-sm overflow-hidden">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`flex-1 py-3 px-6 font-medium text-sm transition-colors duration-150 text-center 
              ${activeTab === tab.name
                ? 'bg-[#00997B] text-white'
                : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Transfer {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {renderContent()}
    </PageLayout>
  );
} 