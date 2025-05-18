'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from '@/context/TranslationContext';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/button';
import { addBranch } from '@/store/branchSlice';
import { fetchAllStorageLocations } from '@/store/storageLocationSlice'; // Fetch storage locations
import type { RootState, AppDispatch } from '@/store/store';

// Interface for StorageLocation from the storage location slice
interface StorageLocation {
  storageLocationId: number;
  storageLocationName: string;
}

interface BranchCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void; // Callback for success
  onError: (message: string) => void;   // Callback for error
}

export default function BranchCreateModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  onError 
}: BranchCreateModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    locations: storageLocations, // Rename for clarity
    loading: storageLoading, 
    error: storageError 
  } = useSelector((state: RootState) => state.storageLocation);

  const { t } = useTranslation();

  const [branchName, setBranchName] = useState('');
  const [branchManager, setBranchManager] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [selectedLocationIds, setSelectedLocationIds] = useState<number[]>([]); // Store IDs
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch storage locations when the modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchAllStorageLocations());
      // Reset form on open
      setBranchName('');
      setBranchManager('');
      setBranchAddress('');
      setSelectedLocationIds([]);
      setErrors({});
      setIsLoading(false);
    }
  }, [isOpen, dispatch]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!branchName.trim()) newErrors.branchName = 'branches.branchNameRequired';
    if (!branchManager.trim()) newErrors.branchManager = 'branches.branchManagerRequired';
    if (!branchAddress.trim()) newErrors.branchAddress = 'branches.branchAddressRequired';
    if (selectedLocationIds.length === 0) newErrors.storageLocations = 'branches.storageLocationsRequired';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const resultAction = await dispatch(
        addBranch({
          // Assuming the slice expects 'name' based on slice definition
          branchName: branchName.trim(), 
          branchManager: branchManager.trim(),
          branchAddress: branchAddress.trim(),
          storageLocationIdsToAdd: selectedLocationIds,
        })
      );

      if (addBranch.fulfilled.match(resultAction)) {
        const successMsg = resultAction.payload?.description || t('branches.branchAddedSuccessfully');
        onSuccess(successMsg);
        onClose(); // Close modal on success
      } else {
        const errorPayload = resultAction.payload as any;
        const errorMsg = errorPayload?.description || errorPayload?.message || t('branches.failedToAddBranch');
        onError(errorMsg);
      }
    } catch (error) {
      console.error('Error adding branch:', error);
      onError(t('branches.unexpectedError'));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLocation = (id: number) => {
    setSelectedLocationIds(prev => 
      prev.includes(id) 
        ? prev.filter(locId => locId !== id) 
        : [...prev, id]
    );
    // Clear storage location error if user interacts
    if (errors.storageLocations) {
      setErrors(prev => ({ ...prev, storageLocations: '' }));
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={t('branches.newBranch')}
      size="lg"
    >
      <div className="space-y-5">
        {/* Branch Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="branchName" className="block text-gray-700 font-medium mb-1">{t('branches.branchName')} <span className="text-red-500">*</span></label>
            <input
              id="branchName"
              type="text"
              placeholder={t('branches.enterBranchName')}
              className={`w-full p-3 border ${errors.branchName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.branchName ? 'focus:ring-red-500' : 'focus:ring-[#00997B]'}`}
              value={branchName}
              onChange={(e) => {
                setBranchName(e.target.value);
                if (errors.branchName) setErrors(prev => ({ ...prev, branchName: '' }));
              }}
              disabled={isLoading}
            />
            {errors.branchName && <p className="text-red-500 text-xs mt-1">{t(errors.branchName)}</p>}
          </div>
          
          <div>
            <label htmlFor="branchManager" className="block text-gray-700 font-medium mb-1">{t('branches.branchManager')} <span className="text-red-500">*</span></label>
            <input
              id="branchManager"
              type="text"
              placeholder={t('branches.enterBranchManager')}
              className={`w-full p-3 border ${errors.branchManager ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.branchManager ? 'focus:ring-red-500' : 'focus:ring-[#00997B]'}`}
              value={branchManager}
              onChange={(e) => {
                setBranchManager(e.target.value);
                 if (errors.branchManager) setErrors(prev => ({ ...prev, branchManager: '' }));
              }}
              disabled={isLoading}
            />
             {errors.branchManager && <p className="text-red-500 text-xs mt-1">{t(errors.branchManager)}</p>}
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="branchAddress" className="block text-gray-700 font-medium mb-1">{t('branches.branchAddress')} <span className="text-red-500">*</span></label>
            <input
              id="branchAddress"
              type="text"
              placeholder={t('branches.enterBranchAddress')}
              className={`w-full p-3 border ${errors.branchAddress ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.branchAddress ? 'focus:ring-red-500' : 'focus:ring-[#00997B]'}`}
              value={branchAddress}
              onChange={(e) => {
                setBranchAddress(e.target.value);
                if (errors.branchAddress) setErrors(prev => ({ ...prev, branchAddress: '' }));
              }}
              disabled={isLoading}
            />
            {errors.branchAddress && <p className="text-red-500 text-xs mt-1">{t(errors.branchAddress)}</p>}
          </div>
        </div>
        
        {/* Storage Locations Selection */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">{t('branches.assignStorageLocations')} <span className="text-red-500">*</span></label>
          {storageLoading ? (
            <div className="text-center text-gray-500">{t('branches.loadingLocations')}</div>
          ) : storageError ? (
             <div className="text-center text-red-500">{t('branches.errorLoadingLocations')}</div>
          ) : storageLocations.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {storageLocations.map((location: StorageLocation) => (
                <button
                  key={location.storageLocationId}
                  onClick={() => toggleLocation(location.storageLocationId)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors text-left break-words ${
                    selectedLocationIds.includes(location.storageLocationId)
                      ? 'bg-[#00997B] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  disabled={isLoading}
                >
                  {location.storageLocationName}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">{t('branches.noLocationsAvailable')}</div>
          )}
          {errors.storageLocations && <p className="text-red-500 text-xs mt-1">{t(errors.storageLocations)}</p>}
        </div>

        {/* Submit Button */}
        <div className="text-right">
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading} 
            className="bg-[#00997B] text-white px-6 py-2 rounded-lg"
          >
            {isLoading ? t('branches.saving') : t('branches.saveBranch')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}