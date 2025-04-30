'use client';

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import SubRecipeDetailsForm from '@/components/sub-recipe/SubRecipeDetailsForm';
import SubRecipeIngredientsForm from '@/components/sub-recipe/SubRecipeIngredientsForm';
import SubRecipeCostingForm from '@/components/sub-recipe/SubRecipeCostingForm';
import SubRecipeProcedureForm from '@/components/sub-recipe/SubRecipeProcedureForm';
import { updateRecipeThunk, fetchRecipeByIdThunk } from '@/store/recipeSlice';
import { AppDispatch } from '@/store/store';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { getSubRecipeByIdThunk } from '@/store/subRecipeSlice';
import { getImageUrlWithAuth } from '@/utils/imageUtils';
import { updateSubRecipeThunk } from '@/store/subRecipeSlice';

const steps = [
  { id: 'details', name: 'Details' },
  { id: 'ingredients', name: 'Ingredients' },
  { id: 'costing', name: 'Costing' },
  { id: 'procedure', name: 'Procedure' },
];

// Helper to fetch an image URL and convert to File
async function urlToFile(url: string, filename: string, mimeType: string) {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return new File([buf], filename, { type: mimeType });
}

export default function EditRecipePage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
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
        const response = await dispatch(getSubRecipeByIdThunk(Number(id))).unwrap();
        
        if (response.responseCode !== '0000') {
          throw new Error(response.description || 'Failed to load recipe');
        }
        
        const recipe = response.subRecipe;
        
        // Map the API response structure to the form fields
        const mappedRecipeData = {
          id: recipe.id,
          name: recipe.name,
          recipeCode: recipe.subRecipeCode,
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
          ingredients: recipe.ingredients?.map((ing: any) => ({
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
          isSubRecipeAsIngredient: false,
          subRecipeIngredients: []
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
    setRecipeData((prev: any) => ({ ...prev, ...data }));
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
        subRecipeId: Number(id),
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
        subRecipeIngredients: recipeData.subRecipeIngredients || []
      };
      
      formData.append(
        'subRecipe',
        new Blob([JSON.stringify(recipeDTO)], { type: 'application/json' })
      );
      
      // Convert and append all images to form data
      if (recipeData.images && recipeData.images.length > 0) {
        // Images are already File objects from SubRecipeDetailsForm
        recipeData.images.forEach((file: File) => {
          if (file instanceof File) {
            formData.append('images', file);
          }
        });
      } else {
        // If no images are present, append an empty array to satisfy the API requirement
        formData.append('images', new Blob([], { type: 'application/json' }));
      }
      
      // Call the update recipe API
      await dispatch(updateSubRecipeThunk(formData)).unwrap();
      setIsSuccessModalOpen(true);
      
      // Redirect to recipes list after successful update
      setTimeout(() => {
        router.push('/recipes/sub-recipes');
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
        return <SubRecipeDetailsForm onNext={handleNext} initialData={recipeData} isEditMode={true} />;
      case 'ingredients':
        return <SubRecipeIngredientsForm onNext={handleNext} onBack={handleBack} initialData={recipeData} />;
      case 'costing':
        return <SubRecipeCostingForm onNext={handleNext} onBack={handleBack} initialData={recipeData} />;
      case 'procedure':
        return <SubRecipeProcedureForm onNext={handleNext} onBack={handleBack} initialData={recipeData} isEditMode={true} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <PageLayout title="Edit Sub Recipe">
      <div className="mb-4">
        <Link href="/recipes/sub-recipes" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Back to Sub Recipes</span>
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
            {step.name}
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {renderStepContent()}
      </div>

      {/* Success Modal */}
      <ConfirmationModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Success"
        message="Sub Recipe updated successfully!"
        isAlert={true}
        okText="OK"
      />

      {/* Error Modal */}
      <ConfirmationModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title="Error"
        message={errorMessage}
        isAlert={true}
        okText="OK"
      />
    </PageLayout>
  );
} 