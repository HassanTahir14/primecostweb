'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft } from 'lucide-react';
import { CreateCategoryModal } from './CreateCategoryModal';
import Modal from './common/Modal';
import Input from './common/input';
import Button from './common/button';
import ConfirmationModal from './common/ConfirmationModal';
import { 
  fetchAllCategories, 
  addCategory, 
  updateCategory, 
  deleteCategory,
  selectAllCategories,
  selectCategoryStatus,
  selectCategoryError,
  clearError
} from '@/store/itemCategorySlice';
import { AppDispatch } from '@/store/store';
import Loader from './common/Loader';
import { useTranslation } from '@/context/TranslationContext';

interface Category {
  categoryId: number;
  name: string;
}

export default function Categories({ onClose }: { onClose: () => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const categories = useSelector(selectAllCategories);
  const loading = useSelector(selectCategoryStatus);
  const error = useSelector(selectCategoryError);
  const { t } = useTranslation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageModalContent, setMessageModalContent] = useState({ title: '', message: '' });
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      handleShowMessage(t('categories.errorTitle'), typeof error === 'string' ? error : t('categories.errorFetch'));
    }
  }, [error]);

  const handleShowMessage = (title: string, message: string) => {
    setMessageModalContent({ title, message });
    setIsMessageModalOpen(true);
  };

  const handleAddCategory = async (categoryName: string) => {
    if (!categoryName.trim()) {
      handleShowMessage(t('categories.validationTitle'), t('categories.validationEmpty'));
      return;
    }
    try {
      const resultAction = await dispatch(addCategory({ name: categoryName }));
      if (addCategory.fulfilled.match(resultAction)) {
        handleShowMessage(t('categories.successTitle'), resultAction.payload.message || t('categories.successAdd'));
        dispatch(fetchAllCategories());
        setIsCreateModalOpen(false);
      } else if (addCategory.rejected.match(resultAction)) {
        const errorMsg = typeof resultAction.payload === 'string' ? resultAction.payload : (resultAction.payload as any)?.message || t('categories.errorAdd');
        handleShowMessage(t('categories.errorTitle'), errorMsg);
      }
    } finally {
    }
  };

  const handleEditCategory = async (categoryId: number, newName: string) => {
    if (!newName.trim()) {
      handleShowMessage(t('categories.validationTitle'), t('categories.validationEmpty'));
      return;
    }
    try {
      const resultAction = await dispatch(updateCategory({ categoryId, name: newName }));
      if (updateCategory.fulfilled.match(resultAction)) {
        handleShowMessage(t('categories.successTitle'), resultAction.payload.message || t('categories.successUpdate'));
        dispatch(fetchAllCategories());
        setIsEditModalOpen(false);
      } else if (updateCategory.rejected.match(resultAction)) {
        const errorMsg = typeof resultAction.payload === 'string' ? resultAction.payload : (resultAction.payload as any)?.message || t('categories.errorUpdate');
        handleShowMessage(t('categories.errorTitle'), errorMsg);
      }
    } finally {
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      const resultAction = await dispatch(deleteCategory(categoryId));
      if (deleteCategory.fulfilled.match(resultAction)) {
        handleShowMessage(t('categories.successTitle'), resultAction.payload.message || t('categories.successDelete'));
      } else if (deleteCategory.rejected.match(resultAction)) {
        const errorMsg = typeof resultAction.payload === 'string' ? resultAction.payload : (resultAction.payload as any)?.message || t('categories.errorDelete');
        handleShowMessage(t('categories.errorTitle'), errorMsg);
      }
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const openEditModal = (category: Category) => {
    setCurrentCategory(category);
    setEditCategoryName(category.name);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (category: Category) => {
    setCurrentCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleMessageModalClose = () => {
    setIsMessageModalOpen(false);
    if (messageModalContent.title !== t('categories.validationTitle') && !isEditModalOpen && !isCreateModalOpen) {
        dispatch(clearError());
    }
  };

  if (loading && !isEditModalOpen && !isCreateModalOpen && !isDeleteModalOpen && !isMessageModalOpen) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader size="medium" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#f1fff7] min-h-screen px-3 py-3 sm:px-4 md:px-8 sm:py-4 md:py-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">{t('categories.title')}</h1>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-full bg-[#339A89] text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
        >
          {t('categories.createNew')}
        </Button>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex-1">
        <div className="border-b pb-3 sm:pb-4 mb-3 sm:mb-4">
          <h2 className="text-gray-500 text-xs sm:text-sm">{t('categories.categoryName')}</h2>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {categories.map((category) => (
            <div 
              key={category.categoryId} 
              className="flex items-center justify-between py-3 sm:py-4 border-b"
            >
              <span className="text-gray-800 text-sm sm:text-base">{category.name}</span>
              <div className="flex gap-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="rounded-full bg-[#339A89] text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                  onClick={() => openEditModal(category)}
                >
                  {t('categories.edit')}
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="rounded-full bg-red-500 text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                  onClick={() => openDeleteModal(category)}
                >
                  {t('categories.delete')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <CreateCategoryModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAddCategory={handleAddCategory}
      />
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('categories.editCategory')}
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          if (currentCategory) {
            handleEditCategory(currentCategory.categoryId, editCategoryName);
          }
        }} className="w-full">
          <div className="mb-4 sm:mb-6">
            <label className="block text-gray-700 mb-2 text-sm sm:text-base">{t('categories.categoryNameRequired')}</label>
            <Input
              type="text"
              value={editCategoryName}
              onChange={(e) => setEditCategoryName(e.target.value)}
              placeholder={t('categories.categoryNamePlaceholder')}
              className="w-full bg-white text-sm sm:text-base"
              required
            />
          </div>
          <div className="flex justify-between gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs sm:text-sm py-2 px-3 sm:px-4"
            >
              {t('categories.cancel')}
            </Button>
            <Button
              type="submit"
              className="bg-[#339A89] text-white hover:bg-[#2b8274] text-xs sm:text-sm py-2 px-3 sm:px-4"
            >
              {t('categories.update')}
            </Button>
          </div>
        </form>
      </Modal>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => currentCategory && handleDeleteCategory(currentCategory.categoryId)}
        title={t('categories.deleteCategory')}
        message={t('categories.deleteConfirm', { name: currentCategory?.name })}
        confirmText={t('categories.delete')}
        cancelText={t('categories.cancel')}
      />
      <ConfirmationModal
        isOpen={isMessageModalOpen}
        onClose={handleMessageModalClose}
        title={messageModalContent.title}
        message={messageModalContent.message}
        isAlert={true}
        okText={t('common.ok')}
      />
    </div>
  );
}