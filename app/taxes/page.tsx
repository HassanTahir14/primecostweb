'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from '@/context/TranslationContext';
import PageLayout from '@/components/PageLayout';
import Taxes from '@/components/Taxes';
import { fetchAllTaxes, clearError } from '@/store/taxSlice';
import type { RootState } from '@/store/store';
import ConfirmationModal from '@/components/common/ConfirmationModal';

export default function TaxesPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { error } = useSelector((state: RootState) => state.tax);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAllTaxes() as any);
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setIsErrorModalOpen(true);
    }
  }, [error]);

  const handleCloseErrorModal = () => {
    setIsErrorModalOpen(false);
    dispatch(clearError());
  };

  return (
    <PageLayout title={t('taxes.title')}>
      <Taxes onClose={() => {}} />
      
      {/* Error Modal */}
      <ConfirmationModal
        isOpen={isErrorModalOpen}
        onClose={handleCloseErrorModal}
        title={t('common.error')}
        message={error || t('taxes.errorOccurred')}
        isAlert={true}
        okText={t('common.ok')}
      />
    </PageLayout>
  );
}