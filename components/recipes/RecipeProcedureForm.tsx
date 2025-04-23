'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createRecipe } from '@/store/recipeSlice';
import Button from '@/components/common/button';
import { Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AppDispatch } from '@/store/store';
import ConfirmationModal from '@/components/common/ConfirmationModal';

interface RecipeProcedureFormProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData: any;
}

interface ProcedureStep {
  stepDescription: string;
  criticalPoint: string;
}

export default function RecipeProcedureForm({ onNext, onBack, initialData }: RecipeProcedureFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [steps, setSteps] = useState<ProcedureStep[]>(
    initialData.procedureStep?.length 
      ? initialData.procedureStep 
      : [{ stepDescription: '', criticalPoint: 'CP' }]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState<{[key: string]: string}>({});

  const handleAddStep = () => {
    setSteps([...steps, { stepDescription: '', criticalPoint: 'CP' }]);
  };

  const handleStepChange = (index: number, field: keyof ProcedureStep, value: string) => {
    const newSteps = steps.map((step, i) => 
      i === index ? { ...step, [field]: value } : step
    );
    setSteps(newSteps);
    
    // Clear error for this step when user types
    if (field === 'stepDescription') {
      setErrorDetails(prev => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
    }
  };

  const handleDeleteStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const validateSteps = () => {
    const newErrors: {[key: number]: string} = {};
    let isValid = true;

    steps.forEach((step, index) => {
      if (!step.stepDescription || step.stepDescription.trim().length < 3) {
        newErrors[index] = 'Step description must be at least 3 characters long';
        isValid = false;
      } else if (step.stepDescription.length > 2000) {
        newErrors[index] = 'Step description must not exceed 2000 characters';
        isValid = false;
      }
    });

    setErrorDetails(newErrors);
    return isValid;
  };

  const handleFinalSubmit = async () => {
    try {
      if (!validateSteps()) {
        alert('Please fix the validation errors before submitting');
        return;
      }

      setIsSubmitting(true);

      // Ensure all steps have valid descriptions
      const hasEmptySteps = steps.some(step => !step.stepDescription.trim());
      if (hasEmptySteps) {
        alert('All steps must have a description');
        return;
      }

      // Create FormData for multipart/form-data
      const formData = new FormData();

      // Add recipe details
      const recipeDTO = {
        recipeDetailsRequest: {
          name: initialData.name || '',
          recipeCode: initialData.recipeCode || '',
          category: Number(initialData.category) || 0,
          numberOfPortions: Number(initialData.portions) || 0,
          servingSize: Number(initialData.servingSize) || 0
        },
        recipeCost: {
          menuPrice: Number(initialData.menuPrice) || 0,
          foodCostBudgetPercentage: Number(initialData.foodCostBudget) || 100,
          foodCostActualPercentage: Number(initialData.foodCostActual) || 100,
          idealSellingPrice: Number(initialData.idealSellingPrice) || 0,
          costPerPortion: Number(initialData.costPerPortion) || 0,
          costPerRecipe: Number(initialData.costPerRecipe) || 0,
          marginPerPortion: Number(initialData.marginPerPortion) || 0
        },
        ingredient: initialData.ingredients?.map((ing: any) => ({
          unit: ing.unit || 'string',
          yieldPercentage: Number(ing.yieldPercentage || ing.yieldPercent) || 100,
          quantity: Number(ing.quantity) || 0,
          itemId: Number(ing.itemId) || 1,
          weight: ing.weight || 'string',
          epsPerUnit: Number(ing.epsPerUnit || ing.epUsdUnit) || 0,
          volume: ing.volume || 'string',
          recipeCost: Number(ing.recipeCost) || 0,
          apsPerUnit: Number(ing.apsPerUnit || ing.apUsdUnit) || 0,
          itemName: ing.itemName || ing.item || 'string'
        })) || [],
        procedureStep: steps.map(step => ({
          ...step,
          stepDescription: step.stepDescription.trim()
        })),
        isSubRecipeAsIngredient: initialData.isSubRecipeAsIngredient || false,
        subRecipeIngredients: initialData.subRecipeIngredients || []
      };

      console.log('Validated recipe data:', recipeDTO);

      formData.append(
        'recipe',
        new Blob([JSON.stringify(recipeDTO)], { type: 'application/json' })
      );
      

     
      if (initialData.images && initialData.images.length > 0) {
        initialData.images.forEach((image: File, index: number) => {
          formData.append('images', image);
        });
      }

      console.log(recipeDTO, 'recipeDTO')

     
      console.log('Form data being sent:', {
        recipe: JSON.stringify(recipeDTO).substring(0, 100) + '...',
        images: initialData.images?.length || 0
      });

     
      const result = await dispatch(createRecipe(formData)).unwrap();
      console.log(result, 'result')
      
      
    } catch (error: any) {
      console.log(error, 'error')
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock data for step type select
  const stepTypes = ['CP', 'CPP'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Recipe Procedure's</h2>
        <Button variant="secondary" onClick={handleAddStep}>
          <Plus className="w-4 h-4 mr-2" />
          Add step
        </Button>
      </div>

      <label className="block text-gray-700 font-medium mb-2">Procedure Steps</label>

      {steps.map((step, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center gap-4">
            <span className="font-medium text-gray-700 whitespace-nowrap">Step {index + 1}:</span>
            <input
              type="text"
              placeholder="Enter procedure description"
              className={`flex-grow p-3 border ${errorDetails[index] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B]`}
              value={step.stepDescription}
              onChange={(e) => handleStepChange(index, 'stepDescription', e.target.value)}
            />
            <select
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B] appearance-none bg-white"
              value={step.criticalPoint}
              onChange={(e) => handleStepChange(index, 'criticalPoint', e.target.value)}
            >
              {stepTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleDeleteStep(index)} 
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          {errorDetails[index] && (
            <p className="text-red-500 text-sm ml-24">{errorDetails[index]}</p>
          )}
        </div>
      ))}

      {/* Error Modal */}
      <ConfirmationModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Validation Error"
        message={`${errorMessage}\n\n${Object.entries(errorDetails)
          .map(([key, value]) => `• ${value}`)
          .join('\n')}`}
        isAlert={true}
        okText="Close"
      />

      <div className="flex justify-between mt-8">
        <Button variant="secondary" onClick={onBack} disabled={isSubmitting}>Back</Button>
        <Button onClick={handleFinalSubmit}>
          {isSubmitting ? 'Creating Recipe...' : 'CREATE RECIPE'}
        </Button>
      </div>
    </div>
  );
} 