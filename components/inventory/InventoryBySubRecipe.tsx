'use client';

import { useEffect, useState } from 'react';
import moment from 'moment';
import api from '@/store/api';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllEmployees } from '@/store/employeeSlice';
import type { AppDispatch } from '@/store/store';
import { useUnits } from '@/hooks/useUnits';
import { useTranslation } from '@/context/TranslationContext';

interface InventoryLocation {
  inventoryId: number;
  storageLocation: number;
  branchLocation: number;
  storageLocationWithCode: string;
  quantity: number;
  lastUpdated: string;
}

export default function InventoryBySubRecipe() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [subRecipes, setSubRecipes] = useState([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const { units } = useUnits();

  const dispatch = useDispatch<AppDispatch>();

  // Helper to get employee name by user ID
  const getEmployeeName = (userId: number) => {
    const emp = employees.find((e: any) => Number(e.employeeId) === Number(userId));
    if (emp && emp.employeeDetailsDTO) {
      return `${emp.employeeDetailsDTO.firstname} ${emp.employeeDetailsDTO.familyName}`;
    }
    return 'N/A';
  };

  // Helper to get formatted quantity with unit
  const getFormattedQuantity = (uom: string, quantity: number) => {
    if (uom.includes('@')) {
      const [unitId] = uom.split('@');
      const unit = units.find(u => u.unitOfMeasurementId === Number(unitId));
      if (unit) {
        return `${quantity} ${unit.unitName}`;
      }
    }
    return `${quantity} ${uom}`;
  };

  useEffect(() => {
    const fetchSubRecipes = async () => {
      try {
        const responseEmployees = await dispatch(fetchAllEmployees());
        setEmployees(responseEmployees.payload);
        const response = await api.post('/inventory/view/prepared-sub-recipe', {page: 0, size: 1000, sortBy: 'preparedDate', direction: 'asc'});
        const list = response?.data?.preparedSubRecipeList || [];

        // Flatten sub-recipes by inventory location
        const mapped = list.flatMap((item: any) => {
          const inventoryLocations = item.inventoryLocations || [];
          if (inventoryLocations.length === 0) {
            return [{
              id: (item.preParedSubRecipeId || item.preparedSubRecipeId) + '-none',
              date: moment(item.preparedDate).format('DD/MM/YYYY hh:mm A'),
              name: item.subRecipeNameAndDescription,
              preparedBy: item.preparedByUserId,
              storageAndBranch: 'N/A',
              quantity: item.totalQuantityAcrossLocations,
              uom: item.uom,
              batchNumber: item.subRecipeBatchNumber,
              expirationDate: moment(item.expirationDate).format('DD/MM/YYYY'),
              status: item.preparedSubRecipeStatus,
              inventoryLocations: []
            }];
          }
          return inventoryLocations.map((loc: InventoryLocation) => ({
            id: (item.preParedSubRecipeId || item.preparedSubRecipeId) + '-' + loc.inventoryId,
            date: moment(item.preparedDate).format('DD/MM/YYYY hh:mm A'),
            name: item.subRecipeNameAndDescription,
            preparedBy: item.preparedByUserId,
            storageAndBranch: loc.storageLocationWithCode,
            quantity: loc.quantity,
            uom: item.uom,
            batchNumber: item.subRecipeBatchNumber,
            expirationDate: moment(item.expirationDate).format('DD/MM/YYYY'),
            status: item.preparedSubRecipeStatus,
            inventoryLocations: [loc]
          }));
        });

        setSubRecipes(mapped);
      } catch (error) {
        console.error('Error fetching sub-recipes:', error);
      }
    };

    fetchSubRecipes();
  }, []);

  const filteredSubRecipes = subRecipes.filter((subRecipe: any) =>
    subRecipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex justify-between items-center p-4 border-b bg-white">
        <input
          type="text"
          placeholder={t('inventory.subrecipe.searchPlaceholder') || 'Search by name...'}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="border rounded px-3 py-2 w-72 focus:outline-none focus:ring-2 focus:ring-[#00997B]"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#00997B] text-white text-sm">
            <tr>
              <th className="px-6 py-4 text-left">{t('inventory.subrecipe.header.preparedDate')}</th>
              <th className="px-6 py-4 text-left">{t('inventory.subrecipe.header.name')}</th>
              <th className="px-6 py-4 text-left">{t('inventory.subrecipe.header.preparedBy')}</th>
              <th className="px-6 py-4 text-left">{t('inventory.subrecipe.header.storage')}</th>
              <th className="px-6 py-4 text-left">{t('inventory.subrecipe.header.inStock')}</th>
              <th className="px-6 py-4 text-left">{t('inventory.subrecipe.header.expirationDate')}</th>
              <th className="px-6 py-4 text-left">{t('inventory.subrecipe.header.batchNumber')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSubRecipes.map((subRecipe:any) => (
              <tr key={subRecipe.id}>
                <td className="px-6 py-4">{subRecipe.date}</td>
                <td className="px-6 py-4">{subRecipe.name}</td>
                <td className="px-6 py-4">{getEmployeeName(subRecipe.preparedBy)}</td>
                <td className="px-6 py-4">{subRecipe.storageAndBranch}</td>
                <td className="px-6 py-4">{getFormattedQuantity(subRecipe.uom, subRecipe.quantity)}</td>
                <td className="px-6 py-4">{subRecipe.expirationDate}</td>
                <td className="px-6 py-4">{subRecipe.batchNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
