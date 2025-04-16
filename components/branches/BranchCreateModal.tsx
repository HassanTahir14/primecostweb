'use client';

import { useState } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/button';

// Mock data for storage locations
const storageLocations = [
  { id: 1, name: 'Walking Freezer - Butchery' },
  { id: 2, name: 'Walking Fridge - Butchery' },
  { id: 3, name: 'Dry Stock Room' },
  { id: 4, name: 'Daily Stock Room' },
  { id: 5, name: 'Walking Fridge - Salad Area' },
  { id: 6, name: 'Walking Freezer - Desserts' },
  { id: 7, name: 'Walking Fridge- Desserts' },
  { id: 8, name: 'Walking Freezer - Hot Section Area' },
  { id: 9, name: 'Walking Fridge- Hot Section Area' },
];

interface BranchCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BranchCreateModal({ isOpen, onClose }: BranchCreateModalProps) {
  const [branchName, setBranchName] = useState('');
  const [branchManager, setBranchManager] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<number[]>([]);

  const handleSubmit = () => {
    // Handle form submission
    onClose();
  };

  const toggleLocation = (id: number) => {
    setSelectedLocations(prev => 
      prev.includes(id) 
        ? prev.filter(locId => locId !== id) 
        : [...prev, id]
    );
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="New Branch"
      size="lg"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Branch Name</label>
            <input
              type="text"
              placeholder="Enter Branch Name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B]"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">Branch Manager</label>
            <input
              type="text"
              placeholder="Enter Branch Manager Name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B]"
              value={branchManager}
              onChange={(e) => setBranchManager(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">Branch Address</label>
            <input
              type="text"
              placeholder="Enter Branch Address"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B]"
              value={branchAddress}
              onChange={(e) => setBranchAddress(e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-2">Storage Location</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {storageLocations.map(location => (
              <button
                key={location.id}
                onClick={() => toggleLocation(location.id)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  selectedLocations.includes(location.id)
                    ? 'bg-[#00997B] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {location.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end space-x-4">
        <Button 
          variant="outline"
          onClick={onClose}
        >
          Discard
        </Button>
        <Button 
          onClick={handleSubmit}
        >
          ADD
        </Button>
      </div>
    </Modal>
  );
} 