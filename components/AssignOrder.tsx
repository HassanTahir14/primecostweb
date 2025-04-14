'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/button';
import Modal from './ui/Modal';
import Input from './ui/input';
import Select from './ui/select';
import { toast } from 'react-hot-toast';

interface Order {
  id: string;
  assignedTo: string;
  orderType: 'RECIPE' | 'PREPARATION';
  status: 'PENDING' | 'FINISHED' | 'CANCELLED';
}

interface AssignOrderProps {
  onClose: () => void;
}

const USER_OPTIONS = [
  { label: "Junaid", value: "Junaid" },
  { label: "Ali", value: "Ali" },
  { label: "Sarah", value: "Sarah" },
];

const ORDER_TYPE_OPTIONS = [
  { label: "RECIPE", value: "RECIPE" },
  { label: "PREPARATION", value: "PREPARATION" },
];

export default function AssignOrder({ onClose }: AssignOrderProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [orderType, setOrderType] = useState<string>('');
  const [userError, setUserError] = useState('');
  const [orderTypeError, setOrderTypeError] = useState('');
  
  const [orders, setOrders] = useState<Order[]>([
    { id: '1', assignedTo: 'Junaid', orderType: 'RECIPE', status: 'FINISHED' },
    { id: '2', assignedTo: 'Junaid', orderType: 'RECIPE', status: 'PENDING' },
  ]);

  const handleAddOrder = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // In a real application, replace with actual API call
      // const response = await fetch('/api/orders', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ assignedTo: selectedUser, orderType }),
      // });
      // const newOrder = await response.json();
      
      // Mock API response
      const newOrder = {
        id: (orders.length + 1).toString(),
        assignedTo: selectedUser,
        orderType: orderType as 'RECIPE' | 'PREPARATION',
        status: 'PENDING',
      };
      
      setOrders([...orders, newOrder as Order]);
      setIsCreateModalOpen(false);
      resetForm();
      toast.success('Order assigned successfully');
    } catch (error) {
      console.error('Error assigning order:', error);
      toast.error('Failed to assign order');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    let isValid = true;
    
    if (!selectedUser) {
      setUserError('User is required');
      isValid = false;
    } else {
      setUserError('');
    }
    
    if (!orderType) {
      setOrderTypeError('Order type is required');
      isValid = false;
    } else {
      setOrderTypeError('');
    }
    
    return isValid;
  };

  const resetForm = () => {
    setSelectedUser('');
    setOrderType('');
    setUserError('');
    setOrderTypeError('');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f1fff7] min-h-screen px-3 py-3 sm:px-4 md:px-8 sm:py-4 md:py-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">Assign Order</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#05A49D] rounded-lg text-white px-3 py-1.5 text-xs sm:text-sm">
            Total Orders: {orders.length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex-1">
        <div className="grid grid-cols-4 border-b pb-3 sm:pb-4 mb-3 sm:mb-4">
          <h2 className="text-gray-500 text-xs sm:text-sm">Assigned To</h2>
          <h2 className="text-gray-500 text-xs sm:text-sm">Order Id</h2>
          <h2 className="text-gray-500 text-xs sm:text-sm">Order Type</h2>
          <h2 className="text-gray-500 text-xs sm:text-sm">Order Status</h2>
        </div>

        {isLoading && orders.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">No orders found. Assign one to get started.</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="grid grid-cols-4 items-center py-3 sm:py-4 border-b"
              >
                <span className="text-gray-800 text-sm sm:text-base">{order.assignedTo}</span>
                <span className="text-gray-800 text-sm sm:text-base">{order.id}</span>
                <span className="text-gray-800 text-sm sm:text-base">{order.orderType}</span>
                <span 
                  className={`text-sm sm:text-base font-medium ${
                    order.status === 'FINISHED' ? 'text-green-600' : 
                    order.status === 'CANCELLED' ? 'text-red-600' : 'text-orange-500'
                  }`}
                >
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      <Modal 
        isOpen={isCreateModalOpen}
        onClose={() => !isLoading && setIsCreateModalOpen(false)}
        title="Assign New Order"
        size="sm"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          handleAddOrder();
        }} className="w-full">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Assign To</label>
            <Select
              value={selectedUser}
              onChange={(e) => {
                setSelectedUser(e.target.value);
                if (e.target.value) setUserError('');
              }}
              options={USER_OPTIONS}
              placeholder="Select user"
              className={`w-full bg-white ${userError ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {userError && <p className="mt-1 text-red-500 text-sm">{userError}</p>}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Order Type</label>
            <Select
              value={orderType}
              onChange={(e) => {
                setOrderType(e.target.value);
                if (e.target.value) setOrderTypeError('');
              }}
              options={ORDER_TYPE_OPTIONS}
              placeholder="Select order type"
              className={`w-full bg-white ${orderTypeError ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {orderTypeError && <p className="mt-1 text-red-500 text-sm">{orderTypeError}</p>}
          </div>
          
          <div className="flex justify-between gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!isLoading) {
                  setIsCreateModalOpen(false);
                  resetForm();
                }
              }}
              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 sm:px-6"
              disabled={isLoading}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              className="bg-[#339A89] text-white hover:bg-[#2b8274] px-4 sm:px-6"
              disabled={isLoading}
            >
              {isLoading ? 'Assigning...' : 'Assign'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 