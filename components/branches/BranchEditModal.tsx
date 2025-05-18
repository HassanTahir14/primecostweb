'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from '@/context/TranslationContext';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/button';
import { updateBranch } from '@/store/branchSlice';
import { fetchAllStorageLocations } from '@/store/storageLocationSlice';
import type { RootState, AppDispatch } from '@/store/store';

// Interface for Branch matching the slice structure
interface Branch {
  branchId: number;
  branchName: string;
  branchManager: string;
  branchAddress: string;
  createdAt: string;
  updatedAt: string;
  storageLocations: {
    storageLocationName: string;
    storageLocationId: number;
  }[];
}

// Interface for StorageLocation from the storage location slice
interface StorageLocation {
  storageLocationId: number;
  storageLocationName: string;
}

interface BranchEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null; // Pass the branch to edit
  onSuccess: (message: string) => void; // Callback for success
  onError: (message: string) => void;   // Callback for error
}

export default function BranchEditModal({
  isOpen,
  onClose,
  branch,
  onSuccess,
  onError,
}: BranchEditModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    locations: storageLocations, 
    loading: storageLoading, 
    error: storageError 
  } = useSelector((state: RootState) => state.storageLocation);

  const { t } = useTranslation();

  const [branchName, setBranchName] = useState('');
  const [branchManager, setBranchManager] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [selectedLocationIds, setSelectedLocationIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch storage locations and pre-fill form when the modal opens/branch changes
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchAllStorageLocations());
      if (branch) {
        setBranchName(branch.branchName);
        setBranchManager(branch.branchManager);
        setBranchAddress(branch.branchAddress);
        setSelectedLocationIds(branch.storageLocations.map(loc => loc.storageLocationId));
        setErrors({});
      }
    } else {
      // Reset form when closed
      setBranchName('');
      setBranchManager('');
      setBranchAddress('');
      setSelectedLocationIds([]);
      setErrors({});
      setIsLoading(false);
    }
  }, [branch, isOpen, dispatch]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!branchName.trim()) newErrors.branchName = 'Branch name is required.';
    if (!branchManager.trim()) newErrors.branchManager = 'Branch manager is required.';
    if (!branchAddress.trim()) newErrors.branchAddress = 'Branch address is required.';
    if (selectedLocationIds.length === 0) newErrors.storageLocations = 'At least one storage location must be selected.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!branch || !validateForm()) return; // Ensure branch is present

    setIsLoading(true);
    try {
      const payload = {
        branchId: branch.branchId,
        branchName: branchName.trim(),
        branchManager: branchManager.trim(),
        branchAddress: branchAddress.trim(),
        storageLocationIdsToAdd: selectedLocationIds,
      };
      const resultAction = await dispatch(updateBranch(payload));

      if (updateBranch.fulfilled.match(resultAction)) {
         // Thunk returns payload on success for optimistic update
        const successMsg = 'Branch updated successfully'; // API doesn't seem to return description here
        onSuccess(successMsg);
        onClose(); // Close modal on success
      } else {
        const errorPayload = resultAction.payload as any;
        const errorMsg = errorPayload?.description || errorPayload?.message || 'Failed to update branch';
        onError(errorMsg);
      }
    } catch (error) {
      console.error('Error updating branch:', error);
      onError('An unexpected error occurred.');
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
    if (errors.storageLocations) {
      setErrors(prev => ({ ...prev, storageLocations: '' }));
    }
  };

  // Determine if the form has changed
  const hasChanged = 
    branchName.trim() !== branch?.branchName ||
    branchManager.trim() !== branch?.branchManager ||
    branchAddress.trim() !== branch?.branchAddress ||
    JSON.stringify(selectedLocationIds.sort()) !== JSON.stringify([...(branch?.storageLocations || [])].map(loc => loc.storageLocationId).sort());

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={t('branches.editBranch')}
      size="lg"
    >
      <div className="space-y-5">
        {/* Branch Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
            <label htmlFor="editBranchName" className="block text-gray-700 font-medium mb-1">{t('branches.branchName')} <span className="text-red-500">*</span></label>
            <input
              id="editBranchName"
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
            <label htmlFor="editBranchManager" className="block text-gray-700 font-medium mb-1">{t('branches.branchManager')} <span className="text-red-500">*</span></label>
            <input
              id="editBranchManager"
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
            <label htmlFor="editBranchAddress" className="block text-gray-700 font-medium mb-1">{t('branches.branchAddress')} <span className="text-red-500">*</span></label>
            <input
              id="editBranchAddress"
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
            <div className="text-center text-gray-500">{t('branches.noStorageLocations')}</div>
          )}
           {errors.storageLocations && <p className="text-red-500 text-xs mt-1">{t(errors.storageLocations)}</p>}
        </div>
      </div>
      
      {/* Footer Buttons */}
      <div className="mt-8 flex justify-end space-x-3">
        <Button 
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        >
          {t('common.discard')}
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isLoading || storageLoading || !hasChanged} // Disable if loading, no locations, or form hasn't changed
        >
          {isLoading ? t('branches.updating') : t('branches.update')}
        </Button>
      </div>
    </Modal>
  );
}