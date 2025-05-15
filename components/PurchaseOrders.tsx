'use client';

import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/common/button';
import Modal from './common/Modal';
import Input from './common/input';
import Select from './common/select';
import ConfirmationModal from './common/ConfirmationModal';
import ReceiveOrderModal from './ReceiveOrderModal';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import {
  fetchAllPurchaseOrders,
  addPurchaseOrder,
  updatePurchaseOrder,
  receivePurchaseOrder,
  clearError,
  PurchaseOrder as PurchaseOrderType,
} from '@/store/purchaseOrderSlice';
import { AsyncThunk } from '@reduxjs/toolkit';
import { fetchAllItems } from '@/store/itemsSlice';
import { fetchAllSuppliers } from '@/store/supplierSlice';
import { fetchAllBranches, Branch } from '@/store/branchSlice';
import { fetchAllStorageLocations, StorageLocation } from '@/store/storageLocationSlice';
import { useUnits } from '@/hooks/useUnits';
import { fetchAllCategories } from '@/store/itemCategorySlice';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrencyValue, getCurrencyFromStorage } from '@/utils/currencyUtils';

// Extend the PurchaseOrder type to include createdAt
interface PurchaseOrder extends PurchaseOrderType {
  createdAt?: string;
}

interface Item {
  itemId: number;
  name: string;
  code: string;
  categoryId: number;
  primaryUnitId: number;
  primaryUnitValue: number;
  secondaryUnitId: number;
  secondaryUnitValue: number;
  itemsBrandName: string;
  countryOrigin: string;
  purchaseCostWithoutVat: number;
  taxId: number;
  purchaseCostWithVat: number;
  images: Array<{
    imageId: number;
    path: string;
  }>;
  tokenStatus: string;
  branchDetails: Array<{
    branchId: number;
    branchName: string;
    storageLocationId: number;
    storageLocationName: string;
    quantity: number;
  }>;
}

interface Supplier {
  supplierId: number;
  name: string;
}

interface PurchaseOrdersProps {
  onClose: () => void;
}

interface FormDataState {
  itemId: string;
  categoryId: string;
  supplierId: string;
  unitType: "primary" | "secondary";
  unitId: string;
  quantity: string;
  purchaseCost: string;
  vatAmount: string;
}

const initialFormState: FormDataState = {
  itemId: '',
  categoryId: '',
  supplierId: '',
  unitType: 'primary',
  unitId: '',
  quantity: '',
  purchaseCost: '',
  vatAmount: '',
};

