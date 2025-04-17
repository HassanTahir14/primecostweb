'use client';

import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/common/button';
import Modal from './common/Modal';
import Input from './common/input';
import Select from './common/select';
import ConfirmationModal from './common/ConfirmationModal';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import {
  fetchAllPurchaseOrders,
  addPurchaseOrder,
  updatePurchaseOrder,
  clearError,
  PurchaseOrder,
} from '@/store/purchaseOrderSlice';
import { AsyncThunk } from '@reduxjs/toolkit';

const MOCK_SUPPLIER_OPTIONS = [
  { label: "Select Supplier", value: "", disabled: true },
  { label: "Almarai", value: "67660" },
  { label: "NADEC", value: "2" },
];

const MOCK_ITEM_OPTIONS = [
   { label: "Select Item", value: "", disabled: true },
   { label: "Test Item@Solid Item", value: "ITEM-20236723", categoryId: "2" },
   { label: "Milk", value: "1", categoryId: "1" },
   { label: "Yogurt", value: "2", categoryId: "1" },
   { label: "Cheese", value: "3", categoryId: "1" },
   { label: "Chicken Breast", value: "4", categoryId: "2" },
   { label: "Beef Mince", value: "5", categoryId: "2" },
];

const MOCK_CATEGORY_OPTIONS = [
  { label: "Select Category", value: "", disabled: true },
  { label: "Dairy", value: "1" },
  { label: "Meat", value: "2" },
];

const UNIT_OPTIONS = [
  { label: "Select Unit", value: "", disabled: true },
  { label: "KG", value: "KG" },
  { label: "Grams", value: "Grams" },
  { label: "Pieces", value: "Pieces" },
  { label: "Liters", value: "Liters" },
  { label: "ML", value: "ML" },
];

interface PurchaseOrdersProps {
  onClose: () => void;
}

interface FormDataState {
  itemId: string;
  categoryId: string;
  supplierId: string;
  unit: number;
  quantity: string;
  purchaseCost: string;
  vatPercentage: string;
  vatAmount: string;
}

const initialFormState: FormDataState = {
  itemId: '',
  categoryId: '',
  supplierId: '',
  unit: 1,
  quantity: '',
  purchaseCost: '',
  vatPercentage: '15',
  vatAmount: '',
};

