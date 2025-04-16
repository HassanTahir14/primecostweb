'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/button';
import Modal from './common/Modal';
import Input from './common/input';
import { addTax, updateTax, deleteTax } from '@/store/taxSlice';
import type { RootState } from '@/store/store';
import ConfirmationModal from './common/ConfirmationModal';

interface TaxesProps {
  onClose: () => void;
}

export default function Taxes({ onClose }: TaxesProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { taxes, loading } = useSelector((state: RootState) => state.tax);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [selectedTaxId, setSelectedTaxId] = useState<number | null>(null);
  const [modalMessage, setModalMessage] = useState('');
  
  // Form state
  const [taxCode, setTaxCode] = useState('');
  const [taxName, setTaxName] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [taxGroup, setTaxGroup] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTaxId, setEditingTaxId] = useState<number | null>(null);

  const handleCreateNew = () => {
    resetForm();
    setIsEditMode(false);
    setIsCreateModalOpen(true);
  };

  const showSuccessMessage = (message: string) => {
    setModalMessage(message);
    setIsSuccessModalOpen(true);
  };

  const showErrorMessage = (message: string) => {
    setModalMessage(message);
    setIsErrorModalOpen(true);
  };

  const handleAddTax = async () => {
    if (!validateForm()) return;
    
    try {
      if (isEditMode && editingTaxId) {
        const tax = taxes.find(t => t.taxId === editingTaxId);
        if (!tax) return;

        await dispatch(updateTax({
          ...tax,
          taxCode,
          taxName,
          taxRate: parseFloat(taxRate),
          taxGroup
        }) as any);
        showSuccessMessage('Tax updated successfully');
      } else {
        await dispatch(addTax({
          taxCode,
          taxName,
          taxRate: parseFloat(taxRate),
          taxGroup
        }) as any);
        showSuccessMessage('Tax added successfully');
      }
      
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      showErrorMessage('Failed to process tax data');
    }
  };

  const handleEditClick = (taxId: number) => {
    const tax = taxes.find(t => t.taxId === taxId);
    if (!tax) return;

    setTaxCode(tax.taxCode);
    setTaxName(tax.taxName);
    setTaxRate(tax.taxRate.toString());
    setTaxGroup(tax.taxGroup);
    setIsEditMode(true);
    setEditingTaxId(taxId);
    setIsCreateModalOpen(true);
  };

  const handleDeleteClick = (taxId: number) => {
    setSelectedTaxId(taxId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTaxId) return;

    try {
      await dispatch(deleteTax(selectedTaxId) as any);
      setIsDeleteModalOpen(false);
      showSuccessMessage('Tax deleted successfully');
    } catch (error) {
      showErrorMessage('Failed to delete tax');
    }
  };

  const validateForm = () => {
    if (!taxCode) {
      showErrorMessage('Tax code is required');
      return false;
    }
    
    if (!taxName) {
      showErrorMessage('Tax name is required');
      return false;
    }
    
    if (!taxRate) {
      showErrorMessage('Tax rate is required');
      return false;
    }
    
    if (!taxGroup) {
      showErrorMessage('Tax group is required');
      return false;
    }
    
    return true;
  };

  const resetForm = () => {
    setTaxCode('');
    setTaxName('');
    setTaxRate('');
    setTaxGroup('');
    setIsEditMode(false);
    setEditingTaxId(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f1fff7] min-h-screen px-3 py-3 sm:px-4 md:px-8 sm:py-4 md:py-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">Tax List</h1>
        </div>

        <Button 
          onClick={handleCreateNew}
          className="rounded-full bg-[#05A49D] text-white text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
          disabled={loading}
        >
          Create New
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex-1">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">Tax code</th>
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">Tax Name</th>
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">Tax Rate %</th>
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">Tax Group</th>
                <th className="text-right pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {taxes.map((tax) => (
                <tr key={tax.taxId} className="border-b">
                  <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{tax.taxCode}</td>
                  <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{tax.taxName}</td>
                  <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{tax.taxRate.toFixed(1)}</td>
                  <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{tax.taxGroup}</td>
                  <td className="py-3 sm:py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="rounded-full bg-[#05A49D] text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                        onClick={() => handleEditClick(tax.taxId)}
                        disabled={loading}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="rounded-full bg-red-500 text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                        onClick={() => handleDeleteClick(tax.taxId)}
                        disabled={loading}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Tax Modal */}
      <Modal 
        isOpen={isCreateModalOpen}
        onClose={() => !loading && setIsCreateModalOpen(false)}
        title={isEditMode ? "Edit Tax" : "New Tax"}
        size="md"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          handleAddTax();
        }} className="w-full">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">TAX Code</label>
              <Input
                type="text"
                value={taxCode}
                onChange={(e) => setTaxCode(e.target.value)}
                placeholder="Enter TAX Code"
                className="w-full bg-white"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">TAX Name</label>
              <Input
                type="text"
                value={taxName}
                onChange={(e) => setTaxName(e.target.value)}
                placeholder="Enter TAX Name"
                className="w-full bg-white"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">TAX Rate %</label>
              <Input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder="Enter TAX Rate %"
                className="w-full bg-white"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">TAX Group</label>
              <Input
                type="text"
                value={taxGroup}
                onChange={(e) => setTaxGroup(e.target.value)}
                placeholder="Enter TAX Group"
                className="w-full bg-white"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="flex justify-between gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!loading) {
                  setIsCreateModalOpen(false);
                  resetForm();
                }
              }}
              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 sm:px-6"
              disabled={loading}
            >
              Discard
            </Button>
            
            <Button
              type="submit"
              className="bg-[#05A49D] text-white hover:bg-[#048c86] px-4 sm:px-6"
              disabled={loading}
            >
              {loading ? 'Processing...' : isEditMode ? 'UPDATE' : 'ADD'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Tax"
        message="Are you sure you want to delete this tax? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Success Modal */}
      <ConfirmationModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Success"
        message={modalMessage}
        isAlert={true}
        okText="OK"
      />

      {/* Error Modal */}
      <ConfirmationModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title="Error"
        message={modalMessage}
        isAlert={true}
        okText="OK"
      />
    </div>
  );
} 