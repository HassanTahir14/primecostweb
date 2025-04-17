'use client';

import api from '@/store/api';
import { useEffect, useState } from 'react';

export default function InventoryByItems() {
  const [searchQuery, setSearchQuery] = useState('');
  const [inventoryItems, setInventoryItems] = useState([]);

  const filteredItems = inventoryItems.filter((item:any) =>
    (item?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const response = await api.post('/inventory/view/items', {});


        // Map the response to your desired format
        const mappedData = (response?.data?.inventorylist || []).map((item: any) => ({
          id: item?.itemId,
          code: item?.itemCode,
          name: item?.itemName,
          storage: `${item?.storageLocation || 'N/A'}, ${item?.branchLocation || 'N/A'}`,
          quantity: item?.totalQuantity != null ? item.totalQuantity / (item?.secondaryUnitValue || 1) : 0,
          unit: `KILOGRAM (KG): ${item?.primaryUnitValue ?? 1} GRAM (GRM): ${item?.secondaryUnitValue ?? 1000}`,
        }));

        setInventoryItems(mappedData);
      } catch (error) {
        console.error('Failed to fetch inventory items:', error);
        setInventoryItems([]);
      }
    };

    fetchInventoryItems();
  }, []);

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
            {filteredItems.length > 0 ? (
              filteredItems.map((item: any) => (
                <tr key={item?.id ?? Math.random()}>
                  <td className="px-6 py-4">{item?.code ?? 'N/A'}</td>
                  <td className="px-6 py-4">{item?.name ?? 'N/A'}</td>
                  <td className="px-6 py-4">{item?.storage ?? 'N/A'}</td>
                  <td className="px-6 py-4">{item?.quantity?.toFixed(2) ?? '0'} KG</td>
                  <td className="px-6 py-4">{item?.unit ?? 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No inventory items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
