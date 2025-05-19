'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Modal from '@/components/common/Modal'; // Assuming Modal component exists
import Input from '@/components/common/input'; // Assuming Input component exists
import Select from '@/components/common/select'; // Assuming Select component exists
import Button from '@/components/common/button';
import { Employee } from '@/store/employeeSlice'; // For employee selection
import { useTranslation } from '@/context/TranslationContext';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void; // Consider defining a specific type for formData
  employees: Employee[]; // Pass the list of employees for selection
  loading: boolean;
  error: string | null;
}

interface ExpenseFormData {
    userId: number;
    expenseType: string;
    employeeName: string;
    employeeId: number;
    ticketType: string;
    amountPaid: number;
    notifyAdmin: boolean;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employees = [],
  loading,
  error
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ExpenseFormData>({
    userId: 0,
    expenseType: '',
    employeeName: '',
    employeeId: 0,
    ticketType: '',
    amountPaid: 0,
    notifyAdmin: true
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ExpenseFormData, string>>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        userId: 0,
        expenseType: '',
        employeeName: '',
        employeeId: 0,
        ticketType: '',
        amountPaid: 0,
        notifyAdmin: true
      });
      setFormErrors({});
    }
  }, [isOpen]);

  // Employee options for dropdown
  const employeeOptions = useMemo(() => [
   
    ...employees.map(emp => ({ 
      label: `${emp.employeeDetailsDTO?.firstname || 'Unknown'} (ID: ${emp.employeeId})`, 
      value: String(emp.employeeId)
    }))
  ], [employees]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'employeeId') {
      const selectedEmployee = employees.find(emp => String(emp.employeeId) === value);
      setFormData(prev => ({
        ...prev,
        employeeId: Number(value),
        employeeName: selectedEmployee?.employeeDetailsDTO?.firstname || '',
        userId: Number(value) // Set userId same as employeeId
      }));
    } else if (name === 'amountPaid') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else if (name === 'notifyAdmin') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (formErrors[name as keyof ExpenseFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ExpenseFormData, string>> = {};
    
    if (!formData.employeeName) errors.employeeName = 'Employee name is required';
    if (!formData.amountPaid || formData.amountPaid <= 0) errors.amountPaid = 'Amount is required';
    if (!formData.userId) errors.userId = 'User ID is required';
    if (!formData.expenseType.trim()) errors.expenseType = 'Expense type is required';
    if (!formData.ticketType.trim()) errors.ticketType = 'Ticket type is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit(formData);
  };

  return (
    <Modal 
      isOpen={isOpen}
      onClose={() => !loading && onClose()}
      title={t('employees.addExpenseTitle')}
      size="md"
    >
      <form onSubmit={handleSubmit} className="w-full">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Display API Error */}
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            {/* Form Fields */}
            <div>
                <label className="block text-gray-700 mb-1 font-medium text-sm">{t('employees.selectEmployee')}</label>
                <Select 
                    name="employeeId" 
                    value={String(formData.employeeId)} 
                    onChange={handleInputChange} 
                    options={employeeOptions} 
                    className={`w-full bg-white ${formErrors.employeeName ? 'border-red-500' : ''}`}
                    disabled={loading || employees.length === 0}
                />
                {formErrors.employeeName && <p className="mt-1 text-red-500 text-xs">{formErrors.employeeName}</p>}
            </div>

            <div>
                <label className="block text-gray-700 mb-1 font-medium text-sm">{t('employees.expenseType')}</label>
                <Input 
                    type="text" 
                    name="expenseType" 
                    value={formData.expenseType} 
                    onChange={handleInputChange} 
                    placeholder={t('employees.expenseTypePlaceholder')}
                    className={`w-full bg-white ${formErrors.expenseType ? 'border-red-500' : ''}`}
                    disabled={loading}
                />
                 {formErrors.expenseType && <p className="mt-1 text-red-500 text-xs">{formErrors.expenseType}</p>}
            </div>
            
            <div>
                <label className="block text-gray-700 mb-1 font-medium text-sm">{t('employees.ticketType')}</label>
                <Input 
                    type="text" 
                    name="ticketType" 
                    value={formData.ticketType} 
                    onChange={handleInputChange} 
                    placeholder={t('employees.ticketTypePlaceholder')}
                    className={`w-full bg-white ${formErrors.ticketType ? 'border-red-500' : ''}`}
                    disabled={loading}
                />
                {formErrors.ticketType && <p className="mt-1 text-red-500 text-xs">{formErrors.ticketType}</p>}
            </div>
            
            <div>
                <label className="block text-gray-700 mb-1 font-medium text-sm">{t('employees.amountPaid')}</label>
                <Input 
                    type="number" 
                    name="amountPaid" 
                    value={formData.amountPaid} 
                    onChange={handleInputChange} 
                    placeholder="0.00"
                    step="0.01"
                    className={`w-full bg-white ${formErrors.amountPaid ? 'border-red-500' : ''}`}
                    disabled={loading}
                />
                {formErrors.amountPaid && <p className="mt-1 text-red-500 text-xs">{formErrors.amountPaid}</p>}
            </div>

            <div className="flex items-center">
                <input
                    type="checkbox"
                    name="notifyAdmin"
                    checked={formData.notifyAdmin}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-[#00997B] focus:ring-[#00997B] border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                    {t('employees.notifyAdmin')}
                </label>
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
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            className="bg-[#05A49D] text-white hover:bg-[#048c86] px-4"
            disabled={loading}
          >
            {loading ? t('employees.addingExpense') : t('employees.addExpense')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddExpenseModal;