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

interface Category {
  subRecipeCategoryId: number;
  name: string;
  type: 'Recipe' | 'Sub-Recipe';
}

export default function CategoriesPage() {
  const dispatch = useDispatch<AppDispatch>();
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
        setSuccessMessage('Category updated successfully!');
      } else {
        await dispatch(addCategory(categoryData)).unwrap();
        setSuccessMessage('Category created successfully!');
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
      setSuccessMessage('Category deleted successfully!');
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
      <PageLayout title="Recipe Categories">
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
    <PageLayout title="Recipe Categories">
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {/* Back link and Title/Create Button */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
             <Link href="/recipes" className="text-gray-500 hover:text-gray-700">
               <ArrowLeft size={24} />
             </Link>
             <h1 className="text-3xl font-semibold text-gray-900">Categories</h1>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>Create New</Button>
        </div>

        {/* Category List */}
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 border-b">
            <div className="flex-1">Category Name</div>
            {/* <div className="w-40">Category Type</div> */}
            <div className="w-32 text-right">Actions</div>
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
                    Edit
                  </Button> 
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteClick(category)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              No categories found.
            </div>
          )}
        </div>
      </div>

      {/* Category Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingCategory ? "Edit Category" : "New Category"}
      >
        <div className="space-y-4 p-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Recipe Category Type</label>
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
              Category Name
            </label>
            <input
              type="text"
              id="categoryName"
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                setFormError('');
              }}
              placeholder="Enter Category Name"
              className={`w-full px-3 py-2 border ${formError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B]`}
            />
            {formError && (
              <p className="mt-1 text-sm text-red-500">{formError}</p>
            )}
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={closeModal}>Discard</Button>
            <Button onClick={handleAddCategory}>
              {editingCategory ? 'Update' : 'Add'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={`Are you sure you want to delete ${selectedCategory?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Success Modal */}
      <ConfirmationModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Success"
        message={successMessage}
        isAlert={true}
        okText="OK"
      />

      {/* Error Modal */}
      <ConfirmationModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title="Error"
        message={errorMessage}
        isAlert={true}
        okText="OK"
      />
    </PageLayout>
  );
} 