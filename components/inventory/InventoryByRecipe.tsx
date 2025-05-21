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

export default function InventoryByRecipe() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const { units } = useUnits();

  // Get all employees from Redux state
  // const employees = useSelector((state: any) => state.employee.kitchenEmployeeDTOS || []);
  const dispatch = useDispatch<AppDispatch>();

  // Helper to get employee name by user ID
  const getEmployeeName = (userId: number) => {
    console.log(employees, 'employees');
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
    const fetchRecipes = async () => {
      try {
        const responseEmployees = await dispatch(fetchAllEmployees());
        setEmployees(responseEmployees.payload);  
        const response = await api.post('/inventory/view/prepared-main-recipe', {page: 0, size: 100000, sortBy: 'preparedDate', direction: 'asc'});
        const list = response?.data?.preparedMainRecipeList || [];

        // Flatten recipes by inventory location
        const mapped = list.flatMap((item: any) => {
          const inventoryLocations = item.inventoryLocations || [];
          if (inventoryLocations.length === 0) {
            return [{
              id: item.preparedMainRecipeId + '-none',
              date: moment(item.preparedDate).format('DD/MM/YYYY hh:mm A'),
              name: item.mainRecipeNameAndDescription,
              preparedBy: item.preparedByUserId,
              storageAndBranch: 'N/A',
              quantity: item.totalQuantityAcrossLocations, // fallback to total if no locations
              uom: item.uom,
              batchNumber: item.mainRecipeBatchNumber,
              expirationDate: moment(item.expirationDate).format('DD/MM/YYYY'),
              status: item.preparedMainRecipeStatus,
              inventoryLocations: []
            }];
          }
          return inventoryLocations.map((loc: InventoryLocation) => ({
            id: item.preparedMainRecipeId + '-' + loc.inventoryId,
            date: moment(item.preparedDate).format('DD/MM/YYYY hh:mm A'),
            name: item.mainRecipeNameAndDescription,
            preparedBy: item.preparedByUserId,
            storageAndBranch: loc.storageLocationWithCode,
            quantity: loc.quantity,
            uom: item.uom,
            batchNumber: item.mainRecipeBatchNumber,
            expirationDate: moment(item.expirationDate).format('DD/MM/YYYY'),
            status: item.preparedMainRecipeStatus,
            inventoryLocations: [loc]
          }));
        });

        setRecipes(mapped);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    };

    fetchRecipes();
  }, []);

  const filteredRecipes = recipes.filter((recipe: any) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#00997B] text-white text-sm">
            <tr>
              <th className="px-6 py-4 text-left">{t('inventory.recipe.header.preparedDate')}</th>
              <th className="px-6 py-4 text-left">{t('inventory.recipe.header.name')}</th>
              <th className="px-6 py-4 text-left">{t('inventory.recipe.header.preparedBy')}</th>
              <th className="px-6 py-4 text-left">{t('inventory.recipe.header.storage')}</th>
              <th className="px-6 py-4 text-left">{t('inventory.recipe.header.inStock')}</th>
              <th className="px-6 py-4 text-left">{t('inventory.recipe.header.expirationDate')}</th>
              <th className="px-6 py-4 text-left">{t('inventory.recipe.header.batchNumber')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRecipes.map((recipe:any) => (
              <tr key={recipe.id}>
                <td className="px-6 py-4">{recipe.date}</td>
                <td className="px-6 py-4">{recipe.name}</td>
                <td className="px-6 py-4">{getEmployeeName(recipe.preparedBy)}</td>
                <td className="px-6 py-4">{recipe.storageAndBranch}</td>
                <td className="px-6 py-4">{getFormattedQuantity(recipe.uom, recipe.quantity)}</td>
                <td className="px-6 py-4">{recipe.expirationDate}</td>
                <td className="px-6 py-4">{recipe.batchNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
