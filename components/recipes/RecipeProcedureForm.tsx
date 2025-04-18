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
  id?: number;
  stepDescription: string;
  criticalPoint: string;
}

export default function RecipeProcedureForm({ onNext, onBack, initialData }: RecipeProcedureFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  
  // Map the procedure steps from the API response
  const [steps, setSteps] = useState<ProcedureStep[]>(() => {
    if (initialData.procedureStep?.length) {
      // Map the API response to our expected format
      return initialData.procedureStep.map((step: any) => ({
        id: step.id,
        stepDescription: step.stepDescription || step.description || '',
        criticalPoint: step.criticalPoint || 'CP'
      }));
    }
    return [{ stepDescription: '', criticalPoint: 'CP' }];
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: number]: string}>({});
  const isEditMode = Boolean(initialData.id);

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
      setErrors(prev => {
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

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateSteps()) {
      alert('Please fix the validation errors before submitting');
      return;
    }

    // Ensure all steps have valid descriptions
    const hasEmptySteps = steps.some(step => !step.stepDescription.trim());
    if (hasEmptySteps) {
      alert('All steps must have a description');
      return;
    }

    // Pass the validated procedure steps to the parent component
    onNext({ 
      procedureStep: steps.map(step => ({
        ...step,
        stepDescription: step.stepDescription.trim()
      }))
    });
  };

  // Step types for dropdown
  const stepTypes = ['CP', 'Standard', 'Prep'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Recipe Procedures</h2>
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
              className={`flex-grow p-3 border ${errors[index] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B]`}
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
              disabled={steps.length === 1}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          {errors[index] && (
            <p className="text-red-500 text-sm ml-24">{errors[index]}</p>
          )}
        </div>
      ))}

      <div className="flex justify-between mt-8">
        <Button variant="secondary" onClick={onBack} disabled={isSubmitting}>Back</Button>
        <Button onClick={handleSubmit} size="lg">
          Next
        </Button>
      </div>
    </div>
  );
} 