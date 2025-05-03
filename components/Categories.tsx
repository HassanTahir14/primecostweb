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
interface Category {
  categoryId: number;
  name: string;
}

export default function Categories({ onClose }: { onClose: () => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const categories = useSelector(selectAllCategories);
  const loading = useSelector(selectCategoryStatus);
  const error = useSelector(selectCategoryError);

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
      handleShowMessage('Error', typeof error === 'string' ? error : 'An error occurred while fetching categories.');
    }
  }, [error]);

  const handleShowMessage = (title: string, message: string) => {
    setMessageModalContent({ title, message });
    setIsMessageModalOpen(true);
  };

  const handleAddCategory = async (categoryName: string) => {
    if (!categoryName.trim()) {
      handleShowMessage('Validation Error', 'Category name cannot be empty.');
      return;
    }
    try {
      const resultAction = await dispatch(addCategory({ name: categoryName }));
      if (addCategory.fulfilled.match(resultAction)) {
        handleShowMessage('Success', resultAction.payload.message || 'Category added successfully');
        dispatch(fetchAllCategories());
        setIsCreateModalOpen(false);
      } else if (addCategory.rejected.match(resultAction)) {
        const errorMsg = typeof resultAction.payload === 'string' ? resultAction.payload : (resultAction.payload as any)?.message || 'Failed to add category';
        handleShowMessage('Error', errorMsg);
      }
    } finally {
    }
  };

  const handleEditCategory = async (categoryId: number, newName: string) => {
    if (!newName.trim()) {
      handleShowMessage('Validation Error', 'Category name cannot be empty.');
      return;
    }
    try {
      const resultAction = await dispatch(updateCategory({ categoryId, name: newName }));
      if (updateCategory.fulfilled.match(resultAction)) {
        handleShowMessage('Success', resultAction.payload.message || 'Category updated successfully');
        dispatch(fetchAllCategories());
        setIsEditModalOpen(false);
      } else if (updateCategory.rejected.match(resultAction)) {
        const errorMsg = typeof resultAction.payload === 'string' ? resultAction.payload : (resultAction.payload as any)?.message || 'Failed to update category';
        handleShowMessage('Error', errorMsg);
      }
    } finally {
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      const resultAction = await dispatch(deleteCategory(categoryId));
      if (deleteCategory.fulfilled.match(resultAction)) {
        handleShowMessage('Success', resultAction.payload.message || 'Category deleted successfully');
      } else if (deleteCategory.rejected.match(resultAction)) {
        const errorMsg = typeof resultAction.payload === 'string' ? resultAction.payload : (resultAction.payload as any)?.message || 'Failed to delete category';
        handleShowMessage('Error', errorMsg);
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
    if (messageModalContent.title !== 'Validation Error' && !isEditModalOpen && !isCreateModalOpen) {
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
          <h1 className="text-xl sm:text-2xl font-bold">Categories</h1>
        </div>

        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-full bg-[#339A89] text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
        >
          Create New
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex-1">
        <div className="border-b pb-3 sm:pb-4 mb-3 sm:mb-4">
          <h2 className="text-gray-500 text-xs sm:text-sm">Category Name</h2>
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
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="rounded-full bg-red-500 text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                  onClick={() => openDeleteModal(category)}
                >
                  Delete
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
        title="Edit Category"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          if (currentCategory) {
            handleEditCategory(currentCategory.categoryId, editCategoryName);
          }
        }} className="w-full">
          <div className="mb-4 sm:mb-6">
            <label className="block text-gray-700 mb-2 text-sm sm:text-base">Category Name *</label>
            <Input
              type="text"
              value={editCategoryName}
              onChange={(e) => setEditCategoryName(e.target.value)}
              placeholder="Enter Category Name"
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
              Cancel
            </Button>
            
            <Button
              type="submit"
              className="bg-[#339A89] text-white hover:bg-[#2b8274] text-xs sm:text-sm py-2 px-3 sm:px-4"
            >
              Update
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => currentCategory && handleDeleteCategory(currentCategory.categoryId)}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${currentCategory?.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      <ConfirmationModal
        isOpen={isMessageModalOpen}
        onClose={handleMessageModalClose}
        title={messageModalContent.title}
        message={messageModalContent.message}
        isAlert={true}
        okText="OK"
      />
    </div>
  );
} 