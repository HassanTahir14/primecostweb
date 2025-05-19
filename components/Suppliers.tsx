'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/context/TranslationContext';
import Button from '@/components/common/button';
import { fetchAllSuppliers, deleteSupplier } from '@/store/supplierSlice';
import type { RootState } from '@/store/store';
import ConfirmationModal from './common/ConfirmationModal';

interface SuppliersProps {
  onClose: () => void;
  onEdit: (supplierId: string) => void;
}

export default function Suppliers({ onClose, onEdit }: SuppliersProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const { suppliers, loading, error } = useSelector((state: RootState) => state.supplier);
  
  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    dispatch(fetchAllSuppliers() as any);
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setModalMessage(error);
      setIsErrorModalOpen(true);
    }
  }, [error]);

  const handleAddSupplier = () => {
    router.push('/suppliers/add');
  };

  const handleDeleteClick = (id: number) => {
    setSelectedSupplierId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSupplierId) return;

    try {
      await dispatch(deleteSupplier(selectedSupplierId) as any);
      setIsDeleteModalOpen(false);
      setModalMessage('Supplier deleted successfully');
      setIsSuccessModalOpen(true);
      dispatch(fetchAllSuppliers() as any); // Refresh the list after deletion
    } catch (error) {
      setModalMessage('Failed to delete supplier');
      setIsErrorModalOpen(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f1fff7] min-h-screen px-3 py-3 sm:px-4 md:px-8 sm:py-4 md:py-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">{t('suppliers.title')}</h1>
        </div>

        <Button 
          onClick={handleAddSupplier}
          className="rounded-full bg-[#05A49D] text-white text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
          disabled={loading}
        >
          {t('suppliers.addNew')}
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex-1">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">{t('suppliers.name')}</th>
                  <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">{t('suppliers.email')}</th>
                  <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">{t('suppliers.contact')}</th>
                  <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">{t('suppliers.salesmanName')}</th>
                  <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">{t('suppliers.id')}</th>
                  <th className="text-right pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">{t('common.action')}</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.supplierId} className="border-b">
                    <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{supplier.name}</td>
                    <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{supplier.email}</td>
                    <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{supplier.contactNo}</td>
                    <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{supplier.salesmanName}</td>
                    <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{supplier.supplierId}</td>
                    <td className="py-3 sm:py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="rounded-full bg-[#05A49D] text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                          onClick={() => onEdit(supplier.supplierId.toString())}
                          disabled={loading}
                        >
                          {t('common.edit')}
                        </Button>
                        {/* <Button 
                          variant="destructive" 
                          size="sm" 
                          className="rounded-full bg-red-500 text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                          onClick={() => handleDeleteClick(supplier.supplierId)}
                          disabled={loading}
                        >
                          {t('common.delete')}
                        </Button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {suppliers.length === 0 && !loading && (
            <div className="text-center py-6 text-gray-500">
              {t('suppliers.noSuppliers')}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t('suppliers.deleteTitle')}
        message={t('suppliers.deleteMessage')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />

      {/* Success Modal */}
      <ConfirmationModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={t('common.success')}
        message={modalMessage}
        isAlert={true}
        okText={t('common.ok')}
      />

      {/* Error Modal */}
      <ConfirmationModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title={t('common.error')}
        message={modalMessage}
        isAlert={true}
        okText={t('common.ok')}
      />
    </div>
  );
}