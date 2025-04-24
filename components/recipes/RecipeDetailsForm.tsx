'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/components/common/button';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { fetchAllCategories } from '@/store/recipeCategorySlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { fetchAllServingSizes } from '@/store/servingSizeSlice';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { useRouter } from 'next/navigation';
import { getImageUrlWithAuth } from '@/utils/imageUtils';
import AuthImage from '@/components/common/AuthImage';

interface RecipeImage {
  id?: number;
  imageId?: number;
  path?: string;
}

interface RecipeDetailsFormProps {
  onNext: (data: any) => void;
  initialData: any;
  isEditMode?: boolean;
}

export default function RecipeDetailsForm({ onNext, initialData, isEditMode = false }: RecipeDetailsFormProps) {
  const [name, setName] = useState(initialData.name || '');
  const [recipeCode, setRecipeCode] = useState(initialData.recipeCode || '');
  const [category, setCategory] = useState(
    initialData.category !== undefined && initialData.category !== null
      ? initialData.category
      : ''
  );
  
  const [portions, setPortions] = useState(initialData.portions || '');
  const [servingSize, setServingSize] = useState(initialData.servingSize || '');
  const [images, setImages] = useState<(File | RecipeImage)[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [servingSizeList, setServingSizeList] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modal states
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Update the image base URL
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || 'http://212.85.26.46:8082/api/v1/images/view';

  useEffect(() => {
    setIsMounted(true);
    
    // Load initial images from the initialData if in edit mode
    if (isEditMode && initialData.images && initialData.images.length > 0) {
      setImages(initialData.images);
    }
    
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
        setServingSizeList(res.servingSizeList || []);
      })
      .catch((err) => {
        console.error('Failed to fetch serving sizes:', err);
      });
  }, [dispatch, initialData, isEditMode]);

  useEffect(() => {
    if (!isMounted) return;

    // Create preview URLs based on image type (File or path string)
    const urls: string[] = [];
    
    images.forEach(image => {
      if (image instanceof File) {
        urls.push(URL.createObjectURL(image));
      } else if (typeof image === 'object' && image.path) {
        // For images from API with path property
        urls.push(getImageUrlWithAuth(image.path, imageBaseUrl));
      }
    });

    setImagePreviewUrls(urls);

    return () => {
      // Only revoke URLs that were created with createObjectURL
      urls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [images, isMounted, imageBaseUrl]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImages = Array.from(files);
      setImages(prevImages => [...prevImages, ...newImages]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!name) newErrors.name = 'Name is required';
   
    if (!category) newErrors.category = 'Category is required';
    if (!portions || isNaN(Number(portions)) || Number(portions) <= 0)
      newErrors.portions = 'Portions must be a positive number';
    if (!servingSize) newErrors.servingSize = 'Serving size is required';
    if (images.length === 0) newErrors.images = 'At least one image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextClick = () => {
    if (validateForm()) {
      onNext({
        name,
        recipeCode,
        category,
        portions,
        servingSize,
        images
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

      {isMounted && imagePreviewUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {imagePreviewUrls.map((url, index) => (
            <div key={index} className="relative">
              <div className="aspect-square relative rounded-lg overflow-hidden">
                <AuthImage
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
          className={`w-full p-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B]`}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      {/* <div>
        <label className="block text-gray-700 font-medium mb-2">Recipe Code</label>
        <input
          type="text"
          placeholder="Enter recipe code"
          className={`w-full p-3 border ${errors.recipeCode ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B]`}
          value={recipeCode}
          onChange={(e) => setRecipeCode(e.target.value)}
        />
        {errors.recipeCode && <p className="text-red-500 text-sm">{errors.recipeCode}</p>}
      </div> */}

      <div>
        <label className="block text-gray-700 font-medium mb-2">Recipe Category</label>
        <select
          className={`w-full p-3 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B] appearance-none bg-white`}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="" disabled>Select Option</option>
          {categoryList.map((cat: any) => (
            <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
          ))}
        </select>
        {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">No. of Portions</label>
        <input
          type="number"
          placeholder="Enter value"
          className={`w-full p-3 border ${errors.portions ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B]`}
          value={portions}
          onChange={(e) => setPortions(e.target.value)}
        />
        {errors.portions && <p className="text-red-500 text-sm">{errors.portions}</p>}
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Serving Size</label>
        <select
          className={`w-full p-3 border ${errors.servingSize ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B] appearance-none bg-white`}
          value={servingSize}
          onChange={(e) => setServingSize(e.target.value)}
        >
          <option value="" disabled>Select Serving Size</option>
          {servingSizeList.map((size: any) => (
            <option key={size.servingSizeId} value={size.servingSizeId}>{size.name}</option>
          ))}
        </select>
        {errors.servingSize && <p className="text-red-500 text-sm">{errors.servingSize}</p>}
      </div>

      <div className="flex justify-end mt-8">
        <Button size="lg" onClick={handleNextClick}>Next</Button>
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
