'use client';

import api from '@/store/api';
import { useEffect, useState } from 'react';
import { useUnits } from '@/hooks/useUnits';

export default function InventoryByItems() {
  const [searchQuery, setSearchQuery] = useState('');
  const [groupedItems, setGroupedItems] = useState<any[]>([]);
  const { units } = useUnits();

  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const response = await api.post('/inventory/view/items', {page: 0, size: 200000});
        const items = response?.data?.inventorylist || [];

        // Group items by itemId
        const itemMap = new Map();
        items.forEach((item: any) => {
          if (!itemMap.has(item.itemId)) {
            itemMap.set(item.itemId, {
              id: item.itemId,
              code: item.itemCode,
              name: item.itemName?.split('@')[0] || '',
              storageInfo: [],
              primaryUnitId: item.primaryUnitId,
              primaryUnitValue: item.primaryUnitValue,
              secondaryUnitId: item.secondaryUnitId,
              secondaryUnitValue: item.secondaryUnitValue,
            });
          }
          // Add storage info for this location
          itemMap.get(item.itemId).storageInfo.push({
            storageLocation: item.storageLocation,
            branchLocation: item.branchLocation,
            quantity: item.totalQuantity / (item.secondaryUnitValue || 1),
            unitId: item.primaryUnitId,
          });
        });
        setGroupedItems(Array.from(itemMap.values()));
      } catch (error) {
        console.error('Failed to fetch inventory items:', error);
        setGroupedItems([]);
      }
    };
    fetchInventoryItems();
  }, []);

  // Helper to get unit name by id
  const getUnitName = (unitId: number) => {
    const unit = units.find(u => u.unitOfMeasurementId === Number(unitId));
    return unit ? unit.unitName : '';
  };

  const filteredItems = groupedItems.filter((item: any) =>
    (item?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#00997B] text-white text-sm">
            <tr>
              <th className="px-6 py-4 text-left">Item Code</th>
              <th className="px-6 py-4 text-left">Item Name & Description</th>
              <th className="px-6 py-4 text-left">Branch</th>
              <th className="px-6 py-4 text-left">In Stock With Storage Location</th>
              <th className="px-6 py-4 text-left">UOM</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.length > 0 ? (
              filteredItems.map((item: any) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 align-top">{item.code}</td>
                  <td className="px-6 py-4 align-top">{item.name}</td>
                  <td className="px-6 py-4 align-top">{item.storageInfo[0]?.branchLocation || ''}</td>
                  <td className="px-6 py-4 align-top">
                    {item.storageInfo.map((s: any, idx: number) => (
                      <div key={idx}>
                        {s.storageLocation} = <b>{s.quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {getUnitName(s.unitId)}</b>
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 align-top">
                    {`${item.primaryUnitValue ?? 1} ${getUnitName(item.primaryUnitId)} = ${item.secondaryUnitValue ?? ''} ${getUnitName(item.secondaryUnitId)}`}
                  </td>
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
