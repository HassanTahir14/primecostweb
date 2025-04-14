'use client';

import { useState } from 'react';

// Mock data for inventory items
const mockInventoryItems = [
  { id: 1, code: 'ITEM-202836723', name: 'Test Item', storage: 'Walking Freezer - Butchery, Main Brnach', quantity: 339.50, unit: 'KILOGRAM (KG): 1.0 GRAM (GRM): 1000.0' },
];

export default function InventoryByItems() {
  const [searchQuery, setSearchQuery] = useState('');
  const [inventoryItems, setInventoryItems] = useState(mockInventoryItems);

  const filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#00997B] text-white text-sm">
            <tr>
              <th className="px-6 py-4 text-left">Item Code</th>
              <th className="px-6 py-4 text-left">Item Name & Description</th>
              <th className="px-6 py-4 text-left">Storage Location, Branch</th>
              <th className="px-6 py-4 text-left">Total Quantity</th>
              <th className="px-6 py-4 text-left">UOM</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4">{item.code}</td>
                <td className="px-6 py-4">{item.name}</td>
                <td className="px-6 py-4">{item.storage}</td>
                <td className="px-6 py-4">{item.quantity} KG</td>
                <td className="px-6 py-4">{item.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 