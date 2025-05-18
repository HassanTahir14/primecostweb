'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageLayout from '@/components/PageLayout';
import Link from 'next/link';
import BranchCreateModal from '@/components/branches/BranchCreateModal';
import BranchEditModal from '@/components/branches/BranchEditModal';
import Button from '@/components/common/button';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { fetchAllBranches, deleteBranch } from '@/store/branchSlice';
import type { RootState, AppDispatch } from '@/store/store';
import { useTranslation } from '@/context/TranslationContext';

// Import Branch interface from the slice
import type { Branch } from '@/store/branchSlice';

interface StorageLocation {
  storageLocationName: string;
  storageLocationId: number;
}

export default function BranchesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { branches, loading, error } = useSelector((state: RootState) => state.branch);
  const { t } = useTranslation();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);
  
  // Fetch branches on component mount
  useEffect(() => {
    dispatch(fetchAllBranches());
  }, [dispatch]);

  // Handle operation success/error
  const handleOperationSuccess = (message: string) => {
    setConfirmationMessage(message);
    setIsSuccessMessage(true);
    dispatch(fetchAllBranches()); // Refresh the list
  };

  const handleOperationError = (message: string) => {
    setConfirmationMessage(message);
    setIsSuccessMessage(false);
  };

  // Handle edit branch
  const handleEditClick = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsEditModalOpen(true);
  };

  // Handle delete branch
  const handleDeleteClick = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBranch) return;
    
    try {
      const resultAction = await dispatch(deleteBranch(selectedBranch.branchId));
      
      if (deleteBranch.fulfilled.match(resultAction)) {
        handleOperationSuccess(t('branches.deleteSuccess'));
      } else {
        const errorPayload = resultAction.payload as any;
        handleOperationError(errorPayload?.description || t('branches.deleteError'));
      }
    } catch (error) {
      handleOperationError(t('branches.unexpectedError'));
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedBranch(null);
    }
  };
  
  return (
    <PageLayout title={t('branches.title')}>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-end items-center">
            <div className="flex space-x-4">
              <Button onClick={() => setIsCreateModalOpen(true)}>
                {t('branches.createNew')}
              </Button>
              <Link href="/branches/storage-location">
                <Button>
                  {t('branches.storageLocation')}
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-4">{t('branches.loading')}</div>
            ) : error ? (
              <div className="text-center text-red-500 py-4">{t('branches.error', { error })}</div>
            ) : branches.length === 0 ? (
              <div className="text-center text-gray-500 py-4">{t('branches.noBranches')}</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="py-4 px-6 font-medium text-gray-600">{t('branches.branchName')}</th>
                    <th className="py-4 px-6 font-medium text-gray-600">{t('branches.branchManager')}</th>
                    <th className="py-4 px-6 font-medium text-gray-600">{t('branches.branchAddress')}</th>
                    <th className="py-4 px-6 font-medium text-gray-600">{t('branches.storageLocations')}</th>
                    <th className="py-4 px-6 font-medium text-gray-600">{t('branches.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {branches.map((branch) => (
                    <tr key={branch.branchId} className="border-b border-gray-100">
                      <td className="py-4 px-6">{branch.branchName}</td>
                      <td className="py-4 px-6">{branch.branchManager}</td>
                      <td className="py-4 px-6">{branch.branchAddress}</td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {branch.storageLocations.map((location) => (
                            <span 
                              key={location.storageLocationId}
                              className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-600"
                            >
                              {location.storageLocationName}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={() => handleEditClick(branch)}>
                            {t('common.edit')}
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteClick(branch)}
                          >
                            {t('common.delete')}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      
      {/* Create Modal */}
      <BranchCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleOperationSuccess}
        onError={handleOperationError}
      />

      {/* Edit Modal */}
      <BranchEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBranch(null);
        }}
        branch={selectedBranch}
        onSuccess={handleOperationSuccess}
        onError={handleOperationError}
      />

      {/* Confirmation/Error Modal */}
      <ConfirmationModal
        isOpen={!!confirmationMessage}
        onClose={() => setConfirmationMessage('')}
        title={isSuccessMessage ? t('common.success') : t('common.error')}
        message={confirmationMessage}
        isAlert={isSuccessMessage}
        okText={t('common.ok')}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedBranch(null);
        }}
        title={t('branches.confirmDelete')}
        message={t('branches.confirmDeleteMessage', { branchName: selectedBranch?.branchName || '' })}
        onConfirm={handleConfirmDelete}
      />
    </PageLayout>
  );
}