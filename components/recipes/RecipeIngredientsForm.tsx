'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/button';

interface RecipeIngredientsFormProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData: any;
}

export default function RecipeIngredientsForm({ onNext, onBack, initialData }: RecipeIngredientsFormProps) {
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [yieldPercent, setYieldPercent] = useState('');
  const [apUsdUnit, setApUsdUnit] = useState('');
  const [epUsdUnit, setEpUsdUnit] = useState('');
  const [recipeCost, setRecipeCost] = useState(0.00);

  // Placeholder for added ingredients list
  const [ingredients, setIngredients] = useState(initialData.ingredients || []);

  const handleAddIngredient = () => {
    const newIngredient = {
      id: Date.now(), // Simple unique ID
      item,
      quantity,
      yieldPercent,
      apUsdUnit,
      epUsdUnit,
      cost: calculateIngredientCost() // Assuming a calculation function exists
    };
    setIngredients([...ingredients, newIngredient]);
    // Reset form fields
    setItem('');
    setQuantity('');
    setYieldPercent('');
    setApUsdUnit('');
    setEpUsdUnit('');
    setRecipeCost(prev => prev + newIngredient.cost);
  };

  const calculateIngredientCost = () => {
    // Add actual cost calculation logic here based on inputs
    return 5.00; // Placeholder
  };

  const handleNextClick = () => {
    onNext({ ingredients });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Add Ingredients</h2>
      
      <div>
        <label className="block text-gray-700 font-medium mb-2">Select Item</label>
        <input 
          type="text"
          placeholder="Enter value" 
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B]"
          value={item}
          onChange={(e) => setItem(e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-gray-700 font-medium mb-2">Quantity</label>
        <input 
          type="number" 
          placeholder="Enter value" 
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B]"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-gray-700 font-medium mb-2">Yield %</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">%</span>
          <input 
            type="number" 
            placeholder="Enter value" 
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B] pl-8"
            value={yieldPercent}
            onChange={(e) => setYieldPercent(e.target.value)}
          />
        </div>
      </div>
      
      <div>
        <label className="block text-gray-700 font-medium mb-2">AP USD / Unit</label>
        <input 
          type="number" 
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B]"
          value={apUsdUnit}
          onChange={(e) => setApUsdUnit(e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-gray-700 font-medium mb-2">EP USD / Unit</label>
        <input 
          type="number" 
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B]"
          value={epUsdUnit}
          onChange={(e) => setEpUsdUnit(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Recipe cost</label>
        <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100">
          USD {recipeCost.toFixed(2)}
        </div>
      </div>

      <div className="flex justify-start">
        <Button onClick={handleAddIngredient}>Add</Button>
      </div>

      {/* Optional: Display added ingredients list here */}

      <div className="flex justify-between mt-8">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <Button onClick={handleNextClick}>Next</Button>
      </div>
    </div>
  );
} 