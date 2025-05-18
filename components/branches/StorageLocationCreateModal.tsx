'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from '@/context/TranslationContext';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/button';
import { addStorageLocation } from '@/store/storageLocationSlice';
import type { AppDispatch } from '@/store/store';

interface StorageLocationCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void; // Callback for success
  onError: (message: string) => void;   // Callback for error
}

export default function StorageLocationCreateModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
}: StorageLocationCreateModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const [locationName, setLocationName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleValidation = () => {
    if (!locationName.trim()) {
      setValidationError(t('storageLocation.nameRequired'));
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!handleValidation()) return;

    setIsLoading(true);
    try {
      const resultAction = await dispatch(
        addStorageLocation({ storageLocationName: locationName.trim() })
      );
      
      // Check if the action was fulfilled
      if (addStorageLocation.fulfilled.match(resultAction)) {
        // Use the description from the API response if available
        const successMsg = resultAction.payload?.description || t('storageLocation.addSuccess'); 
        onSuccess(successMsg); // Notify parent
        setLocationName('');   // Clear input on success
        onClose();             // Close modal on success
      } else {
        // Handle rejected action
        const errorPayload = resultAction.payload as any; // Type assertion if needed
        const errorMsg = errorPayload?.description || errorPayload?.message || t('storageLocation.addError');
        onError(errorMsg); // Notify parent of the error
      }
    } catch (error) {
      console.error('Error adding storage location:', error);
      onError(t('storageLocation.unexpectedError')); // Notify parent of unexpected error
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setLocationName(''); // Clear state on close
    setValidationError('');
    setIsLoading(false); // Reset loading state
    onClose();
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={t('storageLocation.createNew')}
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="locationName" className="block text-gray-700 font-medium mb-1">{t('storageLocation.name')} <span className="text-red-500">*</span></label>
          <input
            id="locationName"
            type="text"
            placeholder={t('storageLocation.enterName')}
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
          {t('common.discard')}
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isLoading || !locationName.trim()} // Disable if loading or input is empty
        >
          {isLoading ? t('storageLocation.adding') : t('storageLocation.add')}
        </Button>
      </div>
    </Modal>
  );
}