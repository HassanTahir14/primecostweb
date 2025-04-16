'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createRecipe } from '@/store/recipeSlice';
import Button from '@/components/common/button';
import { Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AppDispatch } from '@/store/store';

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

  const handleAddStep = () => {
    setSteps([...steps, { stepDescription: '', criticalPoint: 'CP' }]);
  };

  const handleStepChange = (index: number, field: keyof ProcedureStep, value: string) => {
    const newSteps = steps.map((step, i) => 
      i === index ? { ...step, [field]: value } : step
    );
    setSteps(newSteps);
  };

  const handleDeleteStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);

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
          yieldPercentage: Number(ing.yieldPercent) || 100,
          quantity: Number(ing.quantity) || 0,
          itemId: Number(ing.itemId) || 1,
          weight: ing.weight || 'string',
          epsPerUnit: Number(ing.epUsdUnit) || 0,
          volume: ing.volume || 'string',
          recipeCost: Number(ing.recipeCost) || 0,
          apsPerUnit: Number(ing.apUsdUnit) || 0,
          itemName: ing.item || 'string'
        })) || [],
        procedureStep: steps,
        isSubRecipeAsIngredient: initialData.isSubRecipeAsIngredient || false,
        subRecipeIngredients: initialData.subRecipeIngredients || []
      };

      // Add the recipe DTO to FormData
      formData.append('recipe', JSON.stringify(recipeDTO));

      // Add images if they exist
      if (initialData.images && initialData.images.length > 0) {
        initialData.images.forEach((image: File, index: number) => {
          formData.append('images', image);
        });
      }

      // Dispatch create recipe action
      const result = await dispatch(createRecipe(formData)).unwrap();
      
      if (result.responseCode === '0000') {
        // Navigate back to recipes list on success
        router.push('/recipes');
      } else {
        throw new Error(result.description || 'Failed to create recipe');
      }
    } catch (error: any) {
      console.error('Failed to create recipe:', error);
      // Handle error (you might want to show a toast or error message)
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock data for step type select
  const stepTypes = ['CP', 'Standard', 'Prep'];

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
        <div key={index} className="flex items-center gap-4">
          <span className="font-medium text-gray-700 whitespace-nowrap">Step {index + 1}:</span>
          <input
            type="text"
            placeholder="Enter procedure description"
            className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B]"
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
      ))}

      <div className="flex justify-between mt-8">
        <Button variant="secondary" onClick={onBack} disabled={isSubmitting}>Back</Button>
        <Button onClick={handleFinalSubmit}>
          {isSubmitting ? 'Creating Recipe...' : 'CREATE RECIPE'}
        </Button>
      </div>
    </div>
  );
} 