'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/components/common/button';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { fetchAllCategories } from '@/store/subRecipeCategorySlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { fetchAllServingSizes } from '@/store/servingSizeSlice';
import { fetchRecipes } from '@/store/recipeSlice';
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

export default function SubRecipeDetailsForm({ onNext, initialData, isEditMode = false }: RecipeDetailsFormProps) {
  const [name, setName] = useState(initialData.name || '');
  const [recipeCode, setRecipeCode] = useState(initialData.recipeCode || '');
  const [category, setCategory] = useState(initialData.category || '');
  const [portions, setPortions] = useState(initialData.portions || '');
  const [servingSize, setServingSize] = useState(initialData.servingSize || '');
  const [selectedRecipe, setSelectedRecipe] = useState<number | ''>(
    initialData.selectedRecipe ? Number(initialData.selectedRecipe) : ''
  );
  const [images, setImages] = useState<(File | RecipeImage)[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [servingSizeList, setServingSizeList] = useState<any[]>([]);
  const [recipeList, setRecipeList] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modal states
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Get the image base URL for API images
  const imageBaseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    setIsMounted(true);
    
    // Load initial images from the initialData if in edit mode
    if (isEditMode && initialData.images && initialData.images.length > 0) {
      setImages(initialData.images);
    }
    
    dispatch(fetchAllCategories())
      .unwrap()
      .then((res) => {
        setCategoryList(res.subRecipeCategoryList || []);
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

    dispatch(fetchRecipes({}))
      .unwrap()
      .then((res: { recipeList: any[] }) => {
        // Filter recipes to only show approved ones
        const approvedRecipes = res.recipeList.filter((recipe: any) => 
          recipe.tokenStatus === 'APPROVED'
        );
        setRecipeList(approvedRecipes);
        
        // Pre-select recipe in edit mode if recipeCode matches
        if (isEditMode && initialData.recipeCode) {
          const matchedRecipe = approvedRecipes.find(
            (recipe: any) => recipe.recipeCode === initialData.recipeCode
          );
          if (matchedRecipe) {
            setSelectedRecipe(matchedRecipe.id);
            setRecipeCode(matchedRecipe.recipeCode);
          }
        }
      })
      .catch((err: Error) => {
        console.error('Failed to fetch recipes:', err);
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
    if (!selectedRecipe) newErrors.selectedRecipe = 'Recipe is required';
    if (images.length === 0) {
      newErrors.images = 'At least one image is required';
      setErrorMessage('Please upload at least one image before proceeding.');
      setIsErrorModalOpen(true);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextClick = () => {
    if (validateForm()) {
      const selectedRecipeData = recipeList.find(recipe => recipe.id === selectedRecipe);
      if (!selectedRecipeData) {
        setErrorMessage('Please select a valid recipe');
        setIsErrorModalOpen(true);
        return;
      }

      // Convert existing images to File objects before passing to onNext
      const processImages = async () => {
        const processedImages = await Promise.all(
          images.map(async (image) => {
            if (image instanceof File) {
              return image;
            } else if (image.path) {
              try {
                const ext = image.path.split('.').pop()?.toLowerCase();
                let mimeType = 'image/jpeg';
                if (ext === 'png') mimeType = 'image/png';
                if (ext === 'webp') mimeType = 'image/webp';
                
                const url = getImageUrlWithAuth(image.path, imageBaseUrl);
                const response = await fetch(url);
                const blob = await response.blob();
                return new File([blob], image.path.split('/').pop() || 'image.jpg', { type: mimeType });
              } catch (error) {
                console.error('Error converting image to File:', error);
                return null;
              }
            }
            return null;
          })
        );

        onNext({
          name,
          category,
          portions,
          servingSize,
          images: processedImages.filter(Boolean),
          recipeCode: selectedRecipeData.recipeCode,
          selectedRecipeId: selectedRecipeData.id
        });
      };

      processImages();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Sub Recipe details</h2>
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

      <div>
        <label className="block text-gray-700 font-medium mb-2">Sub Recipe Category</label>
        <select
          className={`w-full p-3 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B] appearance-none bg-white`}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="" disabled>Select Option</option>
          {categoryList.map((cat: any) => (
            <option key={cat.subRecipeCategoryId} value={cat.subRecipeCategoryId}>{cat.name}</option>
          ))}
        </select>
        {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
      </div>

       <div>
        <label className="block text-gray-700 font-medium mb-2">Select Recipe</label>
        <select
          className={`w-full p-3 border ${errors.selectedRecipe ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B] appearance-none bg-white`}
          value={selectedRecipe === '' ? '' : String(selectedRecipe)}
          onChange={(e) => setSelectedRecipe(Number(e.target.value))}
        >
          <option value="" disabled>Select Recipe</option>
          {recipeList.map((recipe: any) => (
            <option key={recipe.id} value={recipe.id}>
              {recipe.name} - {recipe.recipeCode}
            </option>
          ))}
        </select>
        {errors.selectedRecipe && <p className="text-red-500 text-sm">{errors.selectedRecipe}</p>}
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
