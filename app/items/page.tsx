'use client';

import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import SearchInput from '@/components/common/SearchInput';
import AddItemForm from '@/components/AddItemForm';
import Categories from '@/components/Categories';

interface Item {
  name: string;
  quantity: number;
  units: string;
  brand: string;
  expiry: string;
  supplier: string;
  cost: string;
}

const items: Item[] = [
  {
    name: 'Potatoes',
    quantity: 1,
    units: 'volume',
    brand: 'Lorem',
    expiry: '12/12/12',
    supplier: 'Bruno',
    cost: 'SAR 5.33'
  },
  {
    name: 'Bags',
    quantity: 1,
    units: 'volume',
    brand: 'Lorem',
    expiry: '12/12/12',
    supplier: 'Bruno',
    cost: 'SAR 5.33'
  },
  {
    name: 'Bread',
    quantity: 1,
    units: 'volume',
    brand: 'Lorem',
    expiry: '12/12/12',
    supplier: 'Bruno',
    cost: 'SAR 5.33'
  },
  {
    name: 'Milk',
    quantity: 1,
    units: 'volume',
    brand: 'Lorem',
    expiry: '12/12/12',
    supplier: 'Bruno',
    cost: 'SAR 5.33'
  },
  {
    name: 'Coleslaw',
    quantity: 1,
    units: 'volume',
    brand: 'Lorem',
    expiry: '12/12/12',
    supplier: 'Bruno',
    cost: 'SAR 5.33'
  },
  {
    name: 'Soft Drink',
    quantity: 1,
    units: 'volume',
    brand: 'Lorem',
    expiry: '12/12/12',
    supplier: 'Bruno',
    cost: 'SAR 5.33'
  }
];

export default function ItemsMasterList() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  return (
    <PageLayout title="Items Master List">
      {showAddForm ? (
        <AddItemForm onClose={() => setShowAddForm(false)} />
      ) : showCategories ? (
        <Categories onClose={() => setShowCategories(false)} />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6 gap-4">
            <SearchInput placeholder="Search items..." />
            <div className="flex gap-3">
              <Button onClick={() => setShowAddForm(true)}>Add Item</Button>
              <Button onClick={() => setShowCategories(true)}>Category</Button>
            </div>
          </div>

          <div className="bg-white bg-opacity-50 p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg">
            <h2 className="text-base md:text-lg font-bold mb-4">Items List</h2>
            <div className="bg-white bg-opacity-50 rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Units of measure
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Brand name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expiry date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supplier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purchase cost
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.units}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.brand}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.expiry}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.supplier}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.cost}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </PageLayout>
  );
} 