'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/context/TranslationContext';
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
  const { t } = useTranslation();
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
        setModalMessage(t('taxes.updated'));
        setIsSuccessModalOpen(true);
      } else {
        await dispatch(addTax({
          taxCode,
          taxName,
          taxRate: parseFloat(taxRate),
          taxGroup
        }) as any);
        setModalMessage(t('taxes.added'));
        setIsSuccessModalOpen(true);
      }
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      setModalMessage(t('taxes.failedProcess'));
      setIsErrorModalOpen(true);
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
      setModalMessage(t('taxes.deleted'));
      setIsSuccessModalOpen(true);
    } catch (error) {
      setModalMessage(t('taxes.failedDelete'));
      setIsErrorModalOpen(true);
    }
  };

  const validateForm = () => {
    if (!taxCode) {
      showErrorMessage(t('taxes.codeRequired'));
      return false;
    }
    if (!taxName) {
      showErrorMessage(t('taxes.nameRequired'));
      return false;
    }
    if (!taxRate) {
      showErrorMessage(t('taxes.rateRequired'));
      return false;
    }
    const taxRateNum = parseFloat(taxRate);
    if (isNaN(taxRateNum)) {
      showErrorMessage(t('taxes.rateNumber'));
      return false;
    }
    if (taxRateNum < 0) {
      showErrorMessage(t('taxes.rateNegative'));
      return false;
    }
    if (taxRateNum > 100) {
      showErrorMessage(t('taxes.rateTooHigh'));
      return false;
    }
    if (!taxGroup) {
      showErrorMessage(t('taxes.groupRequired'));
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
          <h1 className="text-xl sm:text-2xl font-bold">{t('taxes.title')}</h1>
        </div>
        <Button 
          onClick={handleCreateNew}
          className="rounded-full bg-[#05A49D] text-white text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
          disabled={loading}
        >
          {t('taxes.createNew')}
        </Button>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex-1">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">{t('taxes.code')}</th>
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">{t('taxes.name')}</th>
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">{t('taxes.rate')}</th>
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">{t('taxes.group')}</th>
                <th className="text-right pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">{t('common.action')}</th>
              </tr>
            </thead>
            <tbody>
              {taxes.map((tax) => (
                <tr key={tax.taxId} className="border-b">
                  <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{tax.taxCode}</td>
                  <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{tax.taxName}</td>
                  <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{tax.taxRate ? tax.taxRate.toFixed(1) : '0.0'}</td>
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
                        {t('common.edit')}
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="rounded-full bg-red-500 text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                        onClick={() => handleDeleteClick(tax.taxId)}
                        disabled={loading}
                      >
                        {t('common.delete')}
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
        title={isEditMode ? t('taxes.editTitle') : t('taxes.newTitle')}
        size="md"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          handleAddTax();
        }} className="w-full">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">{t('taxes.code')}</label>
              <Input
                type="text"
                value={taxCode}
                onChange={(e) => setTaxCode(e.target.value)}
                placeholder={t('taxes.codePlaceholder')}
                className="w-full bg-white"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-medium">{t('taxes.name')}</label>
              <Input
                type="text"
                value={taxName}
                onChange={(e) => setTaxName(e.target.value)}
                placeholder={t('taxes.namePlaceholder')}
                className="w-full bg-white"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-medium">{t('taxes.rate')}</label>
              <Input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder={t('taxes.ratePlaceholder')}
                className="w-full bg-white"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-medium">{t('taxes.group')}</label>
              <Input
                type="text"
                value={taxGroup}
                onChange={(e) => setTaxGroup(e.target.value)}
                placeholder={t('taxes.groupPlaceholder')}
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
              {t('common.discard')}
            </Button>
            <Button
              type="submit"
              className="bg-[#05A49D] text-white hover:bg-[#048c86] px-4 sm:px-6"
              disabled={loading}
            >
              {loading ? t('taxes.processing') : isEditMode ? t('common.update') : t('taxes.add')}
            </Button>
          </div>
        </form>
      </Modal>
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t('taxes.deleteTitle')}
        message={t('taxes.deleteMessage')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />
      {/* Success Modal */}
      <ConfirmationModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          if (modalMessage.includes('successfully')) {
            window.location.reload();
          }
        }}
        title={modalMessage.includes('successfully') ? t('common.success') : t('common.error')}
        message={modalMessage}
        isAlert={true}
        okText={t('common.ok')}
      />
      {/* Error Modal */}
      <ConfirmationModal
        isOpen={isErrorModalOpen}
        onClose={() => {
          setIsErrorModalOpen(false);
          if (modalMessage.includes('successfully')) {
            window.location.reload();
          }
        }}
        title={modalMessage.includes('successfully') ? t('common.success') : t('common.error')}
        message={modalMessage}
        isAlert={true}
        okText={t('common.ok')}
      />
    </div>
  );
}