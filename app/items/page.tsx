'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Users, ChevronDown } from 'lucide-react';
import Button from '@/components/ui/button';
import SearchInput from '@/components/ui/SearchInput';
import AddItemForm from '@/components/AddItemForm';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f1fff7]">
      <Sidebar isOpen={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
      
      <div className={`flex-1 flex flex-col min-h-screen ${isSidebarOpen ? 'lg:pl-[400px]' : 'pl-16 md:pl-20'}`}>
        {/* Navbar */}
        <nav className="h-14 md:h-16 border-b bg-white flex items-center justify-end px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-7 h-7 md:w-8 md:h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            </div>
            <span className="text-gray-700 text-xs md:text-sm">Walid Sulieman</span>
            <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
          </div>
        </nav>

        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {showAddForm ? (
            <AddItemForm onClose={() => setShowAddForm(false)} />
          ) : (
            <>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-[#1a2b3c]">Items Master List</h1>
              </div>

              <div className="flex justify-between items-center mb-6 gap-4">
                <SearchInput placeholder="Search items..." />
                <div className="flex gap-3">
                  <Button onClick={() => setShowAddForm(true)}>Add Item</Button>
                  <Button>Category</Button>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm">
                <h2 className="text-base md:text-lg font-bold mb-4">Items List</h2>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
        </main>
      </div>
    </div>
  );
} 