export default function PurchaseOrders({ onClose }: PurchaseOrdersProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    orders: purchaseOrders, 
    loading: poLoading, 
    error: poError 
  } = useSelector((state: RootState) => state.purchaseOrder);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [formData, setFormData] = useState<FormDataState>(initialFormState);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormDataState, string>>>({});

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isFeedbackAlert, setIsFeedbackAlert] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [actionOrderId, setActionOrderId] = useState<number | null>(null);
  const [isConfirmDeleteModal, setIsConfirmDeleteModal] = useState(false);

  useEffect(() => {
    dispatch(fetchAllPurchaseOrders({ page: 0, size: 10, sortBy: 'dateOfOrder', direction: 'asc' }));
  }, [dispatch]);

  useEffect(() => {
    if (poError) {
      const errorMsg = typeof poError === 'string' ? poError :
                       (poError as any)?.description || (poError as any)?.message || 'An operation failed.';
      setFeedbackMessage(errorMsg);
      setIsFeedbackAlert(true);
      setIsSuccess(false);
      setIsConfirmDeleteModal(false);
      setFeedbackModalOpen(true);
    }
  }, [poError]);

  useEffect(() => {
    const cost = parseFloat(formData.purchaseCost) || 0;
    const percentage = parseFloat(formData.vatPercentage) || 0;
    if (cost > 0 && percentage > 0) {
      const vat = (cost * percentage) / 100;
      setFormData(prev => ({ ...prev, vatAmount: vat.toFixed(2) }));
    } else {
      setFormData(prev => ({ ...prev, vatAmount: '' }));
    }
  }, [formData.purchaseCost, formData.vatPercentage]);

  useEffect(() => {
       const selectedItem = MOCK_ITEM_OPTIONS.find(item => item.value === formData.itemId);
       if (selectedItem && selectedItem.categoryId) {
           setFormData(prev => ({ ...prev, categoryId: selectedItem.categoryId }));
       } else if (!formData.itemId && formData.categoryId !== '') {
           setFormData(prev => ({ ...prev, categoryId: '' }));
       }
   }, [formData.itemId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof FormDataState]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormDataState, string>> = {};
    if (!formData.itemId) errors.itemId = 'Item is required';
    if (!formData.categoryId) errors.categoryId = 'Category is required (auto-selected from item)';
    if (!formData.supplierId) errors.supplierId = 'Supplier is required';
    if (!formData.unit) errors.unit = 'Unit is required';
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) errors.quantity = 'Valid quantity is required';
    if (!formData.purchaseCost || parseFloat(formData.purchaseCost) < 0) errors.purchaseCost = 'Valid purchase cost is required';
    if (!formData.vatPercentage || parseFloat(formData.vatPercentage) < 0) errors.vatPercentage = 'Valid VAT percentage is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetFormAndCloseModal = () => {
    setFormData(initialFormState);
    setFormErrors({});
    setEditingOrder(null);
    setIsModalOpen(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(clearError());
    setIsSuccess(false);

    const thunkActionCreator: AsyncThunk<any, any, any> = editingOrder
      ? updatePurchaseOrder
      : addPurchaseOrder;

    const payload = editingOrder 
        ? { ...formData, id: editingOrder.id } 
        : formData;

    try {
        const resultAction = await dispatch(thunkActionCreator(payload));

        if (resultAction.type === thunkActionCreator.fulfilled.type) {
            const successMsg = (resultAction.payload as any)?.description || 
                             (editingOrder ? 'Order updated successfully!' : 'Order added successfully!');
            resetFormAndCloseModal();
            dispatch(fetchAllPurchaseOrders({ page: 0, size: 10, sortBy: 'datedFOrder', direction: 'asc' }));
            
            setFeedbackMessage(successMsg);
            setIsSuccess(true);
            setIsFeedbackAlert(true);
            setFeedbackModalOpen(true);

        } else if (resultAction.type === thunkActionCreator.rejected.type) {
            console.error("Thunk rejected:", resultAction.payload);
        }
    } catch (error) {
        console.error("Unexpected submission error:", error);
        setFeedbackMessage('An unexpected error occurred during submission.');
        setIsSuccess(false);
        setIsFeedbackAlert(true);
        setFeedbackModalOpen(true);
    }
  };

  const handleEditClick = (order: PurchaseOrder) => {
    setEditingOrder(order);
    const formItemId = MOCK_ITEM_OPTIONS.find(item => item.value === order.itemCode)?.value || ''; 
    setFormData({
      itemId: formItemId, 
      categoryId: String(order.categoryId || ''),
      supplierId: String(order.supplierId || ''),
      unit: 1 || '', 
      quantity: String(order.quantity || ''),
      purchaseCost: String(order.purchaseCost || ''),
      vatPercentage: String(order.vatPercentage || '15'), 
      vatAmount: String(order.vatAmount || ''),
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setActionOrderId(id);
    setFeedbackMessage(`Are you sure you want to delete order ${id}? This action cannot be undone.`);
    setIsConfirmDeleteModal(true);
    setIsFeedbackAlert(false);
    setFeedbackModalOpen(true);
  };

  const confirmDelete = async () => {
     if (actionOrderId === null) return;
     
     console.log("Confirm delete order:", actionOrderId);
     setFeedbackModalOpen(false);

     setFeedbackMessage(`Delete functionality for order ${actionOrderId} is not yet implemented.`);
     setIsSuccess(false);
     setIsFeedbackAlert(true);
     setFeedbackModalOpen(true);
     setActionOrderId(null);
  };

   const handleFeedbackModalClose = () => {
       setFeedbackModalOpen(false);
       setFeedbackMessage('');
       setIsConfirmDeleteModal(false);
       setActionOrderId(null);
       if (poError) {
           dispatch(clearError());
       }
   };

  return (
    <div className="flex-1 flex flex-col bg-[#f1fff7] min-h-screen px-3 py-3 sm:px-4 md:px-8 sm:py-4 md:py-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800" disabled={poLoading}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">Purchase Orders</h1>
        </div>

        <Button 
          onClick={() => {
            resetFormAndCloseModal();
            setEditingOrder(null);
            setIsModalOpen(true);
          }}
          className="rounded-full bg-[#05A49D] text-white text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
          disabled={poLoading}
        >
          Create Order
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex-1">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">Item Name</th>
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">Item Code</th>
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">Supplier</th>
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">Quantity</th>
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">Cost (USD)</th>
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">VAT (%)</th>
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">VAT Amt (USD)</th>
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">Status</th>
                <th className="text-right pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {poLoading && purchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10">
                    <p className="text-gray-500">Loading purchase orders...</p>
                  </td>
                </tr>
              ) : !poLoading && purchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10">
                    <p className="text-gray-500">{poError ? 'Error loading data.' : 'No purchase orders found.'}</p>
                  </td>
                </tr>
              ) : (
                purchaseOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{order.itemName || 'N/A'}</td>
                    <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{order.itemCode || 'N/A'}</td>
                    <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{order.supplierName || 'N/A'}</td>
                    <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{order.quantity} {order.unitName}</td>
                    <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{order.purchaseCost?.toFixed(2)}</td>
                    <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{order.vatPercentage?.toFixed(2)}%</td>
                    <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{order.vatAmount?.toFixed(2)}</td>
                     <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.purchaseOrderStatus === 'APPROVED' ? 'bg-green-100 text-green-700' : order.purchaseOrderStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                            {order.purchaseOrderStatus || 'N/A'}
                        </span>
                    </td>
                    <td className="py-3 sm:py-4 text-right">
                      <div className="flex justify-end gap-1 sm:gap-2">
                      
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="rounded-full bg-[#339A89] text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                    onClick={() => handleEditClick(order)}
                    disabled={poLoading}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="rounded-full bg-red-500 text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                    onClick={() => handleDeleteClick(order.id)}
                    disabled={poLoading}
                  >
                    Delete
                  </Button>
                        {/* <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600 hover:bg-blue-100 p-1 sm:p-1.5 rounded-full"
                          onClick={() => handleEditClick(order)}
                          disabled={poLoading}
                          aria-label="Edit"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:bg-red-100 p-1 sm:p-1.5 rounded-full"
                          onClick={() => handleDeleteClick(order.id)}
                          disabled={poLoading}
                          aria-label="Delete"
                        >
                           <Trash2 size={16} />
                        </Button> */}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen}
        onClose={() => !poLoading && resetFormAndCloseModal()}
        title={editingOrder ? `Edit Order #${editingOrder.id}` : 'Create New Order'}
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="w-full">
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div>
                <label className="block text-gray-700 mb-2 font-medium">Item Name</label>
                <Select
                    name="itemId"
                    value={formData.itemId}
                    onChange={handleInputChange}
                    options={MOCK_ITEM_OPTIONS}
                    className={`w-full bg-white ${formErrors.itemId ? 'border-red-500' : ''}`}
                    disabled={poLoading}
                />
                {formErrors.itemId && <p className="mt-1 text-red-500 text-sm">{formErrors.itemId}</p>}
            </div>

            <div>
                <label className="block text-gray-700 mb-2 font-medium">Category</label>
                <Input
                    type="text"
                    name="categoryId"
                    value={MOCK_CATEGORY_OPTIONS.find(c => c.value === formData.categoryId)?.label || 'Select item first'}
                    readOnly
                    className={`w-full bg-gray-100 ${formErrors.categoryId ? 'border-red-500' : ''}`}
                    disabled={poLoading}
                />
                 {formErrors.categoryId && <p className="mt-1 text-red-500 text-sm">{formErrors.categoryId}</p>}
            </div>
            
            <div>
                <label className="block text-gray-700 mb-2 font-medium">Supplier Name</label>
                <Select
                    name="supplierId"
                    value={formData.supplierId}
                    onChange={handleInputChange}
                    options={MOCK_SUPPLIER_OPTIONS}
                    className={`w-full bg-white ${formErrors.supplierId ? 'border-red-500' : ''}`}
                    disabled={poLoading}
                />
                {formErrors.supplierId && <p className="mt-1 text-red-500 text-sm">{formErrors.supplierId}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-700 mb-2 font-medium">Select Unit</label>
                    <Select
                        name="unit"
                        value={formData.unit}
                        onChange={handleInputChange}
                        options={UNIT_OPTIONS}
                        className={`w-full bg-white ${formErrors.unit ? 'border-red-500' : ''}`}
                        disabled={poLoading}
                    />
                    {formErrors.unit && <p className="mt-1 text-red-500 text-sm">{formErrors.unit}</p>}
                </div>
                <div>
                    <label className="block text-gray-700 mb-2 font-medium">Quantity</label>
                    <Input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        placeholder="Enter quantity"
                        className={`w-full bg-white ${formErrors.quantity ? 'border-red-500' : ''}`}
                        disabled={poLoading}
                    />
                    {formErrors.quantity && <p className="mt-1 text-red-500 text-sm">{formErrors.quantity}</p>}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                    <label className="block text-gray-700 mb-2 font-medium">Purchase Cost</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">USD</span>
                        <Input
                            type="number"
                            name="purchaseCost"
                            value={formData.purchaseCost}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            className={`w-full bg-white pl-12 ${formErrors.purchaseCost ? 'border-red-500' : ''}`}
                            disabled={poLoading}
                        />
                    </div>
                     {formErrors.purchaseCost && <p className="mt-1 text-red-500 text-sm">{formErrors.purchaseCost}</p>}
                </div>
                <div>
                    <label className="block text-gray-700 mb-2 font-medium">VAT %</label>
                     <Input
                        type="number"
                        name="vatPercentage"
                        value={formData.vatPercentage}
                        onChange={handleInputChange}
                        placeholder="e.g., 15"
                        className={`w-full bg-white ${formErrors.vatPercentage ? 'border-red-500' : ''}`}
                        disabled={poLoading}
                    />
                    {formErrors.vatPercentage && <p className="mt-1 text-red-500 text-sm">{formErrors.vatPercentage}</p>}
                </div>
                <div>
                    <label className="block text-gray-700 mb-2 font-medium">VAT Amount</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">USD</span>
                        <Input
                            type="number"
                            name="vatAmount"
                            value={formData.vatAmount}
                            readOnly
                            placeholder="0.00"
                            className="w-full bg-gray-100 pl-12"
                            disabled={poLoading}
                        />
                    </div>
                </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={resetFormAndCloseModal}
              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 sm:px-6 w-full sm:w-auto"
              disabled={poLoading}
            >
              Discard
            </Button>
            <Button
              type="submit"
              className="bg-[#05A49D] text-white hover:bg-[#048c86] px-4 sm:px-6 w-full sm:w-auto"
              disabled={poLoading}
            >
              {poLoading ? 'Processing...' : (editingOrder ? 'Update Order' : 'Create Order')}
            </Button>
          </div>
        </form>
      </Modal>

       <ConfirmationModal
            isOpen={feedbackModalOpen}
            onClose={handleFeedbackModalClose}
            title={isConfirmDeleteModal ? 'Confirm Deletion' : (isSuccess ? 'Success' : 'Error')}
            message={feedbackMessage}
            isAlert={isFeedbackAlert}
            confirmText="Delete"
            onConfirm={isConfirmDeleteModal ? confirmDelete : undefined}
            okText="OK"
       />

    </div>
  );
} 