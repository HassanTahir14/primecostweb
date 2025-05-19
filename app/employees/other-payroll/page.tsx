'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageLayout from '@/components/PageLayout';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import OtherPayrollTable from '@/components/employees/OtherPayrollTable';
import AddExpenseModal from '@/components/employees/AddExpenseModal';
import { Button } from '@/components/common/button';
import { useTranslation } from '@/context/TranslationContext';

// Import Redux stuff
import { AppDispatch, RootState } from '@/store/store';
import { fetchOtherPayrolls, clearError, OtherPayrollItem } from '@/store/otherPayrollSlice';
import { addExpense, clearError as clearExpenseError } from '@/store/expenseSlice';

export default function OtherPayrollPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { 
    payrolls, 
    loading: payrollLoading, 
    error: payrollError 
  } = useSelector((state: RootState) => state.otherPayroll);
  const { 
    loading: expenseLoading, 
    error: expenseError 
  } = useSelector((state: RootState) => state.expense);
  const { employees } = useSelector((state: RootState) => state.employee);

  // Modal state for errors
  const [modalMessage, setModalMessage] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  // Expense modal state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);
  const [expenseModalMessage, setExpenseModalMessage] = useState<string>('');
  const [isExpenseSuccess, setIsExpenseSuccess] = useState<boolean>(false);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchOtherPayrolls());
  }, [dispatch]);

  // Show error modal
  useEffect(() => {
    if (payrollError) {
        const errorMsg = typeof payrollError === 'string' ? payrollError : 
                        (payrollError as any)?.description || (payrollError as any)?.message || 'Failed to fetch other payroll data.';
        setModalMessage(errorMsg);
        setIsModalOpen(true);
    }
  }, [payrollError]);

  // Show expense error modal
  useEffect(() => {
    if (expenseError) {
        const errorMsg = typeof expenseError === 'string' ? expenseError :
                        (expenseError as any)?.message || 'Failed to add expense.';
        setExpenseModalMessage(errorMsg);
        setIsExpenseSuccess(false);
    }
  }, [expenseError]);

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setModalMessage('');
      if (payrollError) {
         dispatch(clearError());
      }
  };

  // Expense Modal Handlers
  const handleOpenExpenseModal = () => {
    dispatch(clearExpenseError());
    setExpenseModalMessage('');
    setIsExpenseSuccess(false);
    setIsExpenseModalOpen(true);
  };

  const handleCloseExpenseModal = () => {
    setIsExpenseModalOpen(false);
    setExpenseModalMessage('');
    setIsExpenseSuccess(false);
    dispatch(clearExpenseError()); 
  };

  const handleAddExpenseSubmit = async (formData: any) => {
    console.log("Submitting Expense:", formData);
    const payload = formData;
    
    setIsExpenseSuccess(false);
    setExpenseModalMessage('');

    try {
      const resultAction = await dispatch(addExpense(payload)).unwrap();
      setIsExpenseSuccess(true);
      setExpenseModalMessage(resultAction.description || 'Expense added successfully!');
      setIsExpenseModalOpen(false);
      // Refresh the payroll list after adding expense
      dispatch(fetchOtherPayrolls());
    } catch (rejectedValue) {
      console.error("Add expense failed:", rejectedValue);
    }
  };

  return (
    <PageLayout title={t('employees.otherPayrollTitle')}>
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {/* Navigation and Actions */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/employees" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
            <ArrowLeft size={20} />
            <span>{t('common.backToEmployees')}</span>
          </Link>
          
          {/* Add Expense Button */}
          <Button variant="outline" onClick={handleOpenExpenseModal}>
            <Plus className="w-4 h-4 mr-2" />
            {t('employees.addExpense')}
          </Button>
        </div>

        {/* Data Table Area */}
        <OtherPayrollTable 
          payrolls={payrolls} 
          isLoading={payrollLoading} 
          error={payrollError}
        />
      </div>
      
      {/* Error Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={t('common.error')}
        message={modalMessage}
        isAlert={true}
        okText={t('common.ok')}
      />

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={handleCloseExpenseModal}
        onSubmit={handleAddExpenseSubmit}
        employees={employees}
        loading={expenseLoading}
        error={expenseModalMessage}
      />
    </PageLayout>
  );
}