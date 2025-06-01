'use client';

import { useState } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import SubRecipeDetailsForm from '@/components/sub-recipe/SubRecipeDetailsForm';
import SubRecipeIngredientsForm from '@/components/sub-recipe/SubRecipeIngredientsForm';
import SubRecipeCostingForm from '@/components/sub-recipe/SubRecipeCostingForm';
import SubRecipeProcedureForm from '@/components/sub-recipe/SubRecipeProcedureForm';
import { useTranslation } from '@/context/TranslationContext';

const steps = [
  { id: 'details', name: 'Details' },
  { id: 'ingredients', name: 'Ingredients' },
  { id: 'costing', name: 'Costing' },
  { id: 'procedure', name: 'Procedure' },
];

export default function CreateRecipePage() {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState('details');
  // Initialize recipeData with all required properties and explicit any type
  const [recipeData, setRecipeData] = useState<any>({
    existingImages: [],
    newImages: [],
    imageIdsToRemove: [],
    ingredients: [],
    images: [],
    itemList: []
  });
  const [isValid, setIsValid] = useState(false);

  const handleNext = (data: any) => {
    let newData = { ...data };
    if (data.ingredients && recipeData.itemList) {
      newData.ingredients = mapIngredientsWithItemId(data.ingredients, recipeData.itemList);
    }
    setRecipeData((prev: any) => ({
      ...prev,
      ...newData,
      existingImages: data.images || prev.existingImages,
      newImages: data.newImages || prev.newImages,
      imageIdsToRemove: data.imageIdsToRemove || prev.imageIdsToRemove
    }));
    setActiveStep(prev => {
      const currentIndex = steps.findIndex(step => step.id === prev);
      if (currentIndex < steps.length - 1) {
        return steps[currentIndex + 1].id;
      }
      return prev;
    });
  };

  const handleBack = () => {
    const currentIndex = steps.findIndex(step => step.id === activeStep);
    if (currentIndex > 0) {
      setActiveStep(steps[currentIndex - 1].id);
    }
  };

  const handleTabClick = (stepId: string) => {
    setRecipeData((prev: any) => {
      let updated = { ...prev };
      if (prev.ingredients && prev.itemList) {
        updated.ingredients = mapIngredientsWithItemId(prev.ingredients, prev.itemList);
      }
      return updated;
    });
    setActiveStep(stepId);
  };

  const handleSave = (data: any) => {
    setRecipeData((prev: any) => ({
      ...prev,
      ...data,
      ...(data.itemList ? { itemList: data.itemList } : {}),
      existingImages: data.images || prev.existingImages,
      newImages: data.newImages || prev.newImages,
      imageIdsToRemove: data.imageIdsToRemove || prev.imageIdsToRemove
    }));
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 'details':
        return <SubRecipeDetailsForm onNext={handleNext} initialData={recipeData} onSave={handleSave} />;
      case 'ingredients':
        return <SubRecipeIngredientsForm onNext={handleNext} onBack={handleBack} initialData={recipeData} onSave={handleSave} />;
      case 'costing':
        return <SubRecipeCostingForm onNext={handleNext} onBack={handleBack} initialData={recipeData} onSave={handleSave} />;
      case 'procedure':
        return <SubRecipeProcedureForm onNext={handleNext} onBack={handleBack} initialData={recipeData} isEditMode={false} onSave={handleSave} />;
      default:
        return null;
    }
  };

  return (
    <PageLayout title={t('recipes.subRecipes.create.title')}>
      <div className="mb-4">
        <Link href="/recipes/sub-recipes" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>{t('recipes.subRecipes.create.backToSubRecipes')}</span>
        </Link>
      </div>

      {/* Stepper Navigation */}
      <div className="mb-6 flex justify-center space-x-2 sm:space-x-4">
        {steps.map(step => (
          <button
            key={step.id}
            onClick={() => handleTabClick(step.id)}
            className={`py-3 px-4 sm:px-6 text-center rounded-t-lg text-sm flex-1 ${
              activeStep === step.id
                ? 'bg-[#00997B] text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {t(`recipes.subRecipes.create.steps.${step.id}`)}
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {renderStepContent()}
      </div>
    </PageLayout>
  );
}

// Helper to map itemId for all ingredients
function mapIngredientsWithItemId(ingredients: any[], itemList: any[]) {
  if (!Array.isArray(ingredients) || !Array.isArray(itemList)) return ingredients;
  return ingredients.map(ing => {
    const itemNameKey = ing.itemName ? ing.itemName.split('@')[0] : ing.item;
    const matchedItem = itemList.find(item => item.name.split('@')[0] === itemNameKey);
    return {
      ...ing,
      itemId: matchedItem ? matchedItem.itemId : ing.id // fallback to id if not found
    };
  });
}