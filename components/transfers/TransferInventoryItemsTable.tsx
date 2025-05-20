'use client';

import { useState, useMemo } from 'react';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import Select from '@/components/common/select';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from '@/context/TranslationContext';

// Define interfaces for better type safety
interface UnitOfMeasurement {
  unitOfMeasurementId: number;
  unitName: string;
  unitDescription: string;
}

interface Item {
  itemId: number;
  itemName: string;
  itemCode: string;
  storageLocationId: number;
  storageLocation: string;
  branchId: number;
  totalQuantity: number;
  primaryUnitId: number;
  primaryUnitValue: number;
  secondaryUnitId: number;
  secondaryUnitValue: number;
  branchLocation: string;
  primaryUnitName?: string;
}

interface TransferInventoryItemsTableProps {
  items: any[];
  allItems: Item[];
  allItemsWithCost: any[];
  onChange: (items: any[]) => void;
  selectedBranchId: string;
  sourceBranchId: string;
  targetBranchId: string;
  units: UnitOfMeasurement[];
}

export default function TransferInventoryItemsTable({ 
  items, 
  allItems, 
  allItemsWithCost,
  onChange, 
  selectedBranchId,
  sourceBranchId,
  targetBranchId,
  units
}: TransferInventoryItemsTableProps) {
  const { t } = useTranslation();
  
  // Prepare options for Select component
  const itemOptions = useMemo(() => {
    // Check if source and target branches are the same
    if (sourceBranchId === targetBranchId && sourceBranchId !== '') {
      return [{ 
        value: '', 
        label: t('transfers.selectItem'), 
        disabled: true 
      }];
    }

    // Filter items based on selected branch
    const filteredItems = allItems.filter(item => 
      item.branchId === parseInt(sourceBranchId)
    );
    
    const options = filteredItems.map(item => ({ 
        value: String(item.itemId),
        label: `${item.itemName.split('@')[0]} (${item.itemCode})`,
        disabled: false
    }));
    return [ ...options];
  }, [allItems, sourceBranchId, targetBranchId, t]);

  // Prepare unit options based on selected item
  const getUnitOptions = (selectedItemId: string) => {
    const selectedItem = allItems.find(item => String(item.itemId) === selectedItemId);
    if (!selectedItem) return [{ value: '', label: t('transfers.selectUnit'), disabled: true }];

    // Get all available units for this item
    const availableUnits = units.filter(unit => {
      // Include primary unit
      if (selectedItem.primaryUnitId === unit.unitOfMeasurementId) return true;
      // Include secondary unit if it exists
      if (selectedItem.secondaryUnitId === unit.unitOfMeasurementId) return true;
      return false;
    });

    // Map units to options format
    const unitOptions = availableUnits.map(unit => ({
      value: String(unit.unitOfMeasurementId),
      label: unit.unitName,
      disabled: false
    }));

    // If no units found, return default option
    if (unitOptions.length === 0) {
      return [{ value: '', label: t('transfers.noUnits'), disabled: true }];
    }

    return unitOptions;
  };

  // Helper to get unit name by id
  const getUnitName = (unitId: number) => {
    const unit = units.find(u => u.unitOfMeasurementId === unitId);
    return unit ? unit.unitName : '';
  };

  // Helper to get correct unit name for Available Quantity based on calculationMethod
  const getAvailableQuantityUnitName = (item: any) => {
    if (!item) return '';
    if (typeof item.calculationMethod === 'string') {
      if (item.calculationMethod.startsWith('PRIMARY')) {
        return item.secondaryUnitName || getUnitName(item.secondaryUnitId);
      } else if (item.calculationMethod.startsWith('SECONDARY')) {
        return item.primaryUnitName || getUnitName(item.primaryUnitId);
      }
    }
    // fallback
    return item.primaryUnitName || getUnitName(item.primaryUnitId);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    const currentItem = { ...newItems[index], [field]: value };

    // Auto-populate fields when item is selected
    if (field === 'itemId') {
        const selectedItemData = allItems.find(opt => String(opt.itemId) === value);
        const selectedItemCostData = allItemsWithCost.find(opt => String(opt.itemId) === value);
        if (selectedItemData) {
            currentItem.itemId = selectedItemData.itemId;
            currentItem.itemCode = selectedItemData.itemCode;
            // Use exact available quantity as received from response
            currentItem.availableQuantity = selectedItemData.totalQuantity;
            currentItem.primaryUnitName = getUnitName(selectedItemData.primaryUnitId);
            currentItem.secondaryUnitName = getUnitName(selectedItemData.secondaryUnitId);
            // Set primary unit as default
            currentItem.uom = selectedItemData.primaryUnitId?.toString() || '';
            // Store the base cost and unit values
            currentItem.baseCost = selectedItemCostData?.purchaseCostWithVat || 0;
            currentItem.primaryUnitValue = selectedItemData.primaryUnitValue || 1;
            currentItem.secondaryUnitValue = selectedItemData.secondaryUnitValue || 1;
            currentItem.primaryUnitId = selectedItemData.primaryUnitId;
            currentItem.secondaryUnitId = selectedItemData.secondaryUnitId;
            // @ts-ignore: calculationMethod is present in API response but not in Item type
            currentItem.calculationMethod = selectedItemData.calculationMethod;
            // Set cost as unit cost (not multiplied by quantity)
            currentItem.cost = currentItem.baseCost;
        } else {
            currentItem.itemCode = '';
            currentItem.uom = '';
            currentItem.baseCost = 0;
            currentItem.cost = 0;
            currentItem.primaryUnitValue = 1;
            currentItem.secondaryUnitValue = 1;
            currentItem.availableQuantity = 0;
            currentItem.primaryUnitName = '';
            currentItem.secondaryUnitName = '';
            currentItem.calculationMethod = '';
        }
    }
    
    // Update cost when quantity or unit changes
    if (field === 'quantity' || field === 'uom') {
        let quantity = parseFloat(currentItem.quantity) || 0;
        const selectedUnitId = parseInt(currentItem.uom);
        // Get unit values
        const primaryUnitValue = currentItem.primaryUnitValue || 1;
        const secondaryUnitValue = currentItem.secondaryUnitValue || 1;
        let maxQuantity = currentItem.availableQuantity;
        // If using secondary unit, convert availableQuantity to secondary unit equivalent
        if (selectedUnitId === currentItem.secondaryUnitId) {
          maxQuantity = (currentItem.availableQuantity * secondaryUnitValue) / primaryUnitValue;
        }
        // Validate quantity against maxQuantity
        if (quantity > maxQuantity) {
            quantity = maxQuantity;
        }
        // Truncate to 2 decimal places (no rounding)
        const quantityStr = quantity.toString();
        const dotIndex = quantityStr.indexOf('.') !== -1 ? quantityStr.indexOf('.') : quantityStr.length;
        currentItem.quantity = quantityStr.slice(0, dotIndex + 1 + 2).replace(/\.$/, '');
        // Get cost from allItemsWithCost
        const selectedItemCostData = allItemsWithCost.find(opt => String(opt.itemId) === String(currentItem.itemId));
        const baseCost = selectedItemCostData?.purchaseCostWithVat || 0;
        currentItem.baseCost = baseCost;
        // Calculate unit cost based on selected unit
        if (selectedUnitId === currentItem.primaryUnitId) {
            // If primary unit is selected, use base cost directly
            currentItem.cost = baseCost;
        } else if (selectedUnitId === currentItem.secondaryUnitId) {
            // If secondary unit is selected, adjust cost based on unit value ratio
            const unitRatio = secondaryUnitValue / primaryUnitValue;
            currentItem.cost = baseCost / unitRatio;
        }
    }
    
    newItems[index] = currentItem;
    onChange(newItems);
  };

  const addItem = () => {
    onChange([...items, {
        itemId: '',
        itemCode: '',
        quantity: 1,
        uom: '',
        cost: 0 
    }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index); 
    onChange(newItems);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm relative">
      {/* Show available quantity in the top right, outside the table, as in the screenshot */}
      {items && items[0] && items[0].availableQuantity !== undefined && (
        <div className="absolute right-4 top-2 text-base font-semibold text-black">
          {t('transfers.availableQuantity')}: <span className="font-bold">{
            (() => {
              // Format available quantity to 2 digits after decimal, no rounding
              const aq = items[0].availableQuantity;
              const aqStr = aq?.toString() || '0';
              const dotIndex = aqStr.indexOf('.') !== -1 ? aqStr.indexOf('.') : aqStr.length;
              return aqStr.slice(0, dotIndex + 1 + 2).replace(/\.$/, '');
            })()
          }</span> {getAvailableQuantityUnitName(items[0])}
        </div>
      )}
      <h3 className="text-lg font-semibold p-4 border-b">{t('transfers.inventoryItems')}</h3>
      {sourceBranchId === targetBranchId && sourceBranchId !== '' && (
        <div className="px-4 py-2 text-red-600 text-sm font-medium">
          {t('transfers.cannotTransferSameBranchItems')}
        </div>
      )}
      <div className="w-full">
        <table className="w-full">
            <thead className="bg-[#00997B] text-white">
                <tr>
                    <th className="p-3 text-left text-sm font-semibold">{t('transfers.item')}</th>
                    <th className="p-3 text-left text-sm font-semibold w-24">{t('transfers.code')}</th>
                    {/* <th className="p-3 text-left text-sm font-semibold w-24">{t('transfers.available')}</th> */}
                    <th className="p-3 text-left text-sm font-semibold w-24">{t('transfers.quantity')}</th>
                    <th className="p-3 text-left text-sm font-semibold w-32">{t('transfers.uom')}</th>
                    <th className="p-3 text-left text-sm font-semibold w-24">{t('transfers.cost')}</th>
                    <th className="p-3 text-left text-sm font-semibold w-16"></th>
                </tr>
            </thead>
            <tbody>
            {items.map((item, index) => (
                <tr key={index} className="border-b last:border-none">
                    <td className="p-2 align-top">
                        <Select 
                            value={String(item.itemId || '')}
                            onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                            options={itemOptions}
                            className="w-full"
                        />
                    </td>
                    <td className="p-2 align-top">
                        <Input 
                            value={item.itemCode}
                            readOnly 
                            className="bg-gray-100"
                            placeholder="Code"
                        />
                    </td>
                    {/* <td className="p-2 align-top">
                        <Input 
                            value={`${item.availableQuantity || 0} ${item.primaryUnitName || ''}`}
                            readOnly 
                            className="bg-gray-100"
                            placeholder="Available"
                        />
                    </td> */}
                    <td className="p-2 align-top">
                        <Input 
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            placeholder="Qty"
                            min="1"
                            max={item.availableQuantity || 0}
                            step="any"
                        />
                    </td>
                    <td className="p-2 align-top">
                         <Select 
                            value={item.uom}
                            onChange={(e) => handleItemChange(index, 'uom', e.target.value)}
                            options={getUnitOptions(String(item.itemId))}
                            className="w-full"
                            disabled={!item.itemId}
                        />
                    </td>
                    <td className="p-2 align-top">
                        <Input 
                            type="number"
                            value={(item.cost * item.quantity || 0).toFixed(2)}
                            placeholder="Cost" 
                            className="bg-gray-100"
                            readOnly
                            step="0.01"
                            min="0"
                        />
                    </td>
                    <td className="p-2 align-top text-center">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeItem(index)} 
                            className="text-red-500 hover:text-red-700 p-1"
                        >
                            <Trash2 size={16} />
                        </Button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
        <div className="p-3 bg-gray-50 border-t">
            <Button variant="outline" size="sm" onClick={addItem} className="text-[#00997B] border-[#00997B] hover:bg-[#E8FFFE]">
                <Plus size={16} className="mr-1" /> {t('transfers.addItem')}
            </Button>
        </div>
    </div>
  );
}