'use client';

import api from '@/store/api';
import { useEffect, useState } from 'react';
import { useUnits } from '@/hooks/useUnits';
import { useTranslation } from '@/context/TranslationContext';

export default function InventoryByItems() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [groupedItems, setGroupedItems] = useState<any[]>([]);
  const { units } = useUnits();

  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const response = await api.post('/inventory/view/items', {page: 0, size: 200000});
        const items = response?.data?.inventorylist || [];

        // Group items by itemId and branchLocation
        const itemMap = new Map();
        items.forEach((item: any) => {
          const key = `${item.itemId}_${item.branchLocation}`;
          if (!itemMap.has(key)) {
            itemMap.set(key, {
              id: item.itemId,
              code: item.itemCode,
              name: item.itemName?.split('@')[0] || '',
              branchLocation: item.branchLocation,
              storageInfo: [],
              primaryUnitId: item.primaryUnitId,
              primaryUnitValue: item.primaryUnitValue,
              secondaryUnitId: item.secondaryUnitId,
              secondaryUnitValue: item.secondaryUnitValue,
              calculationMethod: item.calculationMethod,
            });
          }
          // Add storage info for this location
          itemMap.get(key).storageInfo.push({
            storageLocation: item.storageLocation,
            branchLocation: item.branchLocation,
            quantity: item.totalQuantity,
            calculationMethod: item.calculationMethod,
            primaryUnitId: item.primaryUnitId,
            secondaryUnitId: item.secondaryUnitId,
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
              <th className="px-6 py-4 text-left">{t('inventory.items.header.code')}</th>
              <th className="px-6 py-4 text-left">{t('inventory.items.header.name')}</th>
              <th className="px-6 py-4 text-left">{t('inventory.items.header.branch')}</th>
              <th className="px-6 py-4 text-left">{t('inventory.items.header.storage')}</th>
              <th className="px-6 py-4 text-left">{t('inventory.items.header.uom')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.length > 0 ? (
              filteredItems.map((item: any) => (
                <tr key={`${item.id}_${item.branchLocation}`}>
                  <td className="px-6 py-4 align-top">{item.code}</td>
                  <td className="px-6 py-4 align-top">{item.name}</td>
                  <td className="px-6 py-4 align-top">{item.branchLocation || ''}</td>
                  <td className="px-6 py-4 align-top">
                    {item.storageInfo.map((s: any, idx: number) => {
                      let showUnit = '';
                      const calculationMethod = (s.calculationMethod || '').toUpperCase();
                      if (calculationMethod.includes('SECONDARY')) {
                        showUnit = getUnitName(s.primaryUnitId);
                      } else if (calculationMethod.includes('PRIMARY')) {
                        showUnit = getUnitName(s.secondaryUnitId);
                      } else {
                        showUnit = getUnitName(s.primaryUnitId);
                      }
                      return (
                        <div key={idx}>
                          {s.storageLocation} = <b>{s.quantity.toFixed(2)} {showUnit || '-'}</b>
                        </div>
                      );
                    })}
                  </td>
                  <td className="px-6 py-4 align-top">
                    {`${item.primaryUnitValue ?? 1} ${getUnitName(item.primaryUnitId)} = ${item.secondaryUnitValue ?? ''} ${getUnitName(item.secondaryUnitId)}`}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  {t('inventory.items.noItems')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
