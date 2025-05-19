'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/context/TranslationContext';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import { addSupplier, updateSupplier, fetchAllSuppliers } from '@/store/supplierSlice';
import type { RootState } from '@/store/store';
import type { SupplierData } from '@/store/supplierApi';
import ConfirmationModal from './common/ConfirmationModal';

interface SupplierDetailsProps {
  supplierId?: string;
  onClose: () => void;
}

export default function SupplierDetails({ supplierId, onClose }: SupplierDetailsProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, error, suppliers } = useSelector((state: RootState) => state.supplier);
  const isEditMode = !!supplierId;
  
  // Modal states
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  
  const [formData, setFormData] = useState<SupplierData>({
    name: '',
    contactNo: '',
    email: '',
    salesmanName: '',
    salesmanContactNo: '',
    salesmanEmail: '',
    supplierAddress: '',
    vatNo: '',
    crNo: ''
  });

  // Fetch suppliers if in edit mode and suppliers array is empty
  useEffect(() => {
    if (isEditMode && suppliers.length === 0) {
      dispatch(fetchAllSuppliers() as any);
    }
  }, [isEditMode, suppliers.length, dispatch]);

  // Populate form data when editing
  useEffect(() => {
    if (isEditMode && supplierId && suppliers.length > 0) {
      const supplierToEdit = suppliers.find(s => s.supplierId === parseInt(supplierId));
      if (supplierToEdit) {
        setFormData({
          name: supplierToEdit.name,
          contactNo: supplierToEdit.contactNo,
          email: supplierToEdit.email,
          salesmanName: supplierToEdit.salesmanName,
          salesmanContactNo: supplierToEdit.salesmanContactNo,
          salesmanEmail: supplierToEdit.salesmanEmail,
          supplierAddress: supplierToEdit.supplierAddress,
          vatNo: supplierToEdit.vatNo,
          crNo: supplierToEdit.crNo
        });
      } else {
        setModalMessage(t('suppliers.notFound'));
        setIsErrorModalOpen(true);
        router.push('/suppliers');
      }
    }
  }, [isEditMode, supplierId, suppliers, router, t]);

  useEffect(() => {
    if (error) {
      setModalMessage(error);
      setIsErrorModalOpen(true);
    }
  }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    if (!formData.name) {
      setModalMessage(t('suppliers.nameRequired'));
      setIsErrorModalOpen(true);
      return false;
    }
    if (!formData.email) {
      setModalMessage(t('suppliers.emailRequired'));
      setIsErrorModalOpen(true);
      return false;
    }
    if (!formData.contactNo) {
      setModalMessage(t('suppliers.contactRequired'));
      setIsErrorModalOpen(true);
      return false;
    }
    if (!formData.salesmanName) {
      setModalMessage(t('suppliers.salesmanNameRequired'));
      setIsErrorModalOpen(true);
      return false;
    }
    if (!formData.salesmanContactNo) {
      setModalMessage(t('suppliers.salesmanContactRequired'));
      setIsErrorModalOpen(true);
      return false;
    }
    if (!formData.salesmanEmail) {
      setModalMessage(t('suppliers.salesmanEmailRequired'));
      setIsErrorModalOpen(true);
      return false;
    }
    if (!formData.supplierAddress) {
      setModalMessage(t('suppliers.addressRequired'));
      setIsErrorModalOpen(true);
      return false;
    }
    if (!formData.vatNo) {
      setModalMessage(t('suppliers.vatRequired'));
      setIsErrorModalOpen(true);
      return false;
    }
    if (!formData.crNo) {
      setModalMessage(t('suppliers.crRequired'));
      setIsErrorModalOpen(true);
      return false;
    } 
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      if (isEditMode && supplierId) {
        await dispatch(updateSupplier({
          ...formData,
          supplierId: parseInt(supplierId)
        }) as any);
        setModalMessage('Supplier updated successfully!');
      } else {
        await dispatch(addSupplier(formData) as any);
        setModalMessage('Supplier added successfully!');
      }
      setIsSuccessModalOpen(true);
    } catch (error) {
      setModalMessage('Failed to save supplier');
      setIsErrorModalOpen(true);
    }
  };

  const handleSuccessClose = () => {
    setIsSuccessModalOpen(false);
    router.push('/suppliers');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f1fff7] min-h-screen px-3 py-3 sm:px-4 md:px-8 sm:py-4 md:py-6">
      <div className="flex items-center mb-6">
        <button onClick={() => router.push('/suppliers')} className="text-gray-600 hover:text-gray-800 mr-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold">{t('suppliers.detailsTitle')}</h1>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex-1">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">{t('suppliers.name')}</label>
              <Input
                type="text"
                name="name"
                placeholder={t('suppliers.namePlaceholder')}
                value={formData.name}
                onChange={handleChange}
                className="w-full"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">{t('suppliers.salesmanName')}</label>
              <Input
                type="text"
                name="salesmanName"
                placeholder={t('suppliers.salesmanNamePlaceholder')}
                value={formData.salesmanName}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">{t('suppliers.contact')}</label>
              <Input
                type="text"
                name="contactNo"
                placeholder={t('suppliers.contactPlaceholder')}
                value={formData.contactNo}
                onChange={handleChange}
                className="w-full"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">{t('suppliers.salesmanContact')}</label>
              <Input
                type="text"
                name="salesmanContactNo"
                placeholder={t('suppliers.salesmanContactPlaceholder')}
                value={formData.salesmanContactNo}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">{t('suppliers.email')}</label>
              <Input
                type="email"
                name="email"
                placeholder={t('suppliers.emailPlaceholder')}
                value={formData.email}
                onChange={handleChange}
                className="w-full"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">{t('suppliers.salesmanEmail')}</label>
              <Input
                type="email"
                name="salesmanEmail"
                placeholder={t('suppliers.salesmanEmailPlaceholder')}
                value={formData.salesmanEmail}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">{t('suppliers.vat')}</label>
              <Input
                type="text"
                name="vatNo"
                placeholder={t('suppliers.vatPlaceholder')}
                value={formData.vatNo}
                onChange={handleChange}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">{t('suppliers.address')}</label>
              <Input
                type="text"
                name="supplierAddress"
                placeholder={t('suppliers.addressPlaceholder')}
                value={formData.supplierAddress}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2 font-medium">{t('suppliers.cr')}</label>
            <Input
              type="text"
              name="crNo"
              placeholder={t('suppliers.crPlaceholder')}
              value={formData.crNo}
              onChange={handleChange}
              className="w-full md:w-1/2"
            />
          </div>
          
          <div className="flex justify-end mt-6">
            <Button
              type="submit"
              className="bg-[#05A49D] text-white hover:bg-[#048c86] px-6 py-2.5 rounded-md"
              disabled={loading}
            >
              {loading ? 'Processing...' : t('common.submit')}
            </Button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <ConfirmationModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessClose}
        title={t('suppliers.success')}
        message={modalMessage}
        isAlert={true}
        okText={t('suppliers.ok')}
      />

      {/* Error Modal */}
      <ConfirmationModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title={t('suppliers.error')}
        message={modalMessage}
        isAlert={true}
        okText={t('suppliers.ok')}
      />
    </div>
  );
}