// Helper for date formatting
function formatDate(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

// Helper for status formatting
function formatOrderStatus(status: string) {
  if (!status) return '';
  switch (status.toUpperCase()) {
    case 'ON_HOLD': return 'On Hold';
    case 'CANCELLED': return 'Cancelled';
    case 'RECEIVED': return 'Received';
    case 'UNDER_PROCESS': return 'Under Process';
    case 'APPROVED': return 'Approved';
    case 'PENDING': return 'Pending';
    case 'REJECTED': return 'Rejected';
    default: return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }
}

export default function PurchaseOrders({ onClose }: PurchaseOrdersProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    orders: purchaseOrders, 
    loading: poLoading, 
    error: poError 
  } = useSelector((state: RootState) => state.purchaseOrder);
  
  // Get items, suppliers, and categories from state
  const items = useSelector((state: RootState) => state.items.items || []) as unknown as Item[];
  const suppliers = useSelector((state: RootState) => state.supplier.suppliers || []) as unknown as Supplier[];
  const categories = useSelector((state: RootState) => state.itemCategory.categories || []);
  
  // Get units using the hook
  const { units, loading: unitsLoading } = useUnits();
  
  // Get branches and storage locations from state
  const branches = useSelector((state: RootState) => state.branch.branches || []) as Branch[];
  console.log("branches", branches);
  const storageLocations = useSelector((state: RootState) => state.storageLocation.locations || []) as StorageLocation[];

  // Get currency from context
  const { currency } = useCurrency();

  // Function to get unit name by ID
  const getUnitName = (unitId: number) => {
    const unit = units.find(u => u.unitOfMeasurementId === unitId);
    return unit?.unitName || 'N/A';
  };

  // Function to get category name by ID
  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.categoryId === categoryId);
    return category?.name || 'N/A';
  };

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
  
  // State for Receive Order Modal
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [selectedOrderForReceive, setSelectedOrderForReceive] = useState<PurchaseOrder | null>(null);

  // Create memoized options for dropdowns
  const itemOptions = useMemo(() => {
    // If we're editing an order, make sure the item is in the options
    if (editingOrder) {
      // Find the item by name and code
      const editingItemExists = items.some(item => 
        item.name === editingOrder.itemName && item.code === editingOrder.itemCode
      );
      
      // If the item doesn't exist in the current items list, add it to the options
      if (!editingItemExists) {
        return [
          {
            label: `${editingOrder.itemName?.split('@')[0] || 'Unknown Item'} (${editingOrder.itemCode || 'No Code'})`,
            value: String(editingOrder.id), // Use order ID as a temporary value
            categoryId: String(editingOrder.categoryId || ''),
            primaryUnitId: String(editingOrder.unitId || ''),
            secondaryUnitId: String(editingOrder.unitId || '')
          },
          ...items.map((item: Item) => ({
            label: `${item.name.split('@')[0]} (${item.code})`,
            value: String(item.itemId),
            categoryId: String(item.categoryId),
            primaryUnitId: String(item.primaryUnitId),
            secondaryUnitId: String(item.secondaryUnitId)
          }))
        ];
      }
    }
    
    // Default case: map all items to options
    return items.map((item: Item) => ({
      label: `${item.name.split('@')[0]} (${item.code})`,
      value: String(item.itemId),
      categoryId: String(item.categoryId),
      primaryUnitId: String(item.primaryUnitId),
      secondaryUnitId: String(item.secondaryUnitId)
    }));
  }, [items, editingOrder]);

  const supplierOptions = useMemo(() => {
    // Filter out any duplicate suppliers by ID
    const uniqueSuppliers = suppliers.reduce((acc, supplier) => {
      if (!acc.some(existing => existing.supplierId === supplier.supplierId)) {
        acc.push(supplier);
      }
      return acc;
    }, [] as Supplier[]);
    
    return [
      { label: "Select Supplier", value: "", disabled: true },
      ...uniqueSuppliers.map((supplier: Supplier) => ({
        label: supplier.name,
        value: String(supplier.supplierId)
      }))
    ];
  }, [suppliers]);

  // Update unit options based on selected item and unit type
  const unitOptions = useMemo(() => {
    if (!formData.itemId) return [];
    
    const selectedItem = items.find(item => String(item.itemId) === formData.itemId);
    if (!selectedItem) return [];

    if (formData.unitType === 'primary') {
      const primaryUnit = units.find(u => u.unitOfMeasurementId === selectedItem.primaryUnitId);
      return [{
        label: `${primaryUnit?.unitName || 'Primary Unit'} (${primaryUnit?.unitDescription || ''})`,
        value: String(selectedItem.primaryUnitId)
      }];
    } else {
      const secondaryUnit = units.find(u => u.unitOfMeasurementId === selectedItem.secondaryUnitId);
      return [{
        label: `${secondaryUnit?.unitName || 'Secondary Unit'} (${secondaryUnit?.unitDescription || ''})`,
        value: String(selectedItem.secondaryUnitId)
      }];
    }
  }, [items, formData.itemId, formData.unitType, units]);

  // Update form data when item changes
  useEffect(() => {
    if (formData.itemId) {
      const selectedItem = items.find(item => String(item.itemId) === formData.itemId);
      if (selectedItem) {
        setFormData(prev => ({
          ...prev,
          categoryId: String(selectedItem.categoryId),
          unitId: formData.unitType === 'primary' 
            ? String(selectedItem.primaryUnitId)
            : String(selectedItem.secondaryUnitId),
          purchaseCost: String(selectedItem.purchaseCostWithoutVat),
          vatAmount: String(selectedItem.purchaseCostWithVat - selectedItem.purchaseCostWithoutVat)
        }));
      }
    }
  }, [formData.itemId, formData.unitType, items]);

  useEffect(() => {
    dispatch(fetchAllPurchaseOrders({ page: 0, size: 1000, sortBy: 'dateOfOrder', direction: 'asc' }));
    dispatch(fetchAllSuppliers());
    dispatch(fetchAllItems({page: 0, size: 100000})); 
    dispatch(fetchAllBranches());
    dispatch(fetchAllStorageLocations());
    dispatch(fetchAllCategories());
    console.log("items", items);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Create a new form data object with the updated value
    const updatedFormData = { ...formData };
    
    // Handle unit type changes
    if (name === 'unitType') {
      updatedFormData.unitType = value as "primary" | "secondary";
    } else {
      // For all other fields, update normally
      updatedFormData[name as keyof FormDataState] = value;
    }
    
    // If the item is changing, update the category and unit options
    if (name === 'itemId' && value) {
      const selectedItem = items.find(item => String(item.itemId) === value);
      if (selectedItem) {
        updatedFormData.categoryId = String(selectedItem.categoryId);
        
        // Set the unit ID based on the current unit type
        updatedFormData.unitId = formData.unitType === 'primary' 
          ? String(selectedItem.primaryUnitId) 
          : String(selectedItem.secondaryUnitId);
      }
    }
    
    // If the unit type or quantity is changing, recalculate the price
    if ((name === 'unitType' || name === 'quantity') && updatedFormData.itemId) {
      const selectedItem = items.find(item => String(item.itemId) === updatedFormData.itemId);
      if (selectedItem) {
        const quantity = parseFloat(updatedFormData.quantity) || 0;
        
        if (updatedFormData.unitType === 'primary') {
          // For primary unit, use the original price
          const vatAmount = Math.round(((selectedItem.purchaseCostWithVat - selectedItem.purchaseCostWithoutVat) * quantity) * 100) / 100;
          updatedFormData.purchaseCost = String(Math.round(selectedItem.purchaseCostWithoutVat * quantity * 100) / 100);
          updatedFormData.vatAmount = String(vatAmount);
        } else {
          // For secondary unit, adjust the price based on the conversion ratio
          const conversionRatio = selectedItem.secondaryUnitValue;
          const vatAmount = Math.round((((selectedItem.purchaseCostWithVat - selectedItem.purchaseCostWithoutVat) / conversionRatio) * quantity) * 100) / 100;
          updatedFormData.purchaseCost = String(Math.round((selectedItem.purchaseCostWithoutVat / conversionRatio) * quantity * 100) / 100);
          updatedFormData.vatAmount = String(vatAmount);
        }
      }
    }
    
    setFormData(updatedFormData);
    
    // Clear any errors for the changed field
    if (formErrors[name as keyof FormDataState]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormDataState, string>> = {};
    if (!formData.itemId) errors.itemId = 'Item is required';
    if (!formData.categoryId) errors.categoryId = 'Category is required (auto-selected from item)';
    if (!formData.supplierId) errors.supplierId = 'Supplier is required';
    if (!formData.unitId) errors.unitId = 'Unit is required';
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) errors.quantity = 'Valid quantity is required';
    if (!formData.purchaseCost || parseFloat(formData.purchaseCost) < 0) errors.purchaseCost = 'Valid purchase cost is required';
    if (!formData.vatAmount || parseFloat(formData.vatAmount) < 0) errors.vatAmount = 'Valid VAT amount is required';

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

    // Find the selected item
    const selectedItem = items.find(item => String(item.itemId) === formData.itemId);
    
    // If we're editing and couldn't find the item by ID, it might be because we used the order ID
    // In this case, we'll use the item from the editingOrder
    if (!selectedItem && editingOrder) {
      // We'll use the existing order data
      const payload = {
        ...formData,
        id: editingOrder.id,
        unit: formData.unitType === 'primary' 
          ? String(editingOrder.unitId)
          : String(editingOrder.unitId),
        isPrimaryUnitSelected: formData.unitType === 'primary',
        isSecondaryUnitSelected: formData.unitType === 'secondary',
        vatPercentage: Math.round((Number(formData.vatAmount) / Number(formData.purchaseCost)) * 100)
      };

      try {
        const resultAction = await dispatch(updatePurchaseOrder(payload));

        if (resultAction.type === updatePurchaseOrder.fulfilled.type) {
          const successMsg = (resultAction.payload as any)?.description || 'Order updated successfully!';
          resetFormAndCloseModal();
          dispatch(fetchAllPurchaseOrders({ page: 0, size: 10, sortBy: 'dateOfOrder', direction: 'asc' }));
          
          setFeedbackMessage(successMsg);
          setIsSuccess(true);
          setIsFeedbackAlert(true);
          setFeedbackModalOpen(true);
        } else if (resultAction.type === updatePurchaseOrder.rejected.type) {
          console.error("Thunk rejected:", resultAction.payload);
        }
      } catch (error) {
        console.error("Unexpected submission error:", error);
        setFeedbackMessage('An unexpected error occurred during submission.');
        setIsSuccess(false);
        setIsFeedbackAlert(true);
        setFeedbackModalOpen(true);
      }
      return;
    }

    // If we couldn't find the item, show an error
    if (!selectedItem) {
      setFeedbackMessage('Selected item not found.');
      setIsSuccess(false);
      setIsFeedbackAlert(true);
      setFeedbackModalOpen(true);
      return;
    }

    const thunkActionCreator: AsyncThunk<any, any, any> = editingOrder
      ? updatePurchaseOrder
      : addPurchaseOrder;

    const payload = {
      ...formData,
      id: editingOrder?.id,
      unit: formData.unitType === 'primary' 
        ? String(selectedItem.primaryUnitId)
        : String(selectedItem.secondaryUnitId),
      isPrimaryUnitSelected: formData.unitType === 'primary',
      isSecondaryUnitSelected: formData.unitType === 'secondary',
      vatPercentage: Math.round((Number(formData.vatAmount) / Number(formData.purchaseCost)) * 100)
    };

    try {
      const resultAction = await dispatch(thunkActionCreator(payload));

      if (resultAction.type === thunkActionCreator.fulfilled.type) {
        const successMsg = (resultAction.payload as any)?.description || 
                          (editingOrder ? 'Order updated successfully!' : 'Order added successfully!');
        resetFormAndCloseModal();
        dispatch(fetchAllPurchaseOrders({ page: 0, size: 1000, sortBy: 'dateOfOrder', direction: 'asc' }));
        
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

  const handleEditClick = (order: any) => {
    setEditingOrder(order);
    
    // Find the item by name and code
    const selectedItem = items.find(item => 
      item.name === order.itemName && item.code === order.itemCode
    );
    
    // Determine if the order is using primary or secondary unit
    let unitType: "primary" | "secondary" = 'primary';
    if (selectedItem) {
      // Check if the order's unitId matches the item's secondary unit
      if (String(order.unitId) === String(selectedItem.secondaryUnitId)) {
        unitType = 'secondary';
      }
    }
    
    // Calculate the price based on the unit type
    let purchaseCost = order.purchaseCost;
    let vatAmount = order.vatAmount;
    
    if (selectedItem) {
      if (unitType === 'secondary') {
        // If secondary unit is selected, adjust the price based on the conversion ratio
        const conversionRatio = selectedItem.secondaryUnitValue;
        purchaseCost = selectedItem.purchaseCostWithoutVat / conversionRatio;
        vatAmount = (selectedItem.purchaseCostWithVat - selectedItem.purchaseCostWithoutVat) / conversionRatio;
      } else {
        // If primary unit is selected, use the original prices
        purchaseCost = selectedItem.purchaseCostWithoutVat;
        vatAmount = selectedItem.purchaseCostWithVat - selectedItem.purchaseCostWithoutVat;
      }
    }
    
    setFormData({
      itemId: selectedItem ? String(selectedItem.itemId) : String(order.id), // Use itemId if found, otherwise use order ID
      categoryId: String(order.categoryId || 1),
      supplierId: String(order.supplierId || ''),
      unitType: unitType as "primary" | "secondary",
      unitId: String(order.unitId || ''),
      quantity: String(order.quantity || ''),
      purchaseCost: String(purchaseCost || ''),
      vatAmount: String(vatAmount || ''),
    });
    
    // If we found the item, update additional fields
    if (selectedItem) {
      setFormData(prev => ({
        ...prev,
        categoryId: String(selectedItem.categoryId),
      }));
    }
    
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

  // --- Receive Order Logic ---
  const handleReceiveClick = (order: PurchaseOrder) => {
    // Ensure we have the necessary unit selection flags on the order object
    // If they aren't present from the fetch, determine them here if possible,
    // otherwise, the API might need adjustment or the fetch needs to return them.
    // Assuming the `addPurchaseOrder/updatePurchaseOrder` thunks add these flags
    // or they are inherently available on the fetched `order` object.
    if (order.isPrimaryUnitSelected === undefined || order.isSecondaryUnitSelected === undefined) {
       console.warn("Order object missing unit selection flags for receiving:", order);
       // Fallback or fetch needed flags if possible
       // For now, we proceed assuming they exist, but this needs verification
    }
    setSelectedOrderForReceive(order);
    setIsReceiveModalOpen(true);
  };

  const handleReceiveSubmit = async (receiveFormData: any, orderData: PurchaseOrder) => {
    dispatch(clearError());
    setIsSuccess(false);

    const payload = {
      purchaseId: orderData.id,
      expiryDate: receiveFormData.expiryDate || null, // Send null if empty
      dateOfDelivery: receiveFormData.dateOfDelivery,
      quantity: orderData.quantity, // Quantity from the original order
      unit: orderData.unitId, // Unit ID from the original order
      // **Crucially**: Get these flags from the order being received
      isPrimaryUnitSelected: orderData.isPrimaryUnitSelected ?? true, // Default if not present, but ideally should be
      isSecondaryUnitSelected: orderData.isSecondaryUnitSelected ?? false, // Default if not present
      storageLocationId: parseInt(receiveFormData.storageLocationId),
      branchId: parseInt(receiveFormData.branchId),
    };

    try {
      const resultAction = await dispatch(receivePurchaseOrder(payload));
      if (resultAction.type === receivePurchaseOrder.fulfilled.type) {
        setIsReceiveModalOpen(false);
        setSelectedOrderForReceive(null);
        setFeedbackMessage((resultAction.payload as any)?.description || 'Order received successfully!');
        setIsSuccess(true);
        setIsFeedbackAlert(true);
        setFeedbackModalOpen(true);
        // Optionally refetch orders if status change isn't handled optimistically
        dispatch(fetchAllPurchaseOrders({ page: 0, size: 10, sortBy: 'dateOfOrder', direction: 'asc' }));
      } else if (resultAction.type === receivePurchaseOrder.rejected.type) {
         setFeedbackMessage((resultAction.payload as any)?.description || (resultAction.payload as any)?.errors || (resultAction.payload as any)?.message || 'Failed to receive order.');
         setIsSuccess(false);
         setIsFeedbackAlert(true);
         setFeedbackModalOpen(true); 
         // Keep receive modal open on failure?
         // setIsReceiveModalOpen(false); // Close modal even on failure?
      }
    } catch (error) {
      console.error("Unexpected receive submission error:", error);
      setFeedbackMessage('An unexpected error occurred during receive submission.');
      setIsSuccess(false);
      setIsFeedbackAlert(true);
      setFeedbackModalOpen(true);
      // setIsReceiveModalOpen(false); // Close modal even on failure?
    }
  };
  // --- End Receive Order Logic ---

  const [isDateAsc, setIsDateAsc] = useState(true);

  const [formattedCosts, setFormattedCosts] = useState<any>({});

  useEffect(() => {
    if (purchaseOrders && currency) {
      const formatCosts = async () => {
        try {
          const costs: {[key: string]: string} = {};
          for (const order of purchaseOrders) {
            const costWithVat = (order.purchaseCost ?? 0) + (order.vatAmount ?? 0);
            costs[order.id] = await formatCurrencyValue(costWithVat, currency);
          }
          setFormattedCosts(costs);
        } catch (error) {
          console.error('Error formatting costs:', error);
          setFormattedCosts({});
        }
      };
      formatCosts();
    }
  }, [purchaseOrders, currency]);

  return (
    <div className="flex-1 flex flex-col bg-white min-h-screen px-3 py-3 sm:px-4 md:px-8 sm:py-4 md:py-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800" disabled={poLoading}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">Purchase Orders</h1>
        </div>

        <div className="flex items-center gap-2">
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
          <Button
            onClick={() => setIsDateAsc((prev) => !prev)}
            className="rounded-full bg-[#28addb] text-white text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
          >
            Sort by Date: {isDateAsc ? 'Oldest First' : 'Newest First'}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex-1">
        <div className="overflow-x-auto">
          {poLoading ? (
            <div className="text-center py-10 text-gray-500">Loading purchase orders...</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-4 px-6 font-medium text-sm text-gray-500">PO ID</th>
                  <th className="py-4 px-6 font-medium text-sm text-gray-500">Item Name</th>
                  <th className="py-4 px-6 font-medium text-sm text-gray-500">Quantity</th>
                  <th className="py-4 px-6 font-medium text-sm text-gray-500">Unit</th>
                  <th className="py-4 px-6 font-medium text-sm text-gray-500">Order Date</th>
                  <th className="py-4 px-6 font-medium text-sm text-gray-500">Cost with VAT</th>
                  <th className="py-4 px-6 font-medium text-sm text-gray-500">Token Status</th>
                  <th className="py-4 px-6 font-medium text-sm text-gray-500">Order Status</th>
                  <th className="py-4 px-6 font-medium text-sm text-gray-500 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.length > 0 ? (
                  [...purchaseOrders]
                    .sort((a: any, b: any) => isDateAsc
                      ? new Date(a.dateOfOrder).getTime() - new Date(b.dateOfOrder).getTime()
                      : new Date(b.dateOfOrder).getTime() - new Date(a.dateOfOrder).getTime()
                    )
                    .map((order:any) => {
                      const costWithVat = (order.purchaseCost ?? 0) + (order.vatAmount ?? 0);
                      return (
                        <tr key={order.id} className="border-b border-gray-200 last:border-b-0">
                          <td className="py-4 px-6 text-sm">{order.id}</td>
                          <td className="py-4 px-6 text-sm">{order.itemName?.split('@')[0]}</td>
                          <td className="py-4 px-6 text-sm">{order.quantity}</td>
                          <td className="py-4 px-6 text-sm">{order.unitName}</td>
                          <td className="py-4 px-6 text-sm">{formatDate(order.dateOfOrder)}</td>
                          <td className="py-4 px-6 text-sm">{formattedCosts[order.id] || 'N/A'}</td>
                          <td className="py-4 px-6 text-sm">
                            <span className={order.tokenStatus === 'PENDING' ? 'text-red-600 font-bold' : ''}>
                              {order.tokenStatus.charAt(0).toUpperCase() + order.tokenStatus.slice(1).toLowerCase()}
                            </span>
                            {order.tokenStatus === 'PENDING' && (
                              <div className="text-red-600 font-bold">Approve the Token</div>
                            )}
                          </td>
                          <td className="py-4 px-6 text-sm">{formatOrderStatus(order.purchaseOrderStatus)}</td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="rounded-full bg-[#05A49D] text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                                onClick={() => handleEditClick(order)}
                                disabled={poLoading}
                              >
                                Update
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="rounded-full bg-[#28addb] text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                                onClick={() => handleReceiveClick(order)}
                                disabled={poLoading || order.purchaseOrderStatus === 'RECEIVED' || order.purchaseOrderStatus === 'CANCELLED'}
                              >
                                Order Received?
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-gray-500">
                      {poError ? 'Error loading data.' : 'No purchase orders found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
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
                    options={itemOptions}
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
                    value={getCategoryName(parseInt(formData.categoryId))}
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
                    options={supplierOptions}
                    className={`w-full bg-white ${formErrors.supplierId ? 'border-red-500' : ''}`}
                    disabled={poLoading}
                />
                {formErrors.supplierId && <p className="mt-1 text-red-500 text-sm">{formErrors.supplierId}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-700 mb-2 font-medium">Unit Type</label>
                    <Select
                        name="unitType"
                        value={formData.unitType}
                        onChange={handleInputChange}
                        options={[
                          { label: "Primary Unit", value: "primary" },
                          { label: "Secondary Unit", value: "secondary" }
                        ]}
                        className={`w-full bg-white ${formErrors.unitType ? 'border-red-500' : ''}`}
                        disabled={poLoading}
                    />
                    {formErrors.unitType && <p className="mt-1 text-red-500 text-sm">{formErrors.unitType}</p>}
                </div>
                <div>
                    <label className="block text-gray-700 mb-2 font-medium">Unit</label>
                    <Select
                        name="unitId"
                        value={formData.unitId}
                        onChange={handleInputChange}
                        options={unitOptions}
                        className={`w-full bg-white ${formErrors.unitId ? 'border-red-500' : ''}`}
                        disabled={poLoading || !formData.itemId}
                    />
                    {formErrors.unitId && <p className="mt-1 text-red-500 text-sm">{formErrors.unitId}</p>}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div>
                    <label className="block text-gray-700 mb-2 font-medium">Purchase Cost</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                            {getCurrencyFromStorage()}
                        </span>
                        <Input
                            type="number"
                            name="purchaseCost"
                            value={formData.purchaseCost}
                            readOnly
                            className="w-full bg-gray-100 pl-12"
                            disabled={true}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-gray-700 mb-2 font-medium">VAT Amount</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                            {getCurrencyFromStorage()}
                        </span>
                        <Input
                            type="number"
                            name="vatAmount"
                            value={Number(formData.vatAmount).toFixed(2)}
                            readOnly
                            className="w-full bg-gray-100 pl-12"
                            disabled={true}
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

       {/* --- Render Receive Order Modal --- */}
       {selectedOrderForReceive && (
         <ReceiveOrderModal
           isOpen={isReceiveModalOpen}
           onClose={() => setIsReceiveModalOpen(false)}
           onSubmit={handleReceiveSubmit}
           orderData={selectedOrderForReceive} 
           branches={branches} 
           storageLocations={storageLocations} 
           loading={poLoading} // Use main loading state for now
         />
       )}

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