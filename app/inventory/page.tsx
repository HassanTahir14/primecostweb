'use client';

import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import InventoryByItems from '@/components/inventory/InventoryByItems';
import InventoryByRecipe from '@/components/inventory/InventoryByRecipe';
import InventoryBySubRecipe from '@/components/inventory/InventoryBySubRecipe';

export default function Inventory() {
  const [activeTab, setActiveTab] = useState('items');

  const tabs = [
    { id: 'items', name: 'View Inventory by Items' },
    { id: 'recipe', name: 'View Inventory by Recipe' },
    { id: 'subrecipe', name: 'View Inventory by Sub Recipe' }
  ];

  return (
    <PageLayout title="Inventory">
      <div className="mb-6">
        <div className="flex space-x-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-6 text-center rounded-t-lg text-sm ${
                activeTab === tab.id
                  ? 'bg-[#00997B] text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        {activeTab === 'items' && <InventoryByItems />}
        {activeTab === 'recipe' && <InventoryByRecipe />}
        {activeTab === 'subrecipe' && <InventoryBySubRecipe />}
      </div>
    </PageLayout>
  );
} 