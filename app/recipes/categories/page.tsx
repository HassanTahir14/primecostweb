'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import Modal from '@/components/common/Modal';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Loader from '@/components/common/Loader';
import { 
  fetchAllCategories, 
  addCategory, 
  updateCategory, 
  deleteCategory 
} from '@/store/recipeCategorySlice';
import type { AppDispatch, RootState } from '@/store/store';
import { useTranslation } from '@/context/TranslationContext';

interface Category {
  categoryId: number;
  name: string;
  type: 'Recipe' | 'Sub-Recipe';
}

export default function CategoriesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading, error } = useSelector((state: RootState) => state.recipeCategory);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'Recipe' | 'Sub-Recipe'>('Recipe');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    const categoryData = {
      name: newCategoryName.trim(),
      type: newCategoryType,
    };

    if (editingCategory) {
      await dispatch(updateCategory({
        categoryId: editingCategory.categoryId,
        ...categoryData
      }));
    } else {
      await dispatch(addCategory(categoryData));
    }
    
    closeModal();
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (window.confirm(t('recipes.categories.delete.confirmMessage', { name: editingCategory?.name }))) {
      await dispatch(deleteCategory(categoryId));
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryType(category.type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewCategoryName('');
    setNewCategoryType('Recipe');
    setEditingCategory(null);
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
            {/* <div className="w-40">{t('recipes.categories.categoryType')}</div> */}
            <div className="w-32 text-right">{t('recipes.categories.actions')}</div>
          </div>
          
          {/* Rows */}  
          {categories.length > 0 ? (
            categories.map((category: Category) => (
              <div key={category.categoryId} className="flex items-center px-4 py-3 border-b last:border-b-0 hover:bg-gray-50">
                <div className="flex-1 font-medium text-gray-900">{category.name}</div>
                <div className="w-40 text-gray-600">{category.type}</div>
                <div className="w-32 flex justify-end space-x-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => handleEditCategory(category)}
                  >
                    {t('recipes.categories.edit')}
                  </Button> 
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteCategory(category.categoryId)}
                  >
                    {t('recipes.categories.delete.title')}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              {t('recipes.categories.noCategoriesFound')}
            </div>
          )}
        </div>
      </div>

      {/* Category Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingCategory ? t('recipes.categories.modal.editTitle') : t('recipes.categories.modal.newTitle')}
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
                <span className="ml-2 text-sm text-gray-700">{t('recipes.categories.modal.recipeType')}</span>
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
                <span className="ml-2 text-sm text-gray-700">{t('recipes.categories.modal.subRecipeType')}</span>
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
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder={t('recipes.categories.modal.enterName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B]"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={closeModal}>{t('recipes.categories.modal.discard')}</Button>
            <Button onClick={handleAddCategory}>
              {editingCategory ? t('recipes.categories.modal.update') : t('recipes.categories.modal.add')}
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
} 