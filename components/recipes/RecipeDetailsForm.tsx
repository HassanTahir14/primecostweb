'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/components/common/button';
import { Upload, X } from 'lucide-react';
import { fetchAllCategories } from '@/store/recipeCategorySlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { fetchAllServingSizes } from '@/store/servingSizeSlice';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { getImageUrlWithAuth } from '@/utils/imageUtils';
import AuthImage from '@/components/common/AuthImage';
import Select from '@/components/common/select';

interface RecipeImage {
  id?: number;
  path?: string;
}

interface RecipeDetailsFormProps {
  onNext: (data: any) => void;
  initialData: any;
  isEditMode?: boolean;
}

const generateRecipeCode = () => {
  const prefix = 'RCP';
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${randomNum}`;
};

export default function RecipeDetailsForm({ onNext, initialData, isEditMode = false }: RecipeDetailsFormProps) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    recipeCode: initialData.recipeCode || generateRecipeCode(),
    category: initialData.category || '',
    portions: initialData.portions || '',
    servingSize: initialData.servingSize || '',
    images: initialData.images || [],
    newImages: initialData.newImages || [],
    imageIdsToRemove: initialData.imageIdsToRemove || []
  });
  
  // Initialize images from initialData
  const [existingImages, setExistingImages] = useState<RecipeImage[]>(initialData.images || []);
  const [newImages, setNewImages] = useState<File[]>(initialData.newImages || []);
  const [imageIdsToRemove, setImageIdsToRemove] = useState<number[]>(initialData.imageIdsToRemove || []);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [servingSizeList, setServingSizeList] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log('existingImages', existingImages);
  
  // Modal states
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const dispatch = useDispatch<AppDispatch>();

  // Update the image base URL
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || 'http://212.85.26.46:8082/api/v1/images/view';

  // Update images when initialData changes
  useEffect(() => {
    if (initialData.images) {
      setExistingImages(initialData.images);
    }
    if (initialData.newImages) {
      setNewImages(initialData.newImages);
    }
    if (initialData.imageIdsToRemove) {
      setImageIdsToRemove(initialData.imageIdsToRemove);
    }
  }, [initialData]);

  useEffect(() => {
    dispatch(fetchAllCategories())
      .unwrap()
      .then((res) => {
        setCategoryList(res.recipeCategoryList || []);
      })
      .catch((err) => {
        console.error('Failed to fetch categories:', err);
      });

    dispatch(fetchAllServingSizes())
      .unwrap()
      .then((res) => {
        console.log('Serving sizes response:', res);
        setServingSizeList(res || []);
      })
      .catch((err) => {
        console.error('Failed to fetch serving sizes:', err);
      });
  }, [dispatch]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setNewImages(prev => [...prev, ...files]);
  };

  const handleRemoveExistingImage = (imageId: number | undefined) => {
    console.log('imageId', imageId);
    if (imageId) {
      console.log('imageId', imageId);
      setImageIdsToRemove(prev => [...prev, imageId]);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters long';
    }

    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.portions || isNaN(Number(formData.portions)) || Number(formData.portions) <= 0)
      newErrors.portions = 'Portions must be a positive number';
    if (!formData.servingSize) newErrors.servingSize = 'Serving size is required';
    if (existingImages.length + newImages.length === 0) {
      newErrors.images = 'At least one image is required';
      setErrorMessage('Please upload at least one image before proceeding.');
      setIsErrorModalOpen(true);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext({
        ...formData,
        images: existingImages,
        newImages,
        imageIdsToRemove,
        recipeCode: formData.recipeCode
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Recipe details</h2>
        <div className="flex gap-2">
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
      </div>

      {/* Image Display Section */}
      <div className="space-y-4">
        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2 text-gray-600">Current Images:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {existingImages.map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square bg-gray-100 rounded-lg group"
                >
                  <AuthImage
                    src={getImageUrlWithAuth(img.path || '', imageBaseUrl)}
                    alt={`Recipe image ${img.id}`}
                    className="w-full h-full object-cover rounded-lg"
                    fallbackSrc="/placeholder-image.jpg"
                  />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveExistingImage(img.id)} 
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    aria-label="Remove image"
                  >
                    <X size={14} /> 
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Images */}
        {newImages.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2 text-gray-600">New Images to Upload:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {newImages.map((file, index) => (
                <div
                  key={index}
                  className="relative aspect-square bg-gray-100 rounded-lg group"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`New Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveNewImage(index)} 
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    aria-label="Remove new image"
                  >
                    <X size={14} /> 
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Name</label>
        <input
          type="text"
          placeholder="Enter value"
          className={`w-full p-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B]`}
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Recipe Category</label>
        <Select
          label=""
          options={categoryList.map((cat: any) => ({
            label: cat.name,
            value: cat.categoryId.toString()
          }))}
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
        />
        {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">No. of Portions</label>
        <input
          type="number"
          placeholder="Enter value"
          className={`w-full p-3 border ${errors.portions ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B]`}
          value={formData.portions}
          onChange={(e) => setFormData(prev => ({ ...prev, portions: e.target.value }))}
        />
        {errors.portions && <p className="text-red-500 text-sm">{errors.portions}</p>}
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Serving Size</label>
        <Select
          label=""
          options={servingSizeList.map((size: any) => ({
            label: size.name,
            value: size.servingSizeId.toString()
          }))}
          value={formData.servingSize}
          onChange={(e) => setFormData(prev => ({ ...prev, servingSize: e.target.value }))}
      
        />
        {errors.servingSize && <p className="text-red-500 text-sm">{errors.servingSize}</p>}
      </div>

      <div className="flex justify-end mt-8">
        <Button size="lg" onClick={handleSubmit}>Next</Button>
      </div>

      {/* Error Modal */}
      <ConfirmationModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title="Error"
        message={errorMessage}
        isAlert={true}
        okText="OK"
      />
    </div>
  );
}