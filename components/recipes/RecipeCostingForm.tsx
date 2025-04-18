'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/common/button';

interface RecipeCostingFormProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData: any;
}

export default function RecipeCostingForm({ onNext, onBack, initialData }: RecipeCostingFormProps) {
  const [menuPrice, setMenuPrice] = useState(initialData.menuPrice?.toString() || '');
  const [foodCostBudget, setFoodCostBudget] = useState(initialData.foodCostBudget?.toString() || '');
  const [foodCostActual, setFoodCostActual] = useState(initialData.foodCostActual?.toString() || '');
  const [idealSellingPrice, setIdealSellingPrice] = useState(initialData.idealSellingPrice?.toString() || '');
  const [costPerPortion, setCostPerPortion] = useState(initialData.costPerPortion?.toString() || '');
  const [costPerRecipe, setCostPerRecipe] = useState(initialData.costPerRecipe?.toString() || '');
  const [marginPerPortion, setMarginPerPortion] = useState(initialData.marginPerPortion?.toString() || '');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (menuPrice && costPerPortion) {
      const actualPercent = (parseFloat(costPerPortion) / parseFloat(menuPrice)) * 100;
      setFoodCostActual(actualPercent.toFixed(2));

      const margin = parseFloat(menuPrice) - parseFloat(costPerPortion);
      setMarginPerPortion(margin.toFixed(2));
    }

    if (foodCostBudget && costPerPortion) {
      const idealPrice = parseFloat(costPerPortion) / (parseFloat(foodCostBudget) / 100);
      setIdealSellingPrice(idealPrice.toFixed(2));
    }

    if (costPerPortion && initialData.portions) {
      const recipeCost = parseFloat(costPerPortion) * parseInt(initialData.portions);
      setCostPerRecipe(recipeCost.toFixed(2));
    }
  }, [menuPrice, costPerPortion, foodCostBudget, initialData.portions]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!menuPrice) {
      newErrors.menuPrice = 'Menu Price is required.';
    } else if (parseFloat(menuPrice) <= 0) {
      newErrors.menuPrice = 'Must be greater than 0.';
    }

    if (!foodCostBudget) {
      newErrors.foodCostBudget = 'Food Cost % Budget is required.';
    } else if (parseFloat(foodCostBudget) <= 0) {
      newErrors.foodCostBudget = 'Must be greater than 0.';
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
      menuPrice: parseFloat(menuPrice),
      foodCostBudget: parseFloat(foodCostBudget),
      foodCostActual: parseFloat(foodCostActual),
      idealSellingPrice: parseFloat(idealSellingPrice),
      costPerPortion: parseFloat(costPerPortion),
      costPerRecipe: parseFloat(costPerRecipe),
      marginPerPortion: parseFloat(marginPerPortion)
    };
    onNext(costingData);
  };

  const inputClasses = "w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B]";
  const errorClasses = "text-red-500 text-sm mt-1";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Recipe Costing</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Menu Price */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Menu Price</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
            <input
              type="number"
              className={`${inputClasses} pl-8 ${errors.menuPrice ? 'border-red-500' : 'border-gray-300'}`}
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
              className={`${inputClasses} pl-8 ${errors.foodCostBudget ? 'border-red-500' : 'border-gray-300'}`}
              value={foodCostBudget}
              onChange={(e) => setFoodCostBudget(e.target.value)}
            />
          </div>
          {errors.foodCostBudget && <p className={errorClasses}>{errors.foodCostBudget}</p>}
        </div>

        {/* Cost Per Portion */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Cost Per Portion</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
            <input
              type="number"
              className={`${inputClasses} pl-8 ${errors.costPerPortion ? 'border-red-500' : 'border-gray-300'}`}
              value={costPerPortion}
              onChange={(e) => setCostPerPortion(e.target.value)}
            />
          </div>
          {errors.costPerPortion && <p className={errorClasses}>{errors.costPerPortion}</p>}
        </div>

        {/* Food Cost % Actual (Calculated) */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Food Cost % Actual</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">%</span>
            <input
              type="number"
              className={`${inputClasses} pl-8 bg-gray-100 border-gray-300`}
              value={foodCostActual}
              readOnly
            />
          </div>
        </div>

        {/* Ideal Selling Price (Calculated) */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Ideal Selling Price</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
            <input
              type="number"
              className={`${inputClasses} pl-8 bg-gray-100 border-gray-300`}
              value={idealSellingPrice}
              readOnly
            />
          </div>
        </div>

        {/* Cost Per Recipe (Calculated) */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Cost Per Recipe</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
            <input
              type="number"
              className={`${inputClasses} pl-8 bg-gray-100 border-gray-300`}
              value={costPerRecipe}
              readOnly
            />
          </div>
        </div>

        {/* Margin Per Portion (Calculated) */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Margin Per Portion</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
            <input
              type="number"
              className={`${inputClasses} pl-8 bg-gray-100 border-gray-300`}
              value={marginPerPortion}
              readOnly
            />
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
