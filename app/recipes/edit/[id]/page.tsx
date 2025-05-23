'use client';

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ArrowLeft } from 'lucide-react';
import Loader from '@/components/common/Loader';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import RecipeDetailsForm from '@/components/recipes/RecipeDetailsForm';
import RecipeIngredientsForm from '@/components/recipes/RecipeIngredientsForm';
import RecipeCostingForm from '@/components/recipes/RecipeCostingForm';
import RecipeProcedureForm from '@/components/recipes/RecipeProcedureForm';
import { updateRecipeThunk, fetchRecipeByIdThunk } from '@/store/recipeSlice';
import { AppDispatch } from '@/store/store';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { useTranslation } from '@/context/TranslationContext';

const steps = [
  { id: 'details', name: 'Details' },
  { id: 'ingredients', name: 'Ingredients' },
  { id: 'costing', name: 'Costing' },
  { id: 'procedure', name: 'Procedure' },
];

export default function EditRecipePage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState('details');
  const [recipeData, setRecipeData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        const response = await dispatch(fetchRecipeByIdThunk(Number(id))).unwrap();
        
        if (response.responseCode !== '0000') {
          throw new Error(response.description || 'Failed to load recipe');
        }
        
        const recipe = response.recipe;
        
        // Map the API response structure to the form fields
        const mappedRecipeData = {
          id: recipe.id,
          name: recipe.name,
          recipeCode: recipe.recipeCode,
          category: recipe.categoryId,
          categoryName: recipe.categoryName,
          portions: recipe.numberOfPortions,
          servingSize: recipe.servingSize,
          menuPrice: recipe.menuPrice,
          foodCostBudget: recipe.foodCostBudgetPercentage,
          foodCostActual: recipe.foodCostActualPercentage,
          idealSellingPrice: recipe.idealSellingPrice,
          costPerPortion: recipe.costPerPortion,
          costPerRecipe: recipe.costPerRecipe,
          marginPerPortion: recipe.marginPerPortion,
          images: recipe.images?.map((img: any) => ({
            id: img.imageId,
            path: img.path
          })) || [],
          ingredients: recipe.ingredientsItems?.map((ing: any) => ({
            id: ing.id,
            item: ing.itemName,
            itemName: ing.itemName,
            quantity: ing.quantity,
            yieldPercentage: ing.yieldPercentage,
            apUsdUnit: ing.apsPerUnit,
            epUsdUnit: ing.epsPerUnit,
            unit: ing.unit,
            weight: ing.weight,
            volume: ing.volume,
            recipeCost: ing.recipeCost
          })) || [],
          procedureStep: recipe.procedures?.map((proc: any) => ({
            id: proc.id,
            stepDescription: proc.description,
            criticalPoint: proc.criticalPoint
          })) || [],
          isSubRecipeAsIngredient: recipe.ingredientsSubRecipe && recipe.ingredientsSubRecipe.length > 0,
          subRecipeIngredients: recipe.ingredientsSubRecipe || [],
          imageIdsToRemove: recipe.imageIdsToRemove || []
        };
        
        setRecipeData(mappedRecipeData);
      } catch (err: any) {
        setError(err.message || 'Failed to load recipe');
        setErrorMessage(err.message || 'Failed to load recipe');
        setIsErrorModalOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecipe();
  }, [dispatch, id]);

  const handleNext = (data: any) => {
    // Deep merge the new data with existing recipeData
    setRecipeData((prev: any) => {
      const mergedData = { ...prev };
      Object.keys(data).forEach(key => {
        if (Array.isArray(data[key])) {
          mergedData[key] = [...data[key]];
        } else if (typeof data[key] === 'object' && data[key] !== null) {
          mergedData[key] = { ...prev[key], ...data[key] };
        } else {
          mergedData[key] = data[key];
        }
      });
      return mergedData;
    });

    const currentIndex = steps.findIndex(step => step.id === activeStep);
    if (currentIndex < steps.length - 1) {
      setActiveStep(steps[currentIndex + 1].id);
    } else {
      handleFinalSubmit();
    }
  };

  const handleBack = () => {
    const currentIndex = steps.findIndex(step => step.id === activeStep);
    if (currentIndex > 0) {
      setActiveStep(steps[currentIndex - 1].id);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Create FormData for multipart/form-data
      const formData = new FormData();
      
      // Prepare recipe data
      const recipeDTO = {
        id: recipeData.id,
        recipeId: Number(id),
        recipeDetailsRequest: {
          name: recipeData.name || '',
          recipeCode: recipeData.recipeCode || '',
          category: Number(recipeData.category) || 0,
          numberOfPortions: Number(recipeData.portions) || 0,
          servingSize: Number(recipeData.servingSize) || 0
        },
        recipeCost: {
          menuPrice: Number(recipeData.menuPrice) || 0,
          foodCostBudgetPercentage: Number(recipeData.foodCostBudget) || 0,
          foodCostActualPercentage: Number(recipeData.foodCostActual) || 0,
          idealSellingPrice: Number(recipeData.idealSellingPrice) || 0,
          costPerPortion: Number(recipeData.costPerPortion) || 0,
          costPerRecipe: Number(recipeData.costPerRecipe) || 0,
          marginPerPortion: Number(recipeData.marginPerPortion) || 0
        },
        ingredient: recipeData.ingredients?.map((ing: any) => ({
          id: ing.id,
          unit: ing.unit || 'KG',
          yieldPercentage: Number(ing.yieldPercentage) || 0,
          quantity: Number(ing.quantity) || 0,
          itemId: Number(ing.itemId) || 1,
          weight: ing.weight || 'KG',
          epsPerUnit: Number(ing.epUsdUnit) || 0,
          volume: ing.volume || null,
          recipeCost: Number(ing.recipeCost) || 0,
          apsPerUnit: Number(ing.apUsdUnit) || 0,
          itemName: ing.itemName || ing.item || ''
        })) || [],
        procedureStep: recipeData.procedureStep?.map((step: any) => ({
          id: step.id,
          stepDescription: step.stepDescription.trim(),
          criticalPoint: step.criticalPoint
        })),
        isSubRecipeAsIngredient: recipeData.isSubRecipeAsIngredient || false,
        subRecipeIngredients: recipeData.subRecipeIngredients || [],
        imageIdsToRemove: recipeData.imageIdsToRemove || []
      };
      
      formData.append(
        'recipe',
        new Blob([JSON.stringify(recipeDTO)], { type: 'application/json' })
      );
      
      // Append images if any
      if (recipeData.newImages && recipeData.newImages.length > 0) {
        // Append new images
        recipeData.newImages.forEach((file: File) => {
          if (file instanceof File) {
            formData.append('images', file);
          }
        });
      } else if (recipeData.images && recipeData.images.length > 0) {
        // Append existing images that haven't been removed
        recipeData.images.forEach((image: any) => {
          if (image instanceof File) {
            formData.append('images', image);
          }
        });
      } else {
        // If no images are present, append an empty array to satisfy the API requirement
        formData.append('images', new Blob([], { type: 'application/json' }));
      }
      
      // Call the update recipe API
      await dispatch(updateRecipeThunk(formData)).unwrap();
      setIsSuccessModalOpen(true);
      
      // Redirect to recipes list after successful update
      setTimeout(() => {
        router.push('/recipes');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update recipe');
      setIsErrorModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 'details':
        return <RecipeDetailsForm onNext={handleNext} initialData={recipeData} isEditMode={true} />;
      case 'ingredients':
        return <RecipeIngredientsForm onNext={handleNext} onBack={handleBack} initialData={recipeData} />;
      case 'costing':
        return <RecipeCostingForm onNext={handleNext} onBack={handleBack} initialData={recipeData} />;
      case 'procedure':
        return <RecipeProcedureForm onNext={handleNext} onBack={handleBack} initialData={recipeData} isEditMode={true} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <PageLayout title={t('recipes.edit.title')}>
        <div className="flex justify-center items-center h-64">
          <Loader size="medium" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return <div>{t('common.error')}: {error}</div>;
  }

  return (
    <PageLayout title={t('recipes.edit.title')}>
      <div className="mb-4">
        <Link href="/recipes" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>{t('recipes.edit.backToRecipes')}</span>
        </Link>
      </div>

      {/* Stepper Navigation */}
      <div className="mb-6 flex justify-center space-x-2 sm:space-x-4">
        {steps.map(step => (
          <button
            key={step.id}
            onClick={() => setActiveStep(step.id)}
            className={`py-3 px-4 sm:px-6 text-center rounded-t-lg text-sm flex-1 ${
              activeStep === step.id
                ? 'bg-[#00997B] text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {t(`recipes.edit.steps.${step.id}`)}
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {renderStepContent()}
      </div>

      {/* Modals */}
      <ConfirmationModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onConfirm={() => {
          setIsSuccessModalOpen(false);
          router.push('/recipes');
        }}
        title={t('common.success')}
        message={t('recipes.edit.success')}
        confirmText={t('common.ok')}
      />

      <ConfirmationModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        onConfirm={() => setIsErrorModalOpen(false)}
        title={t('common.error')}
        message={errorMessage}
        confirmText={t('common.ok')}
      />
    </PageLayout>
  );
} 