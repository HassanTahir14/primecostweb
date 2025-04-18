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
  const [foodCostBudget, setFoodCostBudget] = useState(initialData.foodCostBudget || '');
  const [foodCostActual, setFoodCostActual] = useState(initialData.foodCostActual || ''); // Placeholder for calculation
  const [idealSellingPrice, setIdealSellingPrice] = useState(initialData.idealSellingPrice || ''); // Placeholder for calculation
  const [costPerPortion, setCostPerPortion] = useState(initialData.costPerPortion || ''); // Placeholder for calculation
  const [costPerRecipe, setCostPerRecipe] = useState(initialData.costPerRecipe || ''); // Placeholder for calculation
  const [marginPerPortion, setMarginPerPortion] = useState(initialData.marginPerPortion || ''); // Placeholder for calculation

  // Add calculation logic in useEffect or when dependencies change
  useEffect(() => {
    // Example: Calculate Cost Per Portion, Cost Per Recipe, Margin etc.
    // This would depend on the ingredients added in the previous step
    // const calculatedCostPerRecipe = initialData.ingredients?.reduce((sum, ing) => sum + ing.cost, 0) || 0;
    // setCostPerRecipe(calculatedCostPerRecipe.toFixed(2));
    // setCostPerPortion((calculatedCostPerRecipe / (initialData.portions || 1)).toFixed(2));
    setFoodCostActual('30'); // Placeholder
    setIdealSellingPrice('15.00'); // Placeholder
    setCostPerPortion('4.50'); // Placeholder
    setCostPerRecipe('22.50'); // Placeholder
    setMarginPerPortion('10.50'); // Placeholder

  }, [initialData]);

  const handleNextClick = () => {
    // Log the costing data for debugging
    console.log('Costing data being passed:', {
      menuPrice,
      foodCostBudget,
      foodCostActual,
      idealSellingPrice,
      costPerPortion,
      costPerRecipe,
      marginPerPortion
    });
    
    onNext({ 
      menuPrice, 
      foodCostBudget, 
      foodCostActual, 
      idealSellingPrice, 
      costPerPortion, 
      costPerRecipe, 
      marginPerPortion 
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Recipe Costing</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Menu Price</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">USD</span>
              <input 
                type="number" 
                placeholder="Enter value" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B] pl-12"
                value={menuPrice}
                onChange={(e) => setMenuPrice(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">Food Cost % Budget</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">%</span>
              <input 
                type="number" 
                placeholder="Enter cost budget in percentage (1-100%)" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B] pl-8"
                value={foodCostBudget}
                onChange={(e) => setFoodCostBudget(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Food Cost % Actual</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">%</span>
              <input 
                type="number" 
                placeholder="foodCostActualFieldRequired" 
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 pl-8" 
                value={foodCostActual}
                readOnly 
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Ideal selling price</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">USD</span>
              <input 
                type="number" 
                placeholder="idealSellingPriceFieldRequired" 
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 pl-12" 
                value={idealSellingPrice}
                readOnly 
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
           <div>
            <label className="block text-gray-700 font-medium mb-2">Cost Per Portion</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">USD</span>
              <input 
                type="number" 
                placeholder="costPerPortionFieldRequired" 
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 pl-12" 
                value={costPerPortion}
                readOnly 
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Cost Per Recipe</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">USD</span>
              <input 
                type="number" 
                placeholder="costPerRecipeFieldRequired" 
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 pl-12" 
                value={costPerRecipe}
                readOnly 
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Margin Per Portion</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">USD</span>
              <input 
                type="number" 
                placeholder="marginPerPortionFieldRequired" 
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 pl-12" 
                value={marginPerPortion}
                readOnly 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <Button size="lg" onClick={handleNextClick}>Next</Button>
      </div>
    </div>
  );
} 