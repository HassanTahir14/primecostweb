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

const steps = [
  { id: 'details', name: 'Details' },
  { id: 'ingredients', name: 'Ingredients' },
  { id: 'costing', name: 'Costing' },
  { id: 'procedure', name: 'Procedure' },
];

export default function CreateRecipePage() {
  const [activeStep, setActiveStep] = useState('details');
  const [recipeData, setRecipeData] = useState({
    existingImages: [],
    newImages: [],
    imageIdsToRemove: []
  });
  const [isValid, setIsValid] = useState(false);

  const handleNext = (data: any) => {
    // Log the data being received from the current step
    console.log(`Data from ${activeStep} step:`, data);
    
    // Merge the new data with the existing recipe data, preserving image data
    const updatedRecipeData = { 
      ...recipeData,
      ...data,
      // Preserve image data if it exists in the current data
      existingImages: data.existingImages || recipeData.existingImages,
      newImages: data.newImages || recipeData.newImages,
      imageIdsToRemove: data.imageIdsToRemove || recipeData.imageIdsToRemove
    };
    
    setRecipeData(updatedRecipeData);
    
    // Log the updated recipe data
    console.log('Updated recipe data:', updatedRecipeData);
    
    const currentIndex = steps.findIndex(step => step.id === activeStep);
    if (currentIndex < steps.length - 1) {
      setActiveStep(steps[currentIndex + 1].id);
    }
  };

  const handleBack = () => {
    const currentIndex = steps.findIndex(step => step.id === activeStep);
    if (currentIndex > 0) {
      setActiveStep(steps[currentIndex - 1].id);
    }
  };

  const handleTabClick = (stepId: string) => {
    const currentIndex = steps.findIndex(step => step.id === activeStep);
    const targetIndex = steps.findIndex(step => step.id === stepId);
    
    // Only allow moving to previous steps or the next step if current step is valid
    if (targetIndex < currentIndex || isValid) {
      setActiveStep(stepId);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 'details':
        return <SubRecipeDetailsForm onNext={handleNext} initialData={recipeData} />;
      case 'ingredients':
        return <SubRecipeIngredientsForm onNext={handleNext} onBack={handleBack} initialData={recipeData} />;
      case 'costing':
        return <SubRecipeCostingForm onNext={handleNext} onBack={handleBack} initialData={recipeData} />;
      case 'procedure':
        return <SubRecipeProcedureForm onNext={handleNext} onBack={handleBack} initialData={recipeData} isEditMode={false} />;
      default:
        return null;
    }
  };

  return (
    <PageLayout title="Create Sub Recipe">
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
            onClick={() => handleTabClick(step.id)}
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
    </PageLayout>
  );
} 