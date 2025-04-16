'use client';

import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import Modal from '@/components/common/Modal'; // Assuming a Modal component exists
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react'; // Import ArrowLeft

interface Category {
  id: number;
  name: string;
  type: 'Recipe' | 'Sub-Recipe';
}

// Mock data for categories
const mockCategories: Category[] = [
  { id: 1, name: 'Main Course - Burgers', type: 'Recipe' },
  { id: 2, name: 'Cold Appetizers', type: 'Recipe' },
  { id: 3, name: 'Hot Appetizers', type: 'Recipe' },
  { id: 4, name: 'Main Course - Meat', type: 'Recipe' },
  { id: 5, name: 'Main Course - Poultry', type: 'Recipe' },
  { id: 6, name: 'Main Course - Seafood', type: 'Recipe' },
  { id: 7, name: 'Soups', type: 'Recipe' },
  { id: 8, name: 'Desserts', type: 'Recipe' },
  { id: 9, name: 'Dressings', type: 'Sub-Recipe' }, // Example sub-recipe category
  { id: 10, name: 'Bases', type: 'Sub-Recipe' },      // Example sub-recipe category
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'Recipe' | 'Sub-Recipe'>('Recipe');

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return; // Basic validation

    const newCategory: Category = {
      id: Date.now(), // Simple ID generation for mock data
      name: newCategoryName.trim(),
      type: newCategoryType,
    };
    setCategories([...categories, newCategory]);
    closeModal();
  };

  const handleDeleteCategory = (id: number) => {
    // TODO: Implement actual delete logic (e.g., API call)
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewCategoryName('');
    setNewCategoryType('Recipe');
  };

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
            <div className="w-40">Category Type</div>
            <div className="w-32 text-right">Actions</div>
          </div>
          
          {/* Rows */}  
          {categories.length > 0 ? (
            categories.map((category) => (
              <div key={category.id} className="flex items-center px-4 py-3 border-b last:border-b-0 hover:bg-gray-50">
                <div className="flex-1 font-medium text-gray-900">{category.name}</div>
                <div className="w-40 text-gray-600">{category.type}</div>
                <div className="w-32 flex justify-end space-x-2">
                  <Button variant="secondary" size="sm">Edit</Button> 
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
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

      {/* New Category Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="New Category">
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
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter Category Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B]"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={closeModal}>Discard</Button>
            <Button onClick={handleAddCategory}>Add</Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
} 