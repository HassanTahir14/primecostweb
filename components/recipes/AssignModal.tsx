'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/button';
import { fetchAllBranches } from '@/store/branchSlice';
import { fetchAllEmployees } from '@/store/employeeSlice';
import type { RootState, AppDispatch } from '@/store/store';
import api from '@/store/api';

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  recipeId: number;
  isSubRecipe: boolean;
  subRecipeId?: number;
}

export default function AssignModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
  recipeId,
  isSubRecipe,
  subRecipeId = 0
}: AssignModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { branches } = useSelector((state: RootState) => state.branch);
  const { employees } = useSelector((state: RootState) => state.employee);
  
  const [selectedBranchId, setSelectedBranchId] = useState<number>(0);
  const [selectedUserId, setSelectedUserId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    branch: '',
    employee: ''
  });

  // Filter active employees and exclude Admin position
  const activeEmployees = employees.filter(employee => 
    employee.employeeDetailsDTO?.active === true && 
    employee.employeeDetailsDTO?.position !== 'Admin'
  );

  useEffect(() => {
    if (isOpen) {
      // Reset form state when modal opens
      setSelectedBranchId(0);
      setSelectedUserId(0);
      setErrors({ branch: '', employee: '' });
      
      // Fetch fresh data
      dispatch(fetchAllBranches());
      dispatch(fetchAllEmployees());
    }
  }, [isOpen, dispatch]);

  const validateForm = () => {
    const newErrors = {
      branch: '',
      employee: ''
    };

    if (!selectedBranchId) {
      newErrors.branch = 'Please select a branch';
    }

    if (!selectedUserId) {
      newErrors.employee = 'Please select an employee';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
    
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const payload = {
        branchLocationId: selectedBranchId,
        userId: selectedUserId,
      };

      // Add appropriate fields based on whether it's a recipe or sub-recipe
      if (isSubRecipe) {
        Object.assign(payload, { 
          subRecipeId,
          isSubRecipe: true // Explicitly set to true for sub-recipes
        });
      } else {
        Object.assign(payload, { 
          recipeId,
          isSubRecipe: false // Explicitly set to false for recipes
        });
      }

      const response = await api.post('/orders/assign', payload);

      if (response.data && response.data.responseCode === '0000') {
        onSuccess('Recipe assigned successfully');
        onClose();
      } else {
        onError(response.data?.description || 'Failed to assign recipe');
      }
    } catch (error: any) {
      onError(error.response?.data?.description || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Recipe"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Branch
          </label>
          <select
            value={selectedBranchId}
            onChange={(e) => {
              setSelectedBranchId(Number(e.target.value));
              setErrors(prev => ({ ...prev, branch: '' }));
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#339A89] focus:outline-none focus:ring-1 focus:ring-[#339A89]"
          >
            <option value={0}>Select a branch</option>
            {branches.map(branch => (
              <option key={branch.branchId} value={branch.branchId}>
                {branch.branchName}
              </option>
            ))}
          </select>
          {errors.branch && (
            <p className="mt-1 text-sm text-red-600">{errors.branch}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Employee
          </label>
          <select
            value={selectedUserId}
            onChange={(e) => {
              setSelectedUserId(Number(e.target.value));
              setErrors(prev => ({ ...prev, employee: '' }));
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#339A89] focus:outline-none focus:ring-1 focus:ring-[#339A89]"
          >
            <option value={0}>Select an employee</option>
            {activeEmployees.map(employee => (
              <option key={employee.employeeId} value={employee.employeeId}>
                {employee.employeeDetailsDTO?.firstname} {employee.employeeDetailsDTO?.familyName} ({employee.employeeDetailsDTO?.position})
              </option>
            ))}
          </select>
          {errors.employee && (
            <p className="mt-1 text-sm text-red-600">{errors.employee}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Assigning...' : 'Assign'}
          </Button>
        </div>
      </div>
    </Modal>
  );
} 