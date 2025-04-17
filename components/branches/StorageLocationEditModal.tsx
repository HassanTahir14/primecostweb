'use client';

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/button';
import { updateStorageLocation } from '@/store/storageLocationSlice';
import type { AppDispatch } from '@/store/store';

interface StorageLocation {
  storageLocationId: number;
  storageLocationName: string;
}

interface StorageLocationEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: StorageLocation | null; // Pass the location to edit
  onSuccess: (message: string) => void; // Callback for success
  onError: (message: string) => void;   // Callback for error
}

export default function StorageLocationEditModal({
  isOpen,
  onClose,
  location,
  onSuccess,
  onError,
}: StorageLocationEditModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [locationName, setLocationName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Pre-fill the form when the modal opens with a location
  useEffect(() => {
    if (location && isOpen) {
      setLocationName(location.storageLocationName);
      setValidationError(''); // Clear any previous validation errors
    } else if (!isOpen) {
      // Reset state when modal is closed
      setLocationName('');
      setValidationError('');
      setIsLoading(false);
    }
  }, [location, isOpen]);

  const handleValidation = () => {
    if (!locationName.trim()) {
      setValidationError('Storage location name is required.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!location || !handleValidation()) return; // Ensure location is present

    setIsLoading(true);
    try {
      const resultAction = await dispatch(
        updateStorageLocation({
          storageLocationId: location.storageLocationId,
          storageLocationName: locationName.trim(),
        })
      );
      
      if (updateStorageLocation.fulfilled.match(resultAction)) {
         // Use the description from the API response if available, otherwise use a default
         // Note: updateStorageLocation thunk currently returns the input payload.
         // If the API returns a specific success message, adjust slice/API service.
        const successMsg = resultAction.payload?.description || 'Storage location updated successfully'; 
        onSuccess(successMsg); // Notify parent
        onClose();             // Close modal on success
      } else {
        const errorPayload = resultAction.payload as any;
        const errorMsg = errorPayload?.description || errorPayload?.message || 'Failed to update storage location';
        onError(errorMsg); // Notify parent of the error
      }
    } catch (error) {
      console.error('Error updating storage location:', error);
      onError('An unexpected error occurred.'); // Notify parent of unexpected error
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset state handled by useEffect when isOpen changes
    onClose();
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Edit Storage Location"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="editLocationName" className="block text-gray-700 font-medium mb-1">Storage Location Name <span className="text-red-500">*</span></label>
          <input
            id="editLocationName"
            type="text"
            placeholder="Enter Storage Location Name"
            className={`w-full p-3 border ${validationError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${validationError ? 'focus:ring-red-500' : 'focus:ring-[#00997B]'}`}
            value={locationName}
            onChange={(e) => {
              setLocationName(e.target.value);
              if (validationError) {
                setValidationError(''); // Clear error on input change
              }
            }}
            disabled={isLoading}
          />
           {validationError && <p className="text-red-500 text-xs mt-1">{validationError}</p>}
        </div>
      </div>
      
      <div className="mt-6 flex justify-end space-x-3">
        <Button 
          variant="outline"
          onClick={handleClose}
          disabled={isLoading}
        >
          Discard
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isLoading || !locationName.trim() || locationName.trim() === location?.storageLocationName} // Disable if loading, empty, or unchanged
        >
          {isLoading ? 'Updating...' : 'UPDATE'}
        </Button>
      </div>
    </Modal>
  );
} 