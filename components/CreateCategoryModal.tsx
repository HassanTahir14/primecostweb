'use client';

import { useState } from 'react';
import Input from './common/input';
import Button from './common/button';
import Modal from './common/Modal';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (name: string) => void;
}

export function CreateCategoryModal({ isOpen, onClose, onAddCategory }: CreateCategoryModalProps) {
  const [categoryName, setCategoryName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryName.trim()) {
      onAddCategory(categoryName);
      setCategoryName('');
    }
  };

  const handleClose = () => {
    setCategoryName('');
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title="New Category"
    >
      <form onSubmit={handleSubmit} className="w-full">
        <div className="mb-4 sm:mb-6">
          <label className="block text-gray-700 mb-2 text-sm sm:text-base">Category Name</label>
          <Input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Enter Category Name"
            className="w-full bg-white text-sm sm:text-base"
          />
        </div>
        
        <div className="flex justify-between gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs sm:text-sm py-2 px-3 sm:px-4"
          >
            Discard
          </Button>
          
          <Button
            type="submit"
            className="bg-[#339A89] text-white hover:bg-[#2b8274] text-xs sm:text-sm py-2 px-3 sm:px-4"
          >
            ADD
          </Button>
        </div>
      </form>
    </Modal>
  );
} 