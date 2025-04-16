'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/components/common/button';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

interface RecipeDetailsFormProps {
  onNext: (data: any) => void;
  initialData: any;
}

export default function RecipeDetailsForm({ onNext, initialData }: RecipeDetailsFormProps) {
  const [name, setName] = useState(initialData.name || '');
  const [recipeCode, setRecipeCode] = useState(initialData.recipeCode || '');
  const [category, setCategory] = useState(initialData.category || '');
  const [portions, setPortions] = useState(initialData.portions || '');
  const [servingSize, setServingSize] = useState(initialData.servingSize || '');
  const [images, setImages] = useState<File[]>(initialData.images || []);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data for selects - replace with actual data fetching
  const categories = ['Main Course', 'Appetizer', 'Dessert', 'Side Dish'];
  const servingSizes = ['Small', 'Medium', 'Large'];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    // Create preview URLs for existing images
    const urls = images.map(image => URL.createObjectURL(image));
    setImagePreviewUrls(urls);

    // Cleanup function to revoke object URLs
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [images, isMounted]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImages = Array.from(files);
      setImages(prevImages => [...prevImages, ...newImages]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
    setImagePreviewUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
  };

  const handleNextClick = () => {
    onNext({ 
      name, 
      recipeCode,
      category, 
      portions, 
      servingSize,
      images 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Recipe details</h2>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
        />
        <Button 
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Image
        </Button>
      </div>

      {/* Image Preview Section */}
      {isMounted && imagePreviewUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {imagePreviewUrls.map((url, index) => (
            <div key={index} className="relative">
              <div className="aspect-square relative rounded-lg overflow-hidden">
                <Image
                  src={url}
                  alt={`Recipe image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

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
        <label className="block text-gray-700 font-medium mb-2">Recipe Code</label>
        <input
          type="text"
          placeholder="Enter recipe code"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B]"
          value={recipeCode}
          onChange={(e) => setRecipeCode(e.target.value)}
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
        <Button size="lg" onClick={handleNextClick}>Next</Button>
      </div>
    </div>
  );
} 