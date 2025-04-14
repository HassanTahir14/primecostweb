'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CreateCategoryModal } from './CreateCategoryModal';
import Modal from './ui/Modal';
import Input from './ui/input';
import Button from './ui/button';

interface Category {
  id: string;
  name: string;
}

export default function Categories({ onClose }: { onClose: () => void }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Vegetables' },
    { id: '2', name: 'Meat' },
    { id: '3', name: 'Poultry' },
    { id: '4', name: 'Seafood' },
    { id: '5', name: 'Bread' },
    { id: '6', name: 'Diary' },
    { id: '7', name: 'Spices' },
    { id: '8', name: 'Sauces' },
  ]);

  const handleAddCategory = (categoryName: string) => {
    const newCategory = {
      id: Math.random().toString(36).substring(2, 9),
      name: categoryName,
    };
    setCategories([...categories, newCategory]);
  };

  const handleEditCategory = (id: string, newName: string) => {
    setCategories(
      categories.map(category => 
        category.id === id ? { ...category, name: newName } : category
      )
    );
    setIsEditModalOpen(false);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(category => category.id !== id));
  };

  const openEditModal = (category: Category) => {
    setCurrentCategory(category);
    setEditCategoryName(category.name);
    setIsEditModalOpen(true);
  };

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
              key={category.id} 
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
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Category Modal */}
      <CreateCategoryModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAddCategory={handleAddCategory}
      />

      {/* Edit Category Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Category"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          if (currentCategory && editCategoryName.trim()) {
            handleEditCategory(currentCategory.id, editCategoryName);
          }
        }} className="w-full">
          <div className="mb-4 sm:mb-6">
            <label className="block text-gray-700 mb-2 text-sm sm:text-base">Category Name</label>
            <Input
              type="text"
              value={editCategoryName}
              onChange={(e) => setEditCategoryName(e.target.value)}
              placeholder="Enter Category Name"
              className="w-full bg-white text-sm sm:text-base"
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
    </div>
  );
} 