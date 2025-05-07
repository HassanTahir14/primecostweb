'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/common/button';

interface RecipeCostingFormProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData: any;
  onSave?: (data: any) => void;
}

export default function RecipeCostingForm({ onNext, onBack, initialData, onSave }: RecipeCostingFormProps) {
  // Get total ingredients cost from previous step if available
  const totalIngredientsCost = calculateTotalIngredientsCost(initialData.ingredients || []);
  
  const [menuPrice, setMenuPrice] = useState(initialData.menuPrice || '');
  const [foodCostBudgetPercent, setFoodCostBudgetPercent] = useState(initialData.foodCostBudget || '');
  const [costPerPortion, setCostPerPortion] = useState('');
  const [foodCostActualPercent, setFoodCostActualPercent] = useState('');
  const [idealSellingPrice, setIdealSellingPrice] = useState('');
  const [costPerRecipe, setCostPerRecipe] = useState('');
  const [marginPerPortion, setMarginPerPortion] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Calculate cost per portion based on ingredients cost and portions
  useEffect(() => {
    if (totalIngredientsCost > 0 && initialData.portions && parseInt(initialData.portions) > 0) {
      const perPortion = totalIngredientsCost / parseInt(initialData.portions);
      setCostPerPortion(perPortion.toString());
    }
  }, [totalIngredientsCost, initialData.portions]);

  // Calculate other values based on inputs
  useEffect(() => {
    // Cost per recipe
    if (costPerPortion && initialData.portions) {
      const recipeCost = parseFloat(costPerPortion) * parseInt(initialData.portions);
      setCostPerRecipe(recipeCost.toString());
    }

    // Food cost % actual
    if (menuPrice && costPerPortion) {
      const actualPercent = (parseFloat(costPerPortion) / parseFloat(menuPrice)) * 100;
      setFoodCostActualPercent(actualPercent.toFixed(2));
    }

    // Margin per portion
    if (menuPrice && costPerPortion) {
      const margin = parseFloat(menuPrice) - parseFloat(costPerPortion);
      setMarginPerPortion(margin.toString());
      
      // Check for negative margin and set error
      if (margin < 0) {
        setErrors(prev => ({ ...prev, marginPerPortion: 'Margin cannot be negative. Please increase the menu price.' }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.marginPerPortion;
          return newErrors;
        });
      }
    }

    // Ideal selling price
    if (foodCostBudgetPercent && costPerPortion) {
      const idealPrice = parseFloat(costPerPortion) / (parseFloat(foodCostBudgetPercent) / 100);
      setIdealSellingPrice(idealPrice.toFixed(2));
    }

    // Save the updated form data
    if (onSave) {
      onSave({
        ...initialData,
        menuPrice,
        foodCostBudget: foodCostBudgetPercent,
        foodCostActual: foodCostActualPercent,
        idealSellingPrice,
        costPerPortion,
        costPerRecipe,
        marginPerPortion
      });
    }
  }, [menuPrice, costPerPortion, foodCostBudgetPercent, initialData.portions, onSave]);

  // Calculate total cost from ingredients
  function calculateTotalIngredientsCost(ingredients: any[]) {
    return ingredients.reduce((total, ingredient) => {
      return total + (ingredient.recipeCost || 0);
    }, 0);
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!menuPrice) {
      newErrors.menuPrice = 'Menu Price is required.';
    } else if (parseFloat(menuPrice) <= 0) {
      newErrors.menuPrice = 'Must be greater than 0.';
    }

    if (!foodCostBudgetPercent) {
      newErrors.foodCostBudgetPercent = 'Food Cost % Budget is required.';
    } else if (parseFloat(foodCostBudgetPercent) <= 0) {
      newErrors.foodCostBudgetPercent = 'Must be greater than 0.';
    } else if (parseFloat(foodCostBudgetPercent) > 100) {
      newErrors.foodCostBudgetPercent = 'Must be between 0 and 100.';
    }

    if (marginPerPortion && parseFloat(marginPerPortion) < 0) {
      newErrors.marginPerPortion = 'Margin cannot be negative. Please increase the menu price.';
    }

    if (foodCostActualPercent && (parseFloat(foodCostActualPercent) < 0 || parseFloat(foodCostActualPercent) > 100)) {
      newErrors.foodCostActualPercent = 'Must be between 0 and 100.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const costingData = {
      ...initialData, // Preserve all previous data
      menuPrice,
      foodCostBudget: foodCostBudgetPercent,
      foodCostActual: foodCostActualPercent,
      idealSellingPrice,
      costPerPortion,
      costPerRecipe,
      marginPerPortion
    };
    onNext(costingData);
  };

  const inputClasses = "w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B]";
  const errorClasses = "text-red-500 text-sm mt-1";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Recipe Costing</h2>

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
                value={menuPrice}
                onChange={(e) => setMenuPrice(e.target.value)}
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
                className={`${inputClasses} pl-8 border-gray-300 ${errors.foodCostBudgetPercent ? 'border-red-500' : ''}`}
                value={foodCostBudgetPercent}
                onChange={(e) => setFoodCostBudgetPercent(e.target.value)}
              />
            </div>
            {errors.foodCostBudgetPercent && <p className={errorClasses}>{errors.foodCostBudgetPercent}</p>}
          </div>

          {/* Food Cost % Actual (read-only) */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Food Cost % Actual</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">%</span>
              <input
                type="text"
                readOnly
                className={`w-full p-3 border ${errors.foodCostActualPercent ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-gray-100 pl-8`}
                value={foodCostActualPercent}
              />
            </div>
            {errors.foodCostActualPercent && <p className={errorClasses}>{errors.foodCostActualPercent}</p>}
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
                value={idealSellingPrice}
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
                value={parseFloat(costPerPortion).toFixed(2)}
              />
            </div>
          </div>

          {/* Cost Per Recipe (read-only) */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Cost Per Recipe</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
              <input
                type="text"
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 pl-8"
                value={parseFloat(costPerRecipe).toFixed(2)}
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
                value={parseFloat(marginPerPortion).toFixed(2)}
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