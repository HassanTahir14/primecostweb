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

export default function SubRecipeDetailsForm({ onNext, initialData, isEditMode = false }: RecipeDetailsFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || 'http://212.85.26.46:8082/api/v1/images/view';
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    category: initialData.category || '',
    selectedRecipe: initialData.selectedRecipe || '',
    portions: initialData.portions || '',
    servingSize: initialData.servingSize || '',
    recipeCode: initialData.recipeCode || '',
    images: initialData.images || [],
    newImages: initialData.newImages || [],
    imageIdsToRemove: initialData.imageIdsToRemove || []
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [servingSizeList, setServingSizeList] = useState<any[]>([]);
  const [recipeList, setRecipeList] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<File[]>(initialData.newImages || []);
  const [existingImages, setExistingImages] = useState<RecipeImage[]>(initialData.images || []);
  const [imageIdsToRemove, setImageIdsToRemove] = useState<number[]>(initialData.imageIdsToRemove || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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
        console.log('Serving sizes response:', res);
        setServingSizeList(res || []);
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
            setFormData(prev => ({ 
              ...prev, 
              selectedRecipe: matchedRecipe.id,
              recipeCode: matchedRecipe.recipeCode 
            }));
          }
        }
      })
      .catch((err: Error) => {
        console.error('Failed to fetch recipes:', err);
      });
  }, [dispatch, initialData, isEditMode]);

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setNewImages(prev => [...prev, ...files]);
  };

  const handleRemoveExistingImage = (imageId: number | undefined) => {
    if (imageId) {
      setImageIdsToRemove(prev => [...prev, imageId]);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRecipeSelect = (recipeId: string) => {
    const selectedRecipe = recipeList.find(recipe => recipe.id === Number(recipeId));
    if (selectedRecipe) {
      setFormData(prev => ({
        ...prev,
        selectedRecipe: Number(recipeId),
        recipeCode: selectedRecipe.recipeCode
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.selectedRecipe) {
      newErrors.selectedRecipe = 'Recipe is required';
    }

    if (!formData.portions) {
      newErrors.portions = 'Number of portions is required';
    } else if (parseInt(formData.portions) <= 0) {
      newErrors.portions = 'Number of portions must be greater than 0';
    }

    if (!formData.servingSize) {
      newErrors.servingSize = 'Serving size is required';
    }

    if (!formData.recipeCode) {
      newErrors.recipeCode = 'Recipe code is required';
    } else if (formData.recipeCode.length < 3 || formData.recipeCode.length > 100) {
      newErrors.recipeCode = 'Recipe code must be between 3 and 100 characters';
    }

    // Detailed image validation
    if (isEditMode) {
      if (existingImages.length === 0 && newImages.length === 0) {
        newErrors.images = 'At least one image is required. Please either keep existing images or upload new ones.';
        setErrorMessage('You must have at least one image. Either keep some existing images or upload new ones.');
        setIsErrorModalOpen(true);
      }
    } else {
      if (newImages.length === 0) {
        newErrors.images = 'Please upload at least one image for the sub recipe';
        setErrorMessage('You must upload at least one image to create a sub recipe.');
        setIsErrorModalOpen(true);
      }
    }

    // Validate new image file types and sizes
    if (newImages.length > 0) {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const maxFileSize = 5 * 1024 * 1024; // 5MB

      for (let i = 0; i < newImages.length; i++) {
        const file = newImages[i];
        
        if (!validImageTypes.includes(file.type)) {
          newErrors.images = `Image ${i + 1} has an invalid file type. Only JPEG, JPG, and PNG files are allowed.`;
          setErrorMessage(`Image ${i + 1} has an invalid file type. Please upload only JPEG, JPG, or PNG files.`);
          setIsErrorModalOpen(true);
          break;
        }

        if (file.size > maxFileSize) {
          newErrors.images = `Image ${i + 1} is too large. Maximum file size is 5MB.`;
          setErrorMessage(`Image ${i + 1} is too large. Please upload images smaller than 5MB.`);
          setIsErrorModalOpen(true);
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      if (errors.images) {
        setErrorMessage(errors.images);
      } else if (errors.recipeCode) {
        setErrorMessage(errors.recipeCode);
      } else {
        setErrorMessage('Please fix the validation errors before proceeding');
      }
      setIsErrorModalOpen(true);
      return;
    }

    const dataToSubmit = {
      ...formData,
      images: existingImages,
      newImages,
      imageIdsToRemove,
      recipeCode: formData.recipeCode
    };

    onNext(dataToSubmit);
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
        <label className="block text-gray-700 font-medium mb-2">Sub Recipe Category</label>
        <Select
          label=""
          options={categoryList.map((cat: any) => ({
            label: cat.name,
            value: cat.subRecipeCategoryId.toString()
          }))}
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
        />
        {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Select Recipe</label>
        <Select
          label=""
          options={recipeList.map((recipe: any) => ({
            label: `${recipe.name} - ${recipe.recipeCode}`,
            value: recipe.id.toString()
          }))}
          value={formData.selectedRecipe === '' ? '' : String(formData.selectedRecipe)}
          onChange={(e) => handleRecipeSelect(e.target.value)}
        />
        {errors.selectedRecipe && <p className="text-red-500 text-sm">{errors.selectedRecipe}</p>}
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
