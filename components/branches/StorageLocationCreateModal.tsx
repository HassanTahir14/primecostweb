'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/button';

interface StorageLocationCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StorageLocationCreateModal({ isOpen, onClose }: StorageLocationCreateModalProps) {
  const [locationName, setLocationName] = useState('');

  const handleSubmit = () => {
    // Handle form submission
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="New Storage Location"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Storage Location</label>
          <input
            type="text"
            placeholder="Enter Storage Location Name"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B]"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
          />
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