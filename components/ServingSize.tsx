'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/common/button';
import Modal from './common/Modal';
import Input from './common/input';
import Select from './common/select';
import { toast } from 'react-hot-toast';

interface ServingSize {
  id: string;
  name: string;
  unit: string;
}

const UNITS_OPTIONS = [
  { label: "KG", value: "kg" },
  { label: "Grams", value: "grams" },
  { label: "Pieces", value: "pieces" },
  { label: "Liters", value: "liters" },
  { label: "ML", value: "ml" },
];

export default function ServingSize({ onClose }: { onClose: () => void }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentServingSize, setCurrentServingSize] = useState<ServingSize | null>(null);
  const [servingSizeName, setServingSizeName] = useState('');
  const [servingSizeUnit, setServingSizeUnit] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [unitError, setUnitError] = useState('');
  
  const [servingSizes, setServingSizes] = useState<ServingSize[]>([]);

  useEffect(() => {
    fetchServingSizes();
  }, []);

  const fetchServingSizes = async () => {
    setIsLoading(true);
    try {
      // In a real application, replace with actual API call
      // const response = await fetch('/api/serving-sizes');
      // const data = await response.json();
      // setServingSizes(data);
      
      // Mock data for demonstration
      setTimeout(() => {
        setServingSizes([
          { id: '1', name: 'Small', unit: 'grams' },
          { id: '2', name: 'Medium', unit: 'kg' },
          { id: '3', name: 'Large', unit: 'kg' },
          { id: '4', name: 'Extra Large', unit: 'pieces' },
        ]);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching serving sizes:', error);
      toast.error('Failed to load serving sizes');
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    let isValid = true;
    
    if (!servingSizeName.trim()) {
      setNameError('Name is required');
      isValid = false;
    } else {
      setNameError('');
    }
    
    if (!servingSizeUnit) {
      setUnitError('Unit is required');
      isValid = false;
    } else {
      setUnitError('');
    }
    
    return isValid;
  };

  const handleAddServingSize = async (name: string, unit: string) => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // In a real application, replace with actual API call
      // const response = await fetch('/api/serving-sizes', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, unit }),
      // });
      // const newServingSize = await response.json();
      
      // Mock API response
      const newServingSize = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        unit,
      };
      
      setServingSizes([...servingSizes, newServingSize]);
      setIsCreateModalOpen(false);
      toast.success('Serving size added successfully');
    } catch (error) {
      console.error('Error adding serving size:', error);
      toast.error('Failed to add serving size');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditServingSize = async (id: string, newName: string, newUnit: string) => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // In a real application, replace with actual API call
      // await fetch(`/api/serving-sizes/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name: newName, unit: newUnit }),
      // });
      
      setServingSizes(
        servingSizes.map(size => 
          size.id === id ? { ...size, name: newName, unit: newUnit } : size
        )
      );
      setIsEditModalOpen(false);
      toast.success('Serving size updated successfully');
    } catch (error) {
      console.error('Error updating serving size:', error);
      toast.error('Failed to update serving size');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteServingSize = async (id: string) => {
    if (!confirm('Are you sure you want to delete this serving size?')) return;
    
    setIsLoading(true);
    try {
      // In a real application, replace with actual API call
      // await fetch(`/api/serving-sizes/${id}`, {
      //   method: 'DELETE',
      // });
      
      setServingSizes(servingSizes.filter(size => size.id !== id));
      toast.success('Serving size deleted successfully');
    } catch (error) {
      console.error('Error deleting serving size:', error);
      toast.error('Failed to delete serving size');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (servingSize: ServingSize) => {
    setCurrentServingSize(servingSize);
    setServingSizeName(servingSize.name);
    setServingSizeUnit(servingSize.unit);
    setNameError('');
    setUnitError('');
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setServingSizeName('');
    setServingSizeUnit('');
    setNameError('');
    setUnitError('');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f1fff7] min-h-screen px-3 py-3 sm:px-4 md:px-8 sm:py-4 md:py-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">Serving Size</h1>
        </div>

        <Button 
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
          className="rounded-full bg-[#339A89] text-white text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
          disabled={isLoading}
        >
          Create New
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex-1">
        <div className="grid grid-cols-3 border-b pb-3 sm:pb-4 mb-3 sm:mb-4">
          <h2 className="text-gray-500 text-xs sm:text-sm">Serving Size Name</h2>
          <h2 className="text-gray-500 text-xs sm:text-sm">Unit</h2>
          <h2 className="text-gray-500 text-xs sm:text-sm text-right">Actions</h2>
        </div>

        {isLoading && servingSizes.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">Loading serving sizes...</p>
          </div>
        ) : servingSizes.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">No serving sizes found. Create one to get started.</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {servingSizes.map((size) => (
              <div 
                key={size.id} 
                className="grid grid-cols-3 items-center py-3 sm:py-4 border-b"
              >
                <span className="text-gray-800 text-sm sm:text-base">{size.name}</span>
                <span className="text-gray-800 text-sm sm:text-base">{size.unit}</span>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="rounded-full bg-[#339A89] text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                    onClick={() => openEditModal(size)}
                    disabled={isLoading}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="rounded-full bg-red-500 text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                    onClick={() => handleDeleteServingSize(size.id)}
                    disabled={isLoading}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Serving Size Modal */}
      <Modal 
        isOpen={isCreateModalOpen}
        onClose={() => !isLoading && setIsCreateModalOpen(false)}
        title="New Serving Size"
        size="sm"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          handleAddServingSize(servingSizeName, servingSizeUnit);
        }} className="w-full">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Name</label>
            <Input
              type="text"
              value={servingSizeName}
              onChange={(e) => {
                setServingSizeName(e.target.value);
                if (e.target.value.trim()) setNameError('');
              }}
              placeholder="Enter Serving Size Name"
              className={`w-full bg-white ${nameError ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {nameError && <p className="mt-1 text-red-500 text-sm">{nameError}</p>}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Unit</label>
            <Select
              value={servingSizeUnit}
              onChange={(e) => {
                setServingSizeUnit(e.target.value);
                if (e.target.value) setUnitError('');
              }}
              options={UNITS_OPTIONS}
              placeholder="Select primary unit"
              className={`w-full bg-white ${unitError ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {unitError && <p className="mt-1 text-red-500 text-sm">{unitError}</p>}
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
              Discard
            </Button>
            
            <Button
              type="submit"
              className="bg-[#339A89] text-white hover:bg-[#2b8274] px-4 sm:px-6"
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'ADD'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Serving Size Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => !isLoading && setIsEditModalOpen(false)}
        title="Edit Serving Size"
        size="sm"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          if (currentServingSize) {
            handleEditServingSize(currentServingSize.id, servingSizeName, servingSizeUnit);
          }
        }} className="w-full">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Name</label>
            <Input
              type="text"
              value={servingSizeName}
              onChange={(e) => {
                setServingSizeName(e.target.value);
                if (e.target.value.trim()) setNameError('');
              }}
              placeholder="Enter Serving Size Name"
              className={`w-full bg-white ${nameError ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {nameError && <p className="mt-1 text-red-500 text-sm">{nameError}</p>}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Unit</label>
            <Select
              value={servingSizeUnit}
              onChange={(e) => {
                setServingSizeUnit(e.target.value);
                if (e.target.value) setUnitError('');
              }}
              options={UNITS_OPTIONS}
              placeholder="Select primary unit"
              className={`w-full bg-white ${unitError ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {unitError && <p className="mt-1 text-red-500 text-sm">{unitError}</p>}
          </div>
          
          <div className="flex justify-between gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => !isLoading && setIsEditModalOpen(false)}
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
              {isLoading ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 