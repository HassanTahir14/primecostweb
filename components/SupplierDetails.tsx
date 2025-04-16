'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
        setModalMessage('Supplier not found');
        setIsErrorModalOpen(true);
        router.push('/suppliers');
      }
    }
  }, [isEditMode, supplierId, suppliers, router]);

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
      setModalMessage('Name is required');
      setIsErrorModalOpen(true);
      return false;
    }
    if (!formData.email) {
      setModalMessage('Email is required');
      setIsErrorModalOpen(true);
      return false;
    }
    if (!formData.contactNo) {
      setModalMessage('Contact number is required');
      setIsErrorModalOpen(true);
      return false;
    }
    if (!formData.salesmanName) {
      setModalMessage('Salesman name is required');
      setIsErrorModalOpen(true);
      return false;
    }
    if (!formData.salesmanContactNo) {
      setModalMessage('Salesman contact number is required');
      setIsErrorModalOpen(true);
      return false;
    }
    if (!formData.salesmanEmail) {
      setModalMessage('Salesman email is required');
      setIsErrorModalOpen(true);
      return false;
    }
    if (!formData.supplierAddress) {
      setModalMessage('Supplier address is required');
      setIsErrorModalOpen(true);
      return false;
    }
    if (!formData.vatNo) {
      setModalMessage('VAT number is required');
      setIsErrorModalOpen(true);
      return false;
    }
    if (!formData.crNo) {
      setModalMessage('CR number is required');
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
        <h1 className="text-xl sm:text-2xl font-bold">Supplier Details</h1>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex-1">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Name</label>
              <Input
                type="text"
                name="name"
                placeholder="Enter supplier name"
                value={formData.name}
                onChange={handleChange}
                className="w-full"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Salesman Name</label>
              <Input
                type="text"
                name="salesmanName"
                placeholder="Enter salesman name"
                value={formData.salesmanName}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Contact Number</label>
              <Input
                type="text"
                name="contactNo"
                placeholder="Enter supplier contact"
                value={formData.contactNo}
                onChange={handleChange}
                className="w-full"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Salesman Contact Number</label>
              <Input
                type="text"
                name="salesmanContactNo"
                placeholder="Enter salesman contact"
                value={formData.salesmanContactNo}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Email</label>
              <Input
                type="email"
                name="email"
                placeholder="Enter supplier email"
                value={formData.email}
                onChange={handleChange}
                className="w-full"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Salesman Email</label>
              <Input
                type="email"
                name="salesmanEmail"
                placeholder="Enter salesman email"
                value={formData.salesmanEmail}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">VAT No.</label>
              <Input
                type="text"
                name="vatNo"
                placeholder="Enter supplier VAT"
                value={formData.vatNo}
                onChange={handleChange}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Supplier Address</label>
              <Input
                type="text"
                name="supplierAddress"
                placeholder="Enter supplier address"
                value={formData.supplierAddress}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2 font-medium">CR Number</label>
            <Input
              type="text"
              name="crNo"
              placeholder="Enter supplier cr number"
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
              {loading ? 'Processing...' : 'SUBMIT'}
            </Button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <ConfirmationModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessClose}
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