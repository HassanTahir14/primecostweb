'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import PageLayout from '@/components/PageLayout';
import StorageLocationCreateModal from '@/components/branches/StorageLocationCreateModal';
import StorageLocationEditModal from '@/components/branches/StorageLocationEditModal';
import Button from '@/components/common/button';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { 
  fetchAllStorageLocations, 
  deleteStorageLocation, 
  clearError 
} from '@/store/storageLocationSlice';
import type { RootState, AppDispatch } from '@/store/store';

// Interface for StorageLocation matching the slice
interface StorageLocation {
  storageLocationId: number;
  storageLocationName: string;
}

export default function StorageLocationPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { locations, loading, error } = useSelector((state: RootState) => state.storageLocation);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  
  const [selectedLocation, setSelectedLocation] = useState<StorageLocation | null>(null);
  const [locationToDeleteId, setLocationToDeleteId] = useState<number | null>(null);
  const [modalMessage, setModalMessage] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchAllStorageLocations());
  }, [dispatch]);

  // Show error modal when error state changes
  useEffect(() => {
    if (error) {
      // Check if error is an object with description or just a string
      const message = typeof error === 'object' && error !== null && error.description 
                      ? error.description 
                      : typeof error === 'string' ? error : 'An unknown error occurred';
      handleOperationError(message);
      dispatch(clearError()); // Clear the error after displaying
    }
  }, [error, dispatch]);

  // --- Modal Open/Close Handlers ---
  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const openEditModal = (location: StorageLocation) => {
    setSelectedLocation(location);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setSelectedLocation(null);
    setIsEditModalOpen(false);
  };

  const openDeleteConfirmModal = (id: number) => {
    setLocationToDeleteId(id);
    setIsDeleteConfirmModalOpen(true);
  };
  const closeDeleteConfirmModal = () => {
    setLocationToDeleteId(null);
    setIsDeleteConfirmModalOpen(false);
  };

  const closeSuccessModal = () => setIsSuccessModalOpen(false);
  const closeErrorModal = () => setIsErrorModalOpen(false);

  // --- Operation Handlers ---
  const handleOperationSuccess = (message: string) => {
    setModalMessage(message);
    setIsSuccessModalOpen(true);
    dispatch(fetchAllStorageLocations()); // Refresh data after successful operation
  };

  const handleOperationError = (message: string) => {
    setModalMessage(message);
    setIsErrorModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!locationToDeleteId) return;

    closeDeleteConfirmModal(); // Close confirmation first
    
    try {
      const resultAction = await dispatch(deleteStorageLocation(locationToDeleteId));
      if (deleteStorageLocation.fulfilled.match(resultAction)) {
        handleOperationSuccess('Storage location deleted successfully');
      } else {
        const errorPayload = resultAction.payload as any;
        handleOperationError(errorPayload?.description || errorPayload?.message || 'Failed to delete location');
      }
    } catch (err) {
      console.error('Delete failed:', err);
      handleOperationError('An unexpected error occurred during deletion.');
    }
  };

  return (
    <PageLayout title="Storage Locations">
      <div className="mb-4">
        <Link href="/branches" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Back</span>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Storage Locations</h1>
            <Button onClick={openCreateModal} disabled={loading}>
              Create New
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            {loading && locations.length === 0 ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="py-3 px-4 font-medium text-gray-500 text-sm">Storage Location Name</th>
                    <th className="py-3 px-4 font-medium text-gray-500 text-sm">ID</th>
                    <th className="py-3 px-4 font-medium text-gray-500 text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {locations.map((location) => (
                    <tr key={location.storageLocationId}>
                      <td className="py-3 px-4 text-gray-700">{location.storageLocationName}</td>
                      <td className="py-3 px-4 text-gray-500 text-sm">{location.storageLocationId}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(location)}
                            disabled={loading}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="destructive"
                            size="sm" 
                            onClick={() => openDeleteConfirmModal(location.storageLocationId)}
                            disabled={loading}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {locations.length === 0 && !loading && (
                    <tr>
                      <td colSpan={3} className="text-center py-6 text-gray-500">
                        No storage locations found. Create one!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      
      {/* Create Modal */}
      {isCreateModalOpen && (
        <StorageLocationCreateModal
          isOpen={isCreateModalOpen}
          onClose={closeCreateModal}
          onSuccess={handleOperationSuccess}
          onError={handleOperationError}
        />
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedLocation && (
        <StorageLocationEditModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          location={selectedLocation}
          onSuccess={handleOperationSuccess}
          onError={handleOperationError}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={closeDeleteConfirmModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Storage Location"
        message={`Are you sure you want to delete this storage location? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Success Modal */}
      <ConfirmationModal
        isOpen={isSuccessModalOpen}
        onClose={closeSuccessModal}
        title="Success"
        message={modalMessage}
        isAlert={true}
        okText="OK"
      />

      {/* Error Modal */}
      <ConfirmationModal
        isOpen={isErrorModalOpen}
        onClose={closeErrorModal}
        title="Error"
        message={modalMessage}
        isAlert={true}
        okText="OK"
      />
    </PageLayout>
  );
} 