'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createRecipe, updateRecipeThunk } from '@/store/recipeSlice';
import Button from '@/components/common/button';
import { Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AppDispatch } from '@/store/store';
import ConfirmationModal from '@/components/common/ConfirmationModal';

interface RecipeProcedureFormProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData: any;
  isEditMode?: boolean;
}

interface RecipeImage {
  id?: number;
  imageId?: number;
  path?: string;
}

interface ProcedureStep {
  stepDescription: string;
  criticalPoint: string;
}

export default function RecipeProcedureForm({ onNext, onBack, initialData, isEditMode = false }: RecipeProcedureFormProps) {
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  const validateForm = () => {
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

  const handleSubmit = () => {
    if (!validateForm()) {
      setErrorMessage('Please fix the validation errors before proceeding');
      setShowErrorModal(true);
      return;
    }

    onNext({
      ...initialData,
      procedureStep: steps.map(step => ({
        ...step,
        stepDescription: step.stepDescription.trim()
      }))
    });
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

      <div className="flex justify-between mt-8">
        <Button variant="secondary" onClick={onBack} disabled={isSubmitting}>Back</Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          Next
        </Button>
      </div>

      {/* Error Modal */}
      <ConfirmationModal
        isOpen={showErrorModal}
        onClose={() => {
          setShowErrorModal(false);
          setErrorMessage('');
          setErrorDetails({});
        }}
        title="Validation Error"
        message={`${errorMessage}\n\n${Object.entries(errorDetails)
          .map(([key, value]) => `• ${value}`)
          .join('\n')}`}
        isAlert={true}
        okText="Close"
      />

      {/* Success Modal */}
      <ConfirmationModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push('/recipes');
        }}
        title="Success"
        message={isEditMode ? "Recipe updated successfully!" : "Recipe created successfully!"}
        isAlert={true}
        okText="OK"
      />
    </div>
  );
} 