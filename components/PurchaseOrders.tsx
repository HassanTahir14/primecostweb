'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/common/button';
import Modal from './common/Modal';
import Input from './common/input';
import Select from './common/select';
import { toast } from 'react-hot-toast';

interface PurchaseOrder {
  id: string;
  productName: string;
  itemCode: string;
  taxType: string;
  supplierName: string;
  unit: string;
  quantity: number;
  amount: number;
  vatAmount: number;
}

interface PurchaseOrdersProps {
  onClose: () => void;
}

const SUPPLIER_OPTIONS = [
  { label: "Supplier A", value: "Supplier A" },
  { label: "Supplier B", value: "Supplier B" },
  { label: "Supplier C", value: "Supplier C" },
];

const UNIT_OPTIONS = [
  { label: "KG", value: "KG" },
  { label: "Grams", value: "Grams" },
  { label: "Pieces", value: "Pieces" },
  { label: "Liters", value: "Liters" },
  { label: "ML", value: "ML" },
];

const TAX_OPTIONS = [
  { label: "VAT", value: "VAT" },
  { label: "No Tax", value: "No Tax" },
];

export default function PurchaseOrders({ onClose }: PurchaseOrdersProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [productName, setProductName] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [taxType, setTaxType] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [unit, setUnit] = useState('');
  const [quantity, setQuantity] = useState('');
  const [amount, setAmount] = useState('');
  const [vatAmount, setVatAmount] = useState('');
  
  // Form validation
  const [productNameError, setProductNameError] = useState('');
  const [itemCodeError, setItemCodeError] = useState('');
  const [taxTypeError, setTaxTypeError] = useState('');
  const [supplierNameError, setSupplierNameError] = useState('');
  const [unitError, setUnitError] = useState('');
  const [quantityError, setQuantityError] = useState('');
  const [amountError, setAmountError] = useState('');
  
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: '1',
      productName: 'Tomatoes',
      itemCode: 'TOM001',
      taxType: 'VAT',
      supplierName: 'Supplier A',
      unit: 'KG',
      quantity: 10,
      amount: 25.50,
      vatAmount: 3.83,
    },
    {
      id: '2',
      productName: 'Chicken',
      itemCode: 'CHK002',
      taxType: 'VAT',
      supplierName: 'Supplier B',
      unit: 'KG',
      quantity: 5,
      amount: 45.00,
      vatAmount: 6.75,
    },
    {
      id: '3',
      productName: 'Rice',
      itemCode: 'RIC003',
      taxType: 'No Tax',
      supplierName: 'Supplier C',
      unit: 'KG',
      quantity: 20,
      amount: 30.00,
      vatAmount: 0,
    },
  ]);

  const handleAddPurchaseOrder = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // Mock API response
      const newOrder = {
        id: (purchaseOrders.length + 1).toString(),
        productName,
        itemCode,
        taxType,
        supplierName,
        unit,
        quantity: parseFloat(quantity),
        amount: parseFloat(amount),
        vatAmount: parseFloat(vatAmount || '0'),
      };
      
      setPurchaseOrders([...purchaseOrders, newOrder]);
      setIsCreateModalOpen(false);
      resetForm();
      toast.success('Purchase order added successfully');
    } catch (error) {
      console.error('Error adding purchase order:', error);
      toast.error('Failed to add purchase order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPurchaseOrder = (id: string) => {
    const orderToEdit = purchaseOrders.find(order => order.id === id);
    if (orderToEdit) {
      // In a real application, you would populate form values and open edit modal
      toast.success(`Editing order ${id}`);
    }
  };

  const handleDeletePurchaseOrder = (id: string) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      setPurchaseOrders(purchaseOrders.filter(order => order.id !== id));
      toast.success('Purchase order deleted successfully');
    }
  };

  const validateForm = () => {
    let isValid = true;
    
    if (!productName) {
      setProductNameError('Product name is required');
      isValid = false;
    } else {
      setProductNameError('');
    }
    
    if (!itemCode) {
      setItemCodeError('Item code is required');
      isValid = false;
    } else {
      setItemCodeError('');
    }
    
    if (!taxType) {
      setTaxTypeError('Tax type is required');
      isValid = false;
    } else {
      setTaxTypeError('');
    }
    
    if (!supplierName) {
      setSupplierNameError('Supplier is required');
      isValid = false;
    } else {
      setSupplierNameError('');
    }
    
    if (!unit) {
      setUnitError('Unit is required');
      isValid = false;
    } else {
      setUnitError('');
    }
    
    if (!quantity) {
      setQuantityError('Quantity is required');
      isValid = false;
    } else if (isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) {
      setQuantityError('Quantity must be a positive number');
      isValid = false;
    } else {
      setQuantityError('');
    }
    
    if (!amount) {
      setAmountError('Amount is required');
      isValid = false;
    } else if (isNaN(parseFloat(amount)) || parseFloat(amount) < 0) {
      setAmountError('Amount must be a valid number');
      isValid = false;
    } else {
      setAmountError('');
    }
    
    return isValid;
  };

  const resetForm = () => {
    setProductName('');
    setItemCode('');
    setTaxType('');
    setSupplierName('');
    setUnit('');
    setQuantity('');
    setAmount('');
    setVatAmount('');
    setProductNameError('');
    setItemCodeError('');
    setTaxTypeError('');
    setSupplierNameError('');
    setUnitError('');
    setQuantityError('');
    setAmountError('');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f1fff7] min-h-screen px-3 py-3 sm:px-4 md:px-8 sm:py-4 md:py-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">Purchase Orders Item</h1>
        </div>

        <Button 
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
          className="rounded-full bg-[#05A49D] text-white text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
          disabled={isLoading}
        >
          Custom Order
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex-1">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">Product</th>
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">Item Code</th>
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">Supplier</th>
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">Quantity</th>
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">Amount (USD)</th>
                <th className="text-right pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && purchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    <p className="text-gray-500">Loading purchase orders...</p>
                  </td>
                </tr>
              ) : purchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    <p className="text-gray-500">No purchase orders found. Create one to get started.</p>
                  </td>
                </tr>
              ) : (
                purchaseOrders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{order.productName}</td>
                    <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{order.itemCode}</td>
                    <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{order.supplierName}</td>
                    <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{order.quantity} {order.unit}</td>
                    <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">${order.amount.toFixed(2)}</td>
                    <td className="py-3 sm:py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="rounded-full bg-[#339A89] text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                          onClick={() => handleEditPurchaseOrder(order.id)}
                          disabled={isLoading}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="rounded-full bg-red-500 text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                          onClick={() => handleDeletePurchaseOrder(order.id)}
                          disabled={isLoading}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Purchase Order Modal */}
      <Modal 
        isOpen={isCreateModalOpen}
        onClose={() => !isLoading && setIsCreateModalOpen(false)}
        title="New Order"
        size="lg"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          handleAddPurchaseOrder();
        }} className="w-full">
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Product Name</label>
              <Input
                type="text"
                value={productName}
                onChange={(e) => {
                  setProductName(e.target.value);
                  if (e.target.value) setProductNameError('');
                }}
                placeholder="Select Item"
                className={`w-full bg-white ${productNameError ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              {productNameError && <p className="mt-1 text-red-500 text-sm">{productNameError}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Item Code</label>
                <Input
                  type="text"
                  value={itemCode}
                  onChange={(e) => {
                    setItemCode(e.target.value);
                    if (e.target.value) setItemCodeError('');
                  }}
                  placeholder="Enter Product ID"
                  className={`w-full bg-white ${itemCodeError ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                {itemCodeError && <p className="mt-1 text-red-500 text-sm">{itemCodeError}</p>}
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Tax Type</label>
                <Select
                  value={taxType}
                  onChange={(e) => {
                    setTaxType(e.target.value);
                    if (e.target.value) setTaxTypeError('');
                  }}
                  options={TAX_OPTIONS}
                  placeholder="Select tax type"
                  className={`w-full bg-white ${taxTypeError ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                {taxTypeError && <p className="mt-1 text-red-500 text-sm">{taxTypeError}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Supplier Name</label>
                <Select
                  value={supplierName}
                  onChange={(e) => {
                    setSupplierName(e.target.value);
                    if (e.target.value) setSupplierNameError('');
                  }}
                  options={SUPPLIER_OPTIONS}
                  placeholder="Select Supplier"
                  className={`w-full bg-white ${supplierNameError ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                {supplierNameError && <p className="mt-1 text-red-500 text-sm">{supplierNameError}</p>}
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Select Unit</label>
                <Select
                  value={unit}
                  onChange={(e) => {
                    setUnit(e.target.value);
                    if (e.target.value) setUnitError('');
                  }}
                  options={UNIT_OPTIONS}
                  placeholder="Select Unit"
                  className={`w-full bg-white ${unitError ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                {unitError && <p className="mt-1 text-red-500 text-sm">{unitError}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Quantity</label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    if (e.target.value) setQuantityError('');
                  }}
                  placeholder="Enter quantity"
                  className={`w-full bg-white ${quantityError ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                {quantityError && <p className="mt-1 text-red-500 text-sm">{quantityError}</p>}
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Amount</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">USD</span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (e.target.value) setAmountError('');
                    }}
                    placeholder="0.00"
                    className={`w-full bg-white pl-12 ${amountError ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {amountError && <p className="mt-1 text-red-500 text-sm">{amountError}</p>}
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">VAT Amount</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">USD</span>
                  <Input
                    type="number"
                    value={vatAmount}
                    onChange={(e) => setVatAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white pl-12"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!isLoading) {
                  setIsCreateModalOpen(false);
                  resetForm();
                }
              }}
              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 sm:px-6 w-full sm:w-auto"
              disabled={isLoading}
            >
              Discard
            </Button>
            
            <Button
              type="submit"
              className="bg-[#05A49D] text-white hover:bg-[#048c86] px-4 sm:px-6 w-full sm:w-auto"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Order'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 