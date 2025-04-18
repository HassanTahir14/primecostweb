'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/common/button';

interface RecipeCostingFormProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData: any;
}

export default function RecipeCostingForm({ onNext, onBack, initialData }: RecipeCostingFormProps) {
  const [menuPrice, setMenuPrice] = useState(initialData.menuPrice || '');
  const [foodCostBudgetPercent, setFoodCostBudgetPercent] = useState(initialData.foodCostBudgetPercent || '');
  const [foodCostActualPercent, setFoodCostActualPercent] = useState(initialData.foodCostActualPercent || '');
  const [idealSellingPrice, setIdealSellingPrice] = useState(initialData.idealSellingPrice || '');
  const [costPerPortion, setCostPerPortion] = useState(initialData.costPerPortion || '');
  const [costPerRecipe, setCostPerRecipe] = useState(initialData.costPerRecipe || '');
  const [marginPerPortion, setMarginPerPortion] = useState(initialData.marginPerPortion || '');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (menuPrice && costPerPortion) {
      const actualPercent = (parseFloat(costPerPortion) / parseFloat(menuPrice)) * 100;
      setFoodCostActualPercent(actualPercent.toFixed(2));

      const margin = parseFloat(menuPrice) - parseFloat(costPerPortion);
      setMarginPerPortion(margin.toFixed(2));
    }

    if (foodCostBudgetPercent && costPerPortion) {
      const idealPrice = parseFloat(costPerPortion) / (parseFloat(foodCostBudgetPercent) / 100);
      setIdealSellingPrice(idealPrice.toFixed(2));
    }

    if (costPerPortion && initialData.portions) {
      const recipeCost = parseFloat(costPerPortion) * parseInt(initialData.portions);
      setCostPerRecipe(recipeCost.toFixed(2));
    }
  }, [menuPrice, costPerPortion, foodCostBudgetPercent, initialData.portions]);

  const validate = () => {
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
    }

    if (!costPerPortion) {
      newErrors.costPerPortion = 'Cost Per Portion is required.';
    } else if (parseFloat(costPerPortion) <= 0) {
      newErrors.costPerPortion = 'Must be greater than 0.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const costingData = {
      menuPrice,
      foodCostBudgetPercent,
      foodCostActualPercent,
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
            <input
              type="number"
              placeholder="Enter value"
              className={`${inputClasses} border-gray-300 ${errors.menuPrice ? 'border-red-500' : ''}`}
              value={menuPrice}
              onChange={(e) => setMenuPrice(e.target.value)}
            />
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
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 pl-8"
                value={foodCostActualPercent}
              />
            </div>
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
          {/* Cost Per Portion */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Cost Per Portion</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
              <input
                type="number"
                placeholder="Enter value"
                className={`${inputClasses} pl-8 border-gray-300 ${errors.costPerPortion ? 'border-red-500' : ''}`}
                value={costPerPortion}
                onChange={(e) => setCostPerPortion(e.target.value)}
              />
            </div>
            {errors.costPerPortion && <p className={errorClasses}>{errors.costPerPortion}</p>}
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
                value={costPerRecipe}
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
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 pl-8"
                value={marginPerPortion}
              />
            </div>
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
