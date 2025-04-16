'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/common/button';
import { Upload } from 'lucide-react';

interface RecipeDetailsFormProps {
  onNext: (data: any) => void;
  initialData: any;
}

export default function RecipeDetailsForm({ onNext, initialData }: RecipeDetailsFormProps) {
  const [name, setName] = useState(initialData.name || '');
  const [category, setCategory] = useState(initialData.category || '');
  const [portions, setPortions] = useState(initialData.portions || '');
  const [servingSize, setServingSize] = useState(initialData.servingSize || '');

  // Mock data for selects - replace with actual data fetching
  const categories = ['Main Course', 'Appetizer', 'Dessert', 'Side Dish'];
  const servingSizes = ['Small', 'Medium', 'Large'];

  const handleNextClick = () => {
    onNext({ name, category, portions, servingSize });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Recipe details</h2>
        <Button variant="secondary">
          <Upload className="w-4 h-4 mr-2" />
          Upload Image
        </Button>
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Name</label>
        <input
          type="text"
          placeholder="Enter value"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B]"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Recipe Category</label>
        <select
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B] appearance-none bg-white"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="" disabled>Select Option</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">No. of Portions</label>
        <input
          type="number"
          placeholder="Enter value"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B]"
          value={portions}
          onChange={(e) => setPortions(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Serving Size</label>
        <select
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B] appearance-none bg-white"
          value={servingSize}
          onChange={(e) => setServingSize(e.target.value)}
        >
          <option value="" disabled>Select Serving Size</option>
          {servingSizes.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end mt-8">
        <Button onClick={handleNextClick}>Next</Button>
      </div>
    </div>
  );
} 