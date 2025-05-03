'use client';

import { useEffect, useState } from 'react';
import moment from 'moment';
import api from '@/store/api';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllEmployees } from '@/store/employeeSlice';
import type { AppDispatch } from '@/store/store';
import { useUnits } from '@/hooks/useUnits';

interface InventoryLocation {
  inventoryId: number;
  storageLocation: number;
  branchLocation: number;
  storageLocationWithCode: string;
  quantity: number;
  lastUpdated: string;
}

export default function InventoryBySubRecipe() {
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

        const mapped = list.map((item: any) => {
          // Map all inventory locations
          const inventoryLocations = item.inventoryLocations || [];
          const storageLocations = inventoryLocations.map((loc: InventoryLocation) => loc.storageLocationWithCode).join(', ');
          
          return {
          id: item.preparedSubRecipeId,
          date: moment(item.preparedDate).format('DD/MM/YYYY hh:mm A'),
          name: item.subRecipeNameAndDescription,
          preparedBy: item.preparedByUserId,
            storageAndBranch: storageLocations || 'N/A',
            quantity: item.totalQuantityAcrossLocations,
            uom: item.uom,
            batchNumber: item.subRecipeBatchNumber,
            expirationDate: moment(item.expirationDate).format('DD/MM/YYYY'),
            status: item.preparedSubRecipeStatus,
            inventoryLocations: inventoryLocations
          };
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
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#00997B] text-white text-sm">
            <tr>
              <th className="px-6 py-4 text-left">Prepared Date</th>
              <th className="px-6 py-4 text-left">Recipe Name & Description</th>
              <th className="px-6 py-4 text-left">Prepared By</th>
              <th className="px-6 py-4 text-left">Storage Location, Branch</th>
              <th className="px-6 py-4 text-left">In Stock</th>
              <th className="px-6 py-4 text-left">Expiration Date</th>
              <th className="px-6 py-4 text-left">Batch Number</th>
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
