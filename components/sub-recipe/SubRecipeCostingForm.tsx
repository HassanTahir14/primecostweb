'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/common/button';

interface RecipeCostingFormProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData: any;
  onSave?: (data: any) => void;
}

export default function SubRecipeCostingForm({ onNext, onBack, initialData, onSave }: RecipeCostingFormProps) {
  const [formData, setFormData] = useState({
    menuPrice: initialData.menuPrice || '',
    foodCostBudget: initialData.foodCostBudget || '',
    foodCostActual: initialData.foodCostActual || '',
    idealSellingPrice: initialData.idealSellingPrice || '',
    costPerPortion: initialData.costPerPortion || '',
    costPerRecipe: initialData.costPerRecipe || '',
    marginPerPortion: initialData.marginPerPortion || ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Calculate total ingredients cost from previous step if available
  const totalIngredientsCost = calculateTotalIngredientsCost(initialData.ingredients || []);

  // Calculate cost per portion based on ingredients cost and portions
  useEffect(() => {
    if (totalIngredientsCost > 0 && initialData.portions && parseInt(initialData.portions) > 0) {
      const perPortion = totalIngredientsCost / parseInt(initialData.portions);
      setFormData(prev => ({ ...prev, costPerPortion: perPortion.toFixed(2) }));
    }
  }, [totalIngredientsCost, initialData.portions]);

  // Calculate other values based on inputs
  useEffect(() => {
    // Cost per recipe
    if (formData.costPerPortion && initialData.portions) {
      const recipeCost = parseFloat(formData.costPerPortion) * parseInt(initialData.portions);
      setFormData(prev => ({ ...prev, costPerRecipe: recipeCost.toFixed(2) }));
    }

    // Food cost % actual
    if (formData.menuPrice && formData.costPerPortion) {
      const actualPercent = (parseFloat(formData.costPerPortion) / parseFloat(formData.menuPrice)) * 100;
      setFormData(prev => ({ ...prev, foodCostActual: actualPercent.toFixed(2) }));
    }

    // Margin per portion
    if (formData.menuPrice && formData.costPerPortion) {
      const margin = parseFloat(formData.menuPrice) - parseFloat(formData.costPerPortion);
      setFormData(prev => ({ ...prev, marginPerPortion: margin.toFixed(2) }));
      
      // Check for negative margin and set error
      if (margin < 0) {
        setErrors(prev => ({ ...prev, marginPerPortion: 'Margin cannot be negative. Please adjust menu price.' }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.marginPerPortion;
          return newErrors;
        });
      }
    }

    // Ideal selling price
    if (formData.foodCostBudget && formData.costPerPortion) {
      const idealPrice = parseFloat(formData.costPerPortion) / (parseFloat(formData.foodCostBudget) / 100);
      setFormData(prev => ({ ...prev, idealSellingPrice: idealPrice.toFixed(2) }));
    }

    // Save the updated form data
    if (onSave) {
      onSave({
        ...formData,
        recipeCode: initialData.recipeCode,
        images: initialData.images,
        newImages: initialData.newImages,
        imageIdsToRemove: initialData.imageIdsToRemove
      });
    }
  }, [formData.menuPrice, formData.costPerPortion, formData.foodCostBudget, initialData.portions, onSave]);

  // Calculate total cost from ingredients
  function calculateTotalIngredientsCost(ingredients: any[]) {
    return ingredients.reduce((total, ingredient) => {
      return total + (ingredient.recipeCost || 0);
    }, 0);
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.menuPrice) {
      newErrors.menuPrice = 'Menu Price is required';
    } else if (parseFloat(formData.menuPrice) <= 0) {
      newErrors.menuPrice = 'Menu Price must be greater than 0';
    }

    if (!formData.foodCostBudget) {
      newErrors.foodCostBudget = 'Food Cost % Budget is required';
    } else if (parseFloat(formData.foodCostBudget) <= 0) {
      newErrors.foodCostBudget = 'Food Cost % Budget must be greater than 0';
    } else if (parseFloat(formData.foodCostBudget) > 100) {
      newErrors.foodCostBudget = 'Food Cost % Budget must be between 0 and 100';
    }

    if (formData.marginPerPortion && parseFloat(formData.marginPerPortion) < 0) {
      newErrors.marginPerPortion = 'Margin cannot be negative';
    }

    if (formData.foodCostActual && (parseFloat(formData.foodCostActual) < 0 || parseFloat(formData.foodCostActual) > 100)) {
      newErrors.foodCostActual = 'Food Cost % Actual must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    onNext({
      ...formData,
      recipeCode: initialData.recipeCode,
      images: initialData.images,
      newImages: initialData.newImages,
      imageIdsToRemove: initialData.imageIdsToRemove
    });
  };

  const inputClasses = "w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B]";
  const errorClasses = "text-red-500 text-sm mt-1";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Sub Recipe Costing</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Menu Price */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Menu Price</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
              <input
                type="number"
                placeholder="Enter value"
                className={`${inputClasses} pl-8 border-gray-300 ${errors.menuPrice ? 'border-red-500' : ''}`}
                value={formData.menuPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, menuPrice: e.target.value }))}
              />
            </div>
            {errors.menuPrice && <p className={errorClasses}>{errors.menuPrice}</p>}
          </div>

          {/* Food Cost % Budget */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Food Cost % Budget</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">%</span>
              <input
                type="number"
                placeholder="Enter value"
                className={`${inputClasses} pl-8 border-gray-300 ${errors.foodCostBudget ? 'border-red-500' : ''}`}
                value={formData.foodCostBudget}
                onChange={(e) => setFormData(prev => ({ ...prev, foodCostBudget: e.target.value }))}
              />
            </div>
            {errors.foodCostBudget && <p className={errorClasses}>{errors.foodCostBudget}</p>}
          </div>

          {/* Food Cost % Actual (read-only) */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Food Cost % Actual</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">%</span>
              <input
                type="text"
                readOnly
                className={`w-full p-3 border ${errors.foodCostActual ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-gray-100 pl-8`}
                value={formData.foodCostActual}
              />
            </div>
            {errors.foodCostActual && <p className={errorClasses}>{errors.foodCostActual}</p>}
          </div>

          {/* Ideal Selling Price (read-only) */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Ideal Selling Price</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
              <input
                type="text"
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 pl-8"
                value={formData.idealSellingPrice}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Cost Per Portion (read-only) */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Cost Per Portion</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
              <input
                type="text"
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 pl-8"
                value={formData.costPerPortion}
              />
            </div>
          </div>

          {/* Cost Per Recipe (read-only) */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Cost Per Sub Recipe</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
              <input
                type="text"
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 pl-8"
                value={formData.costPerRecipe}
              />
            </div>
          </div>

          {/* Margin Per Portion (read-only) */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Margin Per Portion</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
              <input
                type="text"
                readOnly
                className={`w-full p-3 border ${errors.marginPerPortion ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-gray-100 pl-8`}
                value={formData.marginPerPortion}
              />
            </div>
            {errors.marginPerPortion && <p className={errorClasses}>{errors.marginPerPortion}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <Button size="lg" onClick={handleSubmit}>Next</Button>
      </div>
    </div>
  );
}
