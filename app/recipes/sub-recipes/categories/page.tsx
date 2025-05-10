'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import Modal from '@/components/common/Modal';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { 
  fetchAllCategories, 
  addCategory, 
  updateCategory, 
  deleteCategory 
} from '@/store/subRecipeCategorySlice';
import type { AppDispatch, RootState } from '@/store/store';
import Loader from '@/components/common/Loader';
import { useTranslation } from '@/context/TranslationContext';

interface Category {
  subRecipeCategoryId: number;
  name: string;
  type: 'Recipe' | 'Sub-Recipe';
}

export default function CategoriesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const { subRecipeCategories, loading, error } = useSelector((state: RootState) => state.subRecipeCategory);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'Recipe' | 'Sub-Recipe'>('Recipe');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formError, setFormError] = useState('');
  
  // Confirmation modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadCategories();
  }, [dispatch]);

  const loadCategories = async () => {
    try {
      await dispatch(fetchAllCategories()).unwrap();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load categories');
      setIsErrorModalOpen(true);
    }
  };

  const validateForm = () => {
    if (!newCategoryName.trim()) {
      setFormError('Category name is required');
      return false;
    }
    if (newCategoryName.length < 3) {
      setFormError('Category name must be at least 3 characters long');
      return false;
    }
    setFormError('');
    return true;
  };

  const handleAddCategory = async () => {
    if (!validateForm()) return;

    const categoryData = {
      name: newCategoryName.trim(),
      type: newCategoryType,
    };

    try {
      if (editingCategory) {
        await dispatch(updateCategory({
          subRecipeCategoryId: editingCategory.subRecipeCategoryId,
          ...categoryData
        })).unwrap();
        setSuccessMessage(t('recipes.categories.delete.success'));
      } else {
        await dispatch(addCategory(categoryData)).unwrap();
        setSuccessMessage(t('recipes.categories.delete.success'));
      }
      closeModal();
      setIsSuccessModalOpen(true);
      loadCategories();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save category');
      setIsErrorModalOpen(true);
    }
  };

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;

    try {
      await dispatch(deleteCategory({ subRecipeCategoryId: selectedCategory.subRecipeCategoryId })).unwrap();
      setIsDeleteModalOpen(false);
      setSuccessMessage(t('recipes.categories.delete.success'));
      setIsSuccessModalOpen(true);
      loadCategories();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete category');
      setIsDeleteModalOpen(false);
      setIsErrorModalOpen(true);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryType(category.type);
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewCategoryName('');
    setNewCategoryType('Recipe');
    setEditingCategory(null);
    setFormError('');
  };

  if (loading) {
    return (
      <PageLayout title={t('recipes.categories.title')}>
        <div className="flex justify-center items-center h-64">
          <Loader size="medium" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <PageLayout title={t('recipes.categories.title')}>
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {/* Back link and Title/Create Button */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
             <Link href="/recipes" className="text-gray-500 hover:text-gray-700">
               <ArrowLeft size={24} />
             </Link>
             <h1 className="text-3xl font-semibold text-gray-900">{t('recipes.categories.title')}</h1>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>{t('recipes.categories.createNew')}</Button>
        </div>

        {/* Category List */}
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 border-b">
            <div className="flex-1">{t('recipes.categories.categoryName')}</div>
            <div className="w-40">{t('recipes.categories.categoryType')}</div>
            <div className="w-32 text-right">{t('recipes.categories.actions')}</div>
          </div>
          
          {/* Rows */}  
          {subRecipeCategories?.length > 0 ? (
            subRecipeCategories?.map((category: Category) => (
              <div key={category.subRecipeCategoryId} className="flex items-center px-4 py-3 border-b last:border-b-0 hover:bg-gray-50">
                <div className="flex-1 font-medium text-gray-900">{category.name}</div>
                <div className="w-40 text-gray-600">{category.type}</div>
                <div className="w-32 flex justify-end space-x-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => handleEditCategory(category)}
                  >
                    {t('common.edit')}
                  </Button> 
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteClick(category)}
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              {t('recipes.categories.noCategories')}
            </div>
          )}
        </div>
      </div>

      {/* Category Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingCategory ? t('recipes.categories.modal.editTitle') : t('recipes.categories.modal.title')}
      >
        <div className="space-y-4 p-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">{t('recipes.categories.categoryType')}</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  name="categoryType" 
                  value="Recipe"
                  checked={newCategoryType === 'Recipe'}
                  onChange={() => setNewCategoryType('Recipe')} 
                  className="form-radio h-4 w-4 text-[#00997B] focus:ring-[#00997B] border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Recipe</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  name="categoryType" 
                  value="Sub-Recipe"
                  checked={newCategoryType === 'Sub-Recipe'}
                  onChange={() => setNewCategoryType('Sub-Recipe')} 
                  className="form-radio h-4 w-4 text-[#00997B] focus:ring-[#00997B] border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Sub-Recipe</span>
              </label>
            </div>
          </div>
          <div>
            <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
              {t('recipes.categories.categoryName')}
            </label>
            <input
              type="text"
              id="categoryName"
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                setFormError('');
              }}
              placeholder={t('recipes.categories.modal.enterName')}
              className={`w-full px-3 py-2 border ${formError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B]`}
            />
            {formError && (
              <p className="mt-1 text-sm text-red-500">{formError}</p>
            )}
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={closeModal}>{t('recipes.categories.modal.discard')}</Button>
            <Button onClick={handleAddCategory}>
              {editingCategory ? t('recipes.categories.modal.update') : t('recipes.categories.modal.add')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t('recipes.categories.delete.title')}
        message={t('recipes.categories.delete.confirmMessage', { name: selectedCategory?.name || '' })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />

      {/* Success Modal */}
      <ConfirmationModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={t('common.success')}
        message={successMessage}
        isAlert={true}
        okText={t('common.ok')}
      />

      {/* Error Modal */}
      <ConfirmationModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title={t('common.error')}
        message={errorMessage}
        isAlert={true}
        okText={t('common.ok')}
      />
    </PageLayout>
  );
} 