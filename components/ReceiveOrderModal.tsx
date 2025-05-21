'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Modal from './common/Modal';
import Input from './common/input';
import Select from './common/select';
import Button from './common/button';
import { PurchaseOrder } from '@/store/purchaseOrderSlice'; // Adjust path if needed
import { Branch } from '@/store/branchSlice'; // Assuming Branch interface exists
import { StorageLocation } from '@/store/storageLocationSlice'; // Assuming StorageLocation interface exists

interface ReceiveOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: ReceiveFormData, orderData: PurchaseOrder) => void;
  orderData: PurchaseOrder | null;
  branches: Branch[];
  storageLocations: StorageLocation[];
  loading: boolean;
}

interface ReceiveFormData {
  expiryDate: string;
  dateOfDelivery: string;
  branchId: string;
  storageLocationId: string;
}

const ReceiveOrderModal: React.FC<ReceiveOrderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  orderData,
  branches = [], // Default to empty array
  storageLocations = [], // Default to empty array
  loading,
}) => {
  const [formData, setFormData] = useState<ReceiveFormData>({
    expiryDate: '',
    dateOfDelivery: '',
    branchId: '',
    storageLocationId: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ReceiveFormData, string>>>({});

  // Reset form when modal opens or order data changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        expiryDate: '',
        dateOfDelivery: new Date().toISOString().split('T')[0], // Default to today
        branchId: '',
        storageLocationId: '',
      });
      setErrors({});
    } else {
      setFormData({ expiryDate: '', dateOfDelivery: '', branchId: '', storageLocationId: '' });
    }
  }, [isOpen, orderData]);

  const branchOptions = useMemo(() => [
    { label: "Select Branch", value: "", disabled: true },
    ...branches.map(b => ({ label: b.branchName, value: String(b.branchId) }))
  ], [branches]);

  // Find the selected branch object from the branches prop
  const selectedBranch = useMemo(() => {
    if (!formData.branchId || !branches) return null;
    return branches.find(b => String(b.branchId) === formData.branchId);
  }, [branches, formData.branchId]);

  // Use storage locations from the selected branch object
  const storageLocationOptions = useMemo(() => {
    if (!selectedBranch || !selectedBranch.storageLocations) return [];
    
    const options = selectedBranch.storageLocations.map(sl => ({ 
      label: sl.storageLocationName, 
      value: String(sl.storageLocationId)
    }));
    
    return [
      { label: "Select Storage Location", value: "", disabled: true },
      ...options
    ];
  }, [selectedBranch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset storage location if branch changes
      ...(name === 'branchId' && { storageLocationId: '' })
    }));
    if (errors[name as keyof ReceiveFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ReceiveFormData, string>> = {};
    if (!formData.dateOfDelivery) newErrors.dateOfDelivery = 'Date of Delivery is required';
    // Expiry date might be optional depending on item type, add validation if always required
    // if (!formData.expiryDate) newErrors.expiryDate = 'Expiry Date is required'; 
    if (!formData.branchId) newErrors.branchId = 'Branch is required';
    if (!formData.storageLocationId) newErrors.storageLocationId = 'Storage Location is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderData || !validateForm()) return;
    onSubmit(formData, orderData);
  };

  if (!orderData) return null;

  return (
    <Modal 
      isOpen={isOpen}
      onClose={() => !loading && onClose()}
      title={`Receive Order #${orderData.id} - ${orderData.itemName?.split('@')[0] || orderData.itemName}`}
      size="md" // Adjust size as needed
    >
      <form onSubmit={handleSubmit} className="w-full">
        <div className="space-y-4 pr-2"> {/* Removed max-h-[60vh] overflow-y-auto */}
          <p className="text-sm text-gray-600">
            Item: <span className="font-medium">{orderData.itemName?.split('@')[0] || orderData.itemName} ({orderData.itemCode})</span><br/>
            Ordered: <span className="font-medium">{orderData.quantity} {orderData.unitName}</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1 font-medium text-sm">Date of Delivery</label>
              <Input 
                type="date" 
                name="dateOfDelivery" 
                value={formData.dateOfDelivery} 
                onChange={handleInputChange} 
                className={`w-full bg-white ${errors.dateOfDelivery ? 'border-red-500' : ''}`}
                disabled={loading}
              />
              {errors.dateOfDelivery && <p className="mt-1 text-red-500 text-xs">{errors.dateOfDelivery}</p>}
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium text-sm">Expiry Date (Optional)</label>
              <Input 
                type="date" 
                name="expiryDate" 
                value={formData.expiryDate} 
                onChange={handleInputChange} 
                className={`w-full bg-white ${errors.expiryDate ? 'border-red-500' : ''}`}
                disabled={loading}
              />
              {errors.expiryDate && <p className="mt-1 text-red-500 text-xs">{errors.expiryDate}</p>}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-medium text-sm">Branch</label>
            <Select 
              name="branchId" 
              value={formData.branchId} 
              onChange={handleInputChange} 
              options={branchOptions} 
              className={`w-full bg-white ${errors.branchId ? 'border-red-500' : ''}`}
              disabled={loading || branches.length === 0}
            />
            {errors.branchId && <p className="mt-1 text-red-500 text-xs">{errors.branchId}</p>}
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-medium text-sm">Storage Location</label>
            <Select 
              name="storageLocationId" 
              value={formData.storageLocationId} 
              onChange={handleInputChange} 
              options={storageLocationOptions} 
              className={`w-full bg-white ${errors.storageLocationId ? 'border-red-500' : ''}`}
              disabled={loading || !formData.branchId || storageLocationOptions.length === 0}
              // To allow dropdown to break out of modal, update Select to use a portal for its dropdown menu
            />
            {errors.storageLocationId && <p className="mt-1 text-red-500 text-xs">{errors.storageLocationId}</p>}
          </div>
        </div>

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
            {loading ? 'Receiving...' : 'Confirm Receipt'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReceiveOrderModal;