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

const steps = [
  { id: 'details', name: 'Details' },
  { id: 'ingredients', name: 'Ingredients' },
  { id: 'costing', name: 'Costing' },
  { id: 'procedure', name: 'Procedure' },
];

export default function CreateRecipePage() {
  const [activeStep, setActiveStep] = useState('details');
  const [recipeData, setRecipeData] = useState({});

  const handleNext = (data: any) => {
    // Log the data being received from the current step
    console.log(`Data from ${activeStep} step:`, data);
    
    // Merge the new data with the existing recipe data
    const updatedRecipeData = { ...recipeData, ...data };
    setRecipeData(updatedRecipeData);
    
    // Log the updated recipe data
    console.log('Updated recipe data:', updatedRecipeData);
    
    const currentIndex = steps.findIndex(step => step.id === activeStep);
    if (currentIndex < steps.length - 1) {
      setActiveStep(steps[currentIndex + 1].id);
    } else {
      // Handle final submission
      console.log('Final Recipe Data:', updatedRecipeData);
      // Potentially navigate away or show success message
    }
  };

  const handleBack = () => {
    const currentIndex = steps.findIndex(step => step.id === activeStep);
    if (currentIndex > 0) {
      setActiveStep(steps[currentIndex - 1].id);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 'details':
        return <RecipeDetailsForm onNext={handleNext} initialData={recipeData} />;
      case 'ingredients':
        return <RecipeIngredientsForm onNext={handleNext} onBack={handleBack} initialData={recipeData} />;
      case 'costing':
        return <RecipeCostingForm onNext={handleNext} onBack={handleBack} initialData={recipeData} />;
      case 'procedure':
        return <RecipeProcedureForm onNext={handleNext} onBack={handleBack} initialData={recipeData} />;
      default:
        return null;
    }
  };

  return (
    <PageLayout title="Create Recipe">
      <div className="mb-4">
        <Link href="/recipes" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Back to Recipes</span>
        </Link>
      </div>

      {/* Stepper Navigation */}
      <div className="mb-6 flex justify-center space-x-2 sm:space-x-4">
        {steps.map(step => (
          <button
            key={step.id}
            onClick={() => setActiveStep(step.id)} // Allow direct navigation for now
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