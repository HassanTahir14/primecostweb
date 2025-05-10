'use client';

import { useState } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import RecipeDetailsForm from '@/components/recipes/RecipeDetailsForm';
import RecipeIngredientsForm from '@/components/recipes/RecipeIngredientsForm';
import RecipeCostingForm from '@/components/recipes/RecipeCostingForm';
import RecipeProcedureForm from '@/components/recipes/RecipeProcedureForm';
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
  const [recipeData, setRecipeData] = useState({
    existingImages: [],
    newImages: [],
    imageIdsToRemove: []
  });
  const [isValid, setIsValid] = useState(false);

  const handleNext = (data: any) => {
    setRecipeData(prev => ({
      ...prev,
      ...data,
      images: data.images || prev.images,
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
    setActiveStep(stepId);
  };

  const handleSave = (data: any) => {
    setRecipeData(prev => ({
      ...prev,
      ...data,
      existingImages: data.images || prev.existingImages,
      newImages: data.newImages || prev.newImages,
      imageIdsToRemove: data.imageIdsToRemove || prev.imageIdsToRemove
    }));
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 'details':
        return <RecipeDetailsForm onNext={handleNext} initialData={recipeData} onSave={handleSave} />;
      case 'ingredients':
        return <RecipeIngredientsForm onNext={handleNext} onBack={handleBack} initialData={recipeData} onSave={handleSave} />;
      case 'costing':
        return <RecipeCostingForm onNext={handleNext} onBack={handleBack} initialData={recipeData} onSave={handleSave} />;
      case 'procedure':
        return <RecipeProcedureForm onNext={handleNext} onBack={handleBack} initialData={recipeData} isEditMode={false} onSave={handleSave} />;
      default:
        return null;
    }
  };

  return (
    <PageLayout title={t('recipes.create.title')}>
      <div className="mb-4">
        <Link href="/recipes" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>{t('recipes.create.backToRecipes')}</span>
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
            {t(`recipes.create.steps.${step.id}`)}
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