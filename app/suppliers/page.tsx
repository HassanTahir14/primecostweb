'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageLayout from '@/components/PageLayout';
import Suppliers from '@/components/Suppliers';
import SupplierDetails from '@/components/SupplierDetails';
import { fetchAllSuppliers } from '@/store/supplierSlice';
import type { RootState } from '@/store/store';
import ConfirmationModal from '@/components/common/ConfirmationModal';

export default function SuppliersPage() {
  const dispatch = useDispatch();
  const { error } = useSelector((state: RootState) => state.supplier);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAllSuppliers() as any);
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setIsErrorModalOpen(true);
    }
  }, [error]);

  return (
    <PageLayout title="Suppliers">
      {editingSupplierId ? (
        <SupplierDetails 
          supplierId={editingSupplierId} 
          onClose={() => setEditingSupplierId(null)} 
        />
      ) : (
        <Suppliers onClose={() => {setIsErrorModalOpen(false)}} onEdit={setEditingSupplierId} />
      )}

      {/* Error Modal */}
      <ConfirmationModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title="Error"
        message={error || 'An error occurred'}
        isAlert={true}
        okText="OK"
      />
    </PageLayout>
  );
} 