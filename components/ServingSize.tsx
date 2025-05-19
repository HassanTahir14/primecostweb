'use client';

import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/common/button';
import Modal from './common/Modal';
import Input from './common/input';
import Select from './common/select';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store/store';
import api from '@/store/api';
import {
  fetchAllServingSizes,
  addServingSize,
  updateServingSize,
  deleteServingSize,
  selectAllServingSizes,
  selectServingSizeStatus,
  selectServingSizeError
} from '@/store/servingSizeSlice';
import ConfirmationModal from './common/ConfirmationModal';
import { useTranslation } from '@/context/TranslationContext';

interface UnitOfMeasurement {
  unitOfMeasurementId: number;
  unitName: string; // e.g., 'BLK', 'ORD', etc.
  unitDescription: string;
  createdAt: string;
  updatedAt: string | null;
}

interface ServingSize {
  servingSizeId: number;
  name: string;
  unitOfMeasurementId?: number;
  unitOfMeasurement?: string;
}

const UNITS_OPTIONS = [
  { label: "KG", value: "kg" },
  { label: "Grams", value: "grams" },
  { label: "Pieces", value: "pieces" },
  { label: "Liters", value: "liters" },
  { label: "ML", value: "ml" },
];


export default function ServingSize({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const servingSizes = useSelector(selectAllServingSizes);
  const isLoading = useSelector(selectServingSizeStatus);
  const error = useSelector(selectServingSizeError);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentServingSize, setCurrentServingSize] = useState<ServingSize | null>(null);
  const [servingSizeName, setServingSizeName] = useState('');
  const [servingSizeUnit, setServingSizeUnit] = useState('');
  const [nameError, setNameError] = useState('');
  const [unitError, setUnitError] = useState('');
  const [unitsOfMeasurement, setUnitsOfMeasurement] = useState<UnitOfMeasurement[]>([]);

  // Confirmation modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedServingSize, setSelectedServingSize] = useState<ServingSize | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    api.get('/units-of-measurement/all').then((response:any) => {
      if (response.data?.unitsOfMeasurement) {
        setUnitsOfMeasurement(response.data.unitsOfMeasurement);
      }
    }).catch((error:any) => {
      setErrorMessage('Failed to load units of measurement');
      setIsErrorModalOpen(true);
    });
  }, []);

  // Transform units of measurement for the select component
  const unitOptions = useMemo(() => 
    unitsOfMeasurement.map(unit => ({
      label: unit.unitName,
      value: unit.unitOfMeasurementId.toString()
    })), [unitsOfMeasurement]
  );

  useEffect(() => {
    fetchServingSizes();
  }, [dispatch]);

  const fetchServingSizes = async () => {
    try {
      const result = await dispatch(fetchAllServingSizes()).unwrap();
      console.log('Serving sizes response:', result);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to fetch serving sizes');
      setIsErrorModalOpen(true);
    }
  };

  const validateForm = () => {
    let isValid = true;
    
    if (!servingSizeName.trim()) {
      setNameError('Name is required');
      isValid = false;
    } else {
      setNameError('');
    }
    
    if (!servingSizeUnit) {
      setUnitError('Unit is required');
      isValid = false;
    } else {
      setUnitError('');
    }
    
    return isValid;
  };

  const handleAddServingSize = async (name: string, unit: string) => {
    if (!validateForm()) return;
    
    try {
      const servingSizeData = {
        name: name.trim(),
        unitOfMeasurementId: parseInt(unit)
      };

      if (currentServingSize) {
        await dispatch(updateServingSize({
          ...servingSizeData,
          servingSizeId: currentServingSize?.servingSizeId
        })).unwrap();
        setSuccessMessage('Serving size updated successfully!');
      } else {
        await dispatch(addServingSize(servingSizeData)).unwrap();
        setSuccessMessage('Serving size added successfully!');
      }
      
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setIsSuccessModalOpen(true);
      resetForm();
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to save serving size');
      setIsErrorModalOpen(true);
    }
  };

  const handleDeleteClick = (servingSize: ServingSize) => {
    setSelectedServingSize(servingSize);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedServingSize) return;
    
    try {
      await dispatch(deleteServingSize({ servingSizeId: selectedServingSize?.servingSizeId })).unwrap();
      setIsDeleteModalOpen(false);
      setSuccessMessage('Serving size deleted successfully!');
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to delete serving size');
      setIsDeleteModalOpen(false);
      setIsErrorModalOpen(true);
    }
  };

  const openEditModal = (servingSize: any) => {
    setCurrentServingSize(servingSize);
    setServingSizeName(servingSize.name);

    // Find the correct unitOfMeasurementId for the select
    let unitId = '';
    if (servingSize.unitOfMeasurementId) {
      unitId = servingSize.unitOfMeasurementId.toString();
    } else if (servingSize.unitOfMeasurement) {
      const found = unitsOfMeasurement.find(
        u => u.unitName === servingSize.unitOfMeasurement
      );
      if (found) unitId = found.unitOfMeasurementId.toString();
    }
    setServingSizeUnit(unitId);

    setNameError('');
    setUnitError('');
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setServingSizeName('');
    setServingSizeUnit('');
    setNameError('');
    setUnitError('');
    setCurrentServingSize(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f1fff7] min-h-screen px-3 py-3 sm:px-4 md:px-8 sm:py-4 md:py-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">{t('servingSize.title')}</h1>
        </div>

        <Button 
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
          className="rounded-full bg-[#339A89] text-white text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
          disabled={isLoading}
        >
          {t('servingSize.createNew')}
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex-1">
        <div className="grid grid-cols-3 border-b pb-3 sm:pb-4 mb-3 sm:mb-4">
          <h2 className="text-gray-500 text-xs sm:text-sm">{t('servingSize.name')}</h2>
          <h2 className="text-gray-500 text-xs sm:text-sm">{t('servingSize.unit')}</h2>
          <h2 className="text-gray-500 text-xs sm:text-sm text-right">{t('common.action')}</h2>
        </div>

        {isLoading && servingSizes.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">{t('servingSize.loading')}</p>
          </div>
        ) : servingSizes.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">{t('servingSize.noServingSizes')}</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {servingSizes?.map((size) => (
              <div 
                key={size?.servingSizeId} 
                className="grid grid-cols-3 items-center py-3 sm:py-4 border-b"
              >
                <span className="text-gray-800 text-sm sm:text-base">{size?.name || ''}</span>
                <span className="text-gray-800 text-sm sm:text-base">
                  {size?.unitOfMeasurement || unitsOfMeasurement.find(u => u.unitOfMeasurementId === size?.unitOfMeasurementId)?.unitName || ''}
                </span>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="rounded-full bg-[#339A89] text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                    onClick={() => openEditModal(size as any)}
                    disabled={isLoading}
                  >
                    {t('common.edit')}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="rounded-full bg-red-500 text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                    onClick={() => handleDeleteClick(size as any)}
                    disabled={isLoading}
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Serving Size Modal */}
      <Modal 
        isOpen={isCreateModalOpen}
        onClose={() => !isLoading && setIsCreateModalOpen(false)}
        title={t('servingSize.newServingSize')}
        size="sm"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          handleAddServingSize(servingSizeName, servingSizeUnit);
        }} className="w-full">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">{t('servingSize.name')}</label>
            <Input
              type="text"
              value={servingSizeName}
              onChange={(e) => {
                setServingSizeName(e.target.value);
                if (e.target.value.trim()) setNameError('');
              }}
              placeholder={t('servingSize.namePlaceholder')}
              className={`w-full bg-white ${nameError ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {nameError && <span className="text-red-500 text-xs">{t('servingSize.nameRequired')}</span>}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">{t('servingSize.unit')}</label>
            <Select
              value={servingSizeUnit}
              onChange={(e) => {
                setServingSizeUnit(e.target.value);
                if (e.target.value) setUnitError('');
              }}
              options={unitOptions}
              className={`w-full bg-white ${unitError ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {unitError && <span className="text-red-500 text-xs">{t('servingSize.unitRequired')}</span>}
          </div>
          
          <div className="flex justify-between gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => !isLoading && setIsCreateModalOpen(false)}
              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 sm:px-6"
              disabled={isLoading}
            >
              {t('common.discard')}
            </Button>
            
            <Button
              type="submit"
              className="bg-[#339A89] text-white hover:bg-[#2b8274] px-4 sm:px-6"
              disabled={isLoading}
            >
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Serving Size Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => !isLoading && setIsEditModalOpen(false)}
        title={t('servingSize.editServingSize')}
        size="sm"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          if (currentServingSize) {
            handleAddServingSize(servingSizeName, servingSizeUnit);
          }
        }} className="w-full">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">{t('servingSize.name')}</label>
            <Input
              type="text"
              value={servingSizeName}
              onChange={(e) => {
                setServingSizeName(e.target.value);
                if (e.target.value.trim()) setNameError('');
              }}
              placeholder={t('servingSize.namePlaceholder')}
              className={`w-full bg-white ${nameError ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {nameError && <span className="text-red-500 text-xs">{t('servingSize.nameRequired')}</span>}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">{t('servingSize.unit')}</label>
            <Select
              value={servingSizeUnit}
              onChange={(e) => {
                setServingSizeUnit(e.target.value);
                if (e.target.value) setUnitError('');
              }}
              options={unitOptions}
              className={`w-full bg-white ${unitError ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {unitError && <span className="text-red-500 text-xs">{t('servingSize.unitRequired')}</span>}
          </div>
          
          <div className="flex justify-between gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => !isLoading && setIsEditModalOpen(false)}
              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 sm:px-6"
              disabled={isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              className="bg-[#339A89] text-white hover:bg-[#2b8274] px-4 sm:px-6"
              disabled={isLoading}
            >
              {t('common.update')}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t('servingSize.deleteTitle')}
        message={t('servingSize.deleteMessage')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />

      <ConfirmationModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          window.location.reload();
        }}
        title={t('common.success')}
        message={successMessage}
        isAlert={true}
        okText={t('common.ok')}
      />

      <ConfirmationModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title={t('common.error')}
        message={errorMessage}
        isAlert={true}
        okText={t('common.ok')}
      />
    </div>
  );
}