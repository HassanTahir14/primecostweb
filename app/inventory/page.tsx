'use client';

import { useState } from 'react';
import { useTranslation } from '@/context/TranslationContext';
import PageLayout from '@/components/PageLayout';
import InventoryByItems from '@/components/inventory/InventoryByItems';
import InventoryByRecipe from '@/components/inventory/InventoryByRecipe';
import InventoryBySubRecipe from '@/components/inventory/InventoryBySubRecipe';

export default function Inventory() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('items');

  const tabs = [
    { id: 'items', name: t('inventory.tabs.items') },
    { id: 'recipe', name: t('inventory.tabs.recipe') },
    { id: 'subrecipe', name: t('inventory.tabs.subrecipe') }
  ];

  return (
    <PageLayout title={t('inventory.pageTitle')}>
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