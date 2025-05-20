'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createRecipe, updateRecipeThunk } from '@/store/recipeSlice';
import Button from '@/components/common/button';
import { Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AppDispatch } from '@/store/store';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { useTranslation } from '@/context/TranslationContext';

interface RecipeProcedureFormProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData: any;
  isEditMode?: boolean;
  onSave?: (data: any) => void;
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

export default function RecipeProcedureForm({ onNext, onBack, initialData, isEditMode = false, onSave }: RecipeProcedureFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { t } = useTranslation();
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
    const newSteps = [...steps, { stepDescription: '', criticalPoint: 'CP' }];
    setSteps(newSteps);
    if (onSave) {
      onSave({
        procedureStep: newSteps,
        recipeCode: initialData.recipeCode,
        images: initialData.images,
        newImages: initialData.newImages,
        imageIdsToRemove: initialData.imageIdsToRemove
      });
    }
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

    // Save the updated steps
    if (onSave) {
      onSave({
        procedureStep: newSteps,
        recipeCode: initialData.recipeCode,
        images: initialData.images,
        newImages: initialData.newImages,
        imageIdsToRemove: initialData.imageIdsToRemove
      });
    }
  };

  const handleDeleteStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps);
    if (onSave) {
      onSave({
        procedureStep: newSteps,
        recipeCode: initialData.recipeCode,
        images: initialData.images,
        newImages: initialData.newImages,
        imageIdsToRemove: initialData.imageIdsToRemove
      });
    }
  };

  const validateForm = () => {
    const newErrors: {[key: number]: string} = {};
    let isValid = true;

    steps.forEach((step, index) => {
      if (!step.stepDescription || step.stepDescription.trim().length < 3) {
        newErrors[index] = t('mainRecipes.procedure.stepDescriptionMinLength');
        isValid = false;
      } else if (step.stepDescription.length > 2000) {
        newErrors[index] = t('mainRecipes.procedure.stepDescriptionMaxLength');
        isValid = false;
      }
    });

    setErrorDetails(newErrors);
    return isValid;
  };

  const handleFinalSubmit = async () => {
    try {
      if (!validateForm()) {
        setErrorMessage(t('mainRecipes.procedure.fixValidationErrors'));
        setShowErrorModal(true);
        return;
      }

      setIsSubmitting(true);

      // Ensure all steps have valid descriptions
      const hasEmptySteps = steps.some(step => !step.stepDescription.trim());
      if (hasEmptySteps) {
        alert(t('mainRecipes.procedure.allStepsRequired'));
        return;
      }

      // Create FormData for multipart/form-data
      const formData = new FormData();

      // Add recipe details
      const recipeDTO = {
        id: initialData.id,
        recipeId: initialData.id,
        recipeDetailsRequest: {
          name: initialData.name || '',
          recipeCode: initialData.recipeCode || '',
          category: Number(initialData.category) || 0,
          numberOfPortions: Number(initialData.portions) || 0,
          servingSize: Number(initialData.servingSize) || 0
        },
        recipeCost: {
          menuPrice: Number(initialData.menuPrice) || 0,
          foodCostBudgetPercentage: Number(initialData.foodCostBudget) || 0,
          foodCostActualPercentage: Number(initialData.foodCostActual) || 0,
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
          volume: null,
          recipeCost: Number(ing.recipeCost) || 0,
          apsPerUnit: Number(ing.apsPerUnit || ing.apUsdUnit) || 0,
          itemName: ing.itemName || ing.item || 'string'
        })) || [],
        procedureStep: steps.map(step => ({
          ...step,
          stepDescription: step.stepDescription.trim()
        })),
        isSubRecipeAsIngredient: initialData.isSubRecipeAsIngredient || false,
        subRecipeIngredients: initialData.subRecipeIngredients || [],
        imageIdsToRemove: initialData.imageIdsToRemove || []
      };

      console.log('Validated recipe data:', recipeDTO);

      formData.append(
        'recipe',
        new Blob([JSON.stringify(recipeDTO)], { type: 'application/json' })
      );
      
      // Add images to FormData
      if (initialData.newImages && initialData.newImages.length > 0) {
        // Append new images
        initialData.newImages.forEach((file: File) => {
          if (file instanceof File) {
            formData.append('images', file);
          }
        });
      } else if (initialData.images && initialData.images.length > 0) {
        // Append existing images that haven't been removed
        initialData.images.forEach((image: RecipeImage) => {
          if (image.path) {
            // For existing images, we need to fetch them and add them to FormData
            fetch(image.path)
              .then(res => res.blob())
              .then(blob => {
                const file = new File([blob], `image${image.id}.jpg`, { type: 'image/jpeg' });
                formData.append('images', file);
              })
              .catch(err => {
                console.error('Error fetching image:', err);
                setErrorMessage('Failed to process some images');
                setShowErrorModal(true);
              });
          }
        });
      } else {
        setErrorMessage('At least one image is required. Please either keep existing images or upload new ones.');
        setShowErrorModal(true);
        return;
      }

      let result;
      if (isEditMode) {
        result = await dispatch(updateRecipeThunk(formData)).unwrap();
      } else {
        result = await dispatch(createRecipe(formData)).unwrap();
      }
      console.log(result, 'result');
      
      setShowSuccessModal(true);
    } catch (error: any) {
      setErrorMessage(error.message || t('mainRecipes.procedure.createError'));
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock data for step type select
  const stepTypes = ['CP', 'CCP'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">{t('recipeProcedure.title')}</h2>
        <Button variant="secondary" onClick={handleAddStep}>
          <Plus className="w-4 h-4 mr-2" />
          {t('recipeProcedure.addStep')}
        </Button>
      </div>

      <label className="block text-gray-700 font-medium mb-2">{t('recipeProcedure.procedureSteps')}</label>

      {steps.map((step, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center gap-4">
            <span className="font-medium text-gray-700 whitespace-nowrap">{t('recipeProcedure.step')} {index + 1}:</span>
            <input
              type="text"
              placeholder={t('recipeProcedure.enterDescription')}
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
        <Button variant="secondary" onClick={onBack} disabled={isSubmitting}>{t('common.back')}</Button>
        <Button onClick={handleFinalSubmit} disabled={isSubmitting}>
          {isSubmitting ? (isEditMode ? t('recipeProcedure.updating') : t('recipeProcedure.creating')) : (isEditMode ? t('recipeProcedure.update') : t('recipeProcedure.create'))}
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
        title={t('common.validationError')}
        message={`${errorMessage}\n\n${Object.entries(errorDetails)
          .map(([key, value]) => `• ${value}`)
          .join('\n')}`}
        isAlert={true}
        okText={t('common.close')}
      />

      {/* Success Modal */}
      <ConfirmationModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push('/mainRecipes');
        }}
        title={t('common.success')}
        message={isEditMode ? t('recipeProcedure.updateSuccess') : t('recipeProcedure.createSuccess')}
        isAlert={true}
        okText={t('common.ok')}
      />
    </div>
  );
}