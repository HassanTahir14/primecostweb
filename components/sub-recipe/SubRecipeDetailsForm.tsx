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
import { useTranslation } from '@/context/TranslationContext';

interface RecipeImage {
  id?: number;
  path?: string;
}

interface RecipeDetailsFormProps {
  onNext: (data: any) => void;
  initialData: any;
  isEditMode?: boolean;
  onSave?: (data: any) => void;
}

export default function SubRecipeDetailsForm({ onNext, initialData, isEditMode = false, onSave }: RecipeDetailsFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || 'http://212.85.26.46:8082/api/v1/images/view';
  const { t } = useTranslation();
   const generateRecipeCode = () => {
  const prefix = 'RCP';
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${randomNum}`;
};
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    category: initialData.category || '',
    portions: initialData.portions || '',
    servingSize: initialData.servingSize || '',
    recipeCode: initialData.recipeCode || generateRecipeCode(),
    images: initialData.images || [],
    newImages: initialData.newImages || [],
    imageIdsToRemove: initialData.imageIdsToRemove || []
  });

 

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [servingSizeList, setServingSizeList] = useState<any[]>([]);
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
  }, [dispatch]);

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (onSave) {
        onSave({
          ...newData,
          images: existingImages,
          newImages,
          imageIdsToRemove
        });
      }
      return newData;
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setNewImages(prev => {
      const newImages = [...prev, ...files];
      if (onSave) {
        onSave({
          ...formData,
          images: existingImages,
          newImages,
          imageIdsToRemove
        });
      }
      return newImages;
    });
  };

  const handleRemoveExistingImage = (imageId: number | undefined) => {
    if (imageId) {
      setImageIdsToRemove(prev => {
        const newIds = [...prev, imageId];
        if (onSave) {
          onSave({
            ...formData,
            images: existingImages.filter(img => img.id !== imageId),
            newImages,
            imageIdsToRemove: newIds
          });
        }
        return newIds;
      });
      setExistingImages(prev => {
        const newImages = prev.filter(img => img.id !== imageId);
        if (onSave) {
          onSave({
            ...formData,
            images: newImages,
            newImages,
            imageIdsToRemove
          });
        }
        return newImages;
      });
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      if (onSave) {
        onSave({
          ...formData,
          images: existingImages,
          newImages,
          imageIdsToRemove
        });
      }
      return newImages;
    });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = t('recipes.subRecipes.detailForm.nameRequired');
    } else if (formData.name.trim().length < 3) {
      newErrors.name = t('recipes.subRecipes.detailForm.nameLength');
    }

    if (!formData.category) {
      newErrors.category = t('recipes.subRecipes.detailForm.categoryRequired');
    }

    if (!formData.portions) {
      newErrors.portions = t('recipes.subRecipes.detailForm.portionsRequired');
    } else if (parseInt(formData.portions) <= 0) {
      newErrors.portions = t('recipes.subRecipes.detailForm.portionsGreaterThanZero');
    }

    if (!formData.servingSize) {
      newErrors.servingSize = t('recipes.subRecipes.detailForm.servingSizeRequired');
    }

    // Detailed image validation
    if (isEditMode) {
      if (existingImages.length === 0 && newImages.length === 0) {
        newErrors.images = t('recipes.subRecipes.detailForm.imageRequired');
      }
    } else {
      if (newImages.length === 0) {
        newErrors.images = t('recipes.subRecipes.detailForm.uploadAtLeastOne');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      // Only show image validation errors in the modal
      if (errors.images) {
        setErrorMessage(errors.images);
        setIsErrorModalOpen(true);
      }
      return;
    }

    const dataToSubmit = {
      ...formData,
      images: existingImages,
      newImages,
      imageIdsToRemove,
      recipeCode: initialData.recipeCode || generateRecipeCode(),
    };

    onNext(dataToSubmit);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">{t('recipes.subRecipes.detailForm.title')}</h2>
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
            {t('recipes.subRecipes.detailForm.uploadImage')}
          </Button>
        </div>
      </div>

      {/* Image Display Section */}
      <div className="space-y-4">
        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2 text-gray-600">{t('recipes.subRecipes.detailForm.currentImages')}</h4>
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
            <h4 className="text-sm font-medium mb-2 text-gray-600">{t('recipes.subRecipes.detailForm.newImages')}</h4>
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
        <label className="block text-gray-700 font-medium mb-2">{t('recipes.subRecipes.detailForm.name')}</label>
        <input
          type="text"
          placeholder={t('recipes.subRecipes.detailForm.namePlaceholder')}
          className={`w-full p-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B]`}
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">{t('recipes.subRecipes.detailForm.category')}</label>
        <Select
          label=""
          options={categoryList.map((cat: any) => ({
            label: cat.name,
            value: cat.subRecipeCategoryId.toString()
          }))}
          value={formData.category}
          onChange={(e) => handleInputChange('category', e.target.value)}
        />
        {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">{t('recipes.subRecipes.detailForm.portions')}</label>
        <input
          type="number"
          placeholder={t('recipes.subRecipes.detailForm.namePlaceholder')}
          className={`w-full p-3 border ${errors.portions ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B]`}
          value={formData.portions}
          onChange={(e) => handleInputChange('portions', e.target.value)}
        />
        {errors.portions && <p className="text-red-500 text-sm">{errors.portions}</p>}
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">{t('recipes.subRecipes.detailForm.servingSize')}</label>
        <Select
          label=""
          options={servingSizeList.map((size: any) => ({
            label: size.name,
            value: size.servingSizeId.toString()
          }))}
          value={formData.servingSize}
          onChange={(e) => handleInputChange('servingSize', e.target.value)}
        />
        {errors.servingSize && <p className="text-red-500 text-sm">{errors.servingSize}</p>}
      </div>

      <div className="flex justify-end mt-8">
        <Button size="lg" onClick={handleSubmit}>{t('recipes.subRecipes.detailForm.next')}</Button>
      </div>

      {/* Error Modal */}
      <ConfirmationModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title={t('recipes.subRecipes.detailForm.error')}
        message={errorMessage}
        isAlert={true}
        okText={t('recipes.subRecipes.detailForm.next')}
      />
    </div>
  );
}
