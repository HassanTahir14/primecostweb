'use client';

import { useState } from 'react';
import Input from './ui/input';
import Button from './ui/button';
import Modal from './ui/Modal';

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
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Category Name</label>
          <Input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Enter Category Name"
            className="w-full bg-white"
          />
        </div>
        
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            Discard
          </Button>
          
          <Button
            type="submit"
            className="bg-[#339A89] text-white hover:bg-[#2b8274]"
          >
            ADD
          </Button>
        </div>
      </form>
    </Modal>
  );
} 