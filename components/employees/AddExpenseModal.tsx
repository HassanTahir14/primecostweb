'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Modal from '@/components/common/Modal'; // Assuming Modal component exists
import Input from '@/components/common/input'; // Assuming Input component exists
import Select from '@/components/common/select'; // Assuming Select component exists
import Button from '@/components/common/button';
import { Employee } from '@/store/employeeSlice'; // For employee selection

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void; // Consider defining a specific type for formData
  employees: Employee[]; // Pass the list of employees for selection
  loading: boolean;
  error: string | null;
}

interface ExpenseFormData {
    employeeId: string;
    expenseType: string;
    amount: string; // Use string for form state, parse on submit
    expenseDate: string; // Use YYYY-MM-DD for date input
    description: string;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employees = [],
  loading,
  error
}) => {
  const [formData, setFormData] = useState<ExpenseFormData>({
    employeeId: '',
    expenseType: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0], // Default to today
    description: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ExpenseFormData, string>>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        employeeId: '',
        expenseType: '',
        amount: '',
        expenseDate: new Date().toISOString().split('T')[0],
        description: ''
      });
      setFormErrors({});
    }
  }, [isOpen]);

  // Employee options for dropdown
  const employeeOptions = useMemo(() => [
    { label: "Select Employee", value: "", disabled: true },
    // Assuming Employee interface has employeeId and employeeDetailsDTO.firstname
    ...employees.map(emp => ({ 
      label: `${emp.employeeDetailsDTO?.firstname || 'Unknown'} (ID: ${emp.employeeId})`, 
      value: String(emp.employeeId)
    }))
  ], [employees]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof ExpenseFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
      const errors: Partial<Record<keyof ExpenseFormData, string>> = {};
      if (!formData.employeeId) errors.employeeId = 'Employee is required';
      if (!formData.expenseType.trim()) errors.expenseType = 'Expense type is required';
      if (!formData.amount || parseFloat(formData.amount) <= 0) errors.amount = 'Valid amount is required';
      if (!formData.expenseDate) errors.expenseDate = 'Date is required';
      
      setFormErrors(errors);
      return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // Parse amount before submitting
    const payload = {
        ...formData,
        amount: parseFloat(formData.amount)
    };
    onSubmit(payload);
  };

  return (
    <Modal 
      isOpen={isOpen}
      onClose={() => !loading && onClose()}
      title="Add New Expense"
      size="md" // Adjust size as needed
    >
      <form onSubmit={handleSubmit} className="w-full">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Display API Error */}
            {error && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
                    {error}
                </div>
            )}

            {/* Form Fields */}
            <div>
                <label className="block text-gray-700 mb-1 font-medium text-sm">Employee</label>
                <Select 
                    name="employeeId" 
                    value={formData.employeeId} 
                    onChange={handleInputChange} 
                    options={employeeOptions} 
                    className={`w-full bg-white ${formErrors.employeeId ? 'border-red-500' : ''}`}
                    disabled={loading || employees.length === 0}
                />
                {formErrors.employeeId && <p className="mt-1 text-red-500 text-xs">{formErrors.employeeId}</p>}
            </div>

            <div>
                <label className="block text-gray-700 mb-1 font-medium text-sm">Expense Type</label>
                <Input 
                    type="text" 
                    name="expenseType" 
                    value={formData.expenseType} 
                    onChange={handleInputChange} 
                    placeholder="e.g., Travel, Uniform, Supplies"
                    className={`w-full bg-white ${formErrors.expenseType ? 'border-red-500' : ''}`}
                    disabled={loading}
                />
                 {formErrors.expenseType && <p className="mt-1 text-red-500 text-xs">{formErrors.expenseType}</p>}
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-700 mb-1 font-medium text-sm">Amount</label>
                    <Input 
                        type="number" 
                        name="amount" 
                        value={formData.amount} 
                        onChange={handleInputChange} 
                        placeholder="0.00"
                        prefix="USD" // Assuming USD
                        step="0.01"
                        className={`w-full bg-white ${formErrors.amount ? 'border-red-500' : ''}`}
                        disabled={loading}
                    />
                    {formErrors.amount && <p className="mt-1 text-red-500 text-xs">{formErrors.amount}</p>}
                </div>
                 <div>
                    <label className="block text-gray-700 mb-1 font-medium text-sm">Date</label>
                    <Input 
                        type="date" 
                        name="expenseDate" 
                        value={formData.expenseDate} 
                        onChange={handleInputChange} 
                        className={`w-full bg-white ${formErrors.expenseDate ? 'border-red-500' : ''}`}
                        disabled={loading}
                    />
                    {formErrors.expenseDate && <p className="mt-1 text-red-500 text-xs">{formErrors.expenseDate}</p>}
                 </div>
            </div>

            <div>
                <label className="block text-gray-700 mb-1 font-medium text-sm">Description (Optional)</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Add any relevant details..."
                    className={`w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B] text-sm bg-white disabled:bg-gray-100`}
                    disabled={loading}
                />
            </div>
        </div>

        {/* Modal Actions */} 
        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#05A49D] text-white hover:bg-[#048c86] px-4"
            disabled={loading}
          >
            {loading ? 'Adding Expense...' : 'Add Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddExpenseModal; 