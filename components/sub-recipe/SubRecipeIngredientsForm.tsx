'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/common/button';
import { fetchAllItems } from '@/store/itemsSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';

interface Ingredient {
  id: number;
  itemName: string;
  quantity: number;
  weight: string;
  volume: string | null;
  unit: string;
  yieldPercentage: number;
  recipeCost: number;
  apUsdUnit: number;
  epUsdUnit: number;
  item?: string;
}

interface RecipeIngredientsFormProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData: any;
}

export default function SubRecipeIngredientsForm({ onNext, onBack, initialData }: RecipeIngredientsFormProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialData.ingredients || []);
  const [currentIngredient, setCurrentIngredient] = useState<Partial<Ingredient>>({
    itemName: '',
    quantity: 0,
    yieldPercentage: 0,
    apUsdUnit: 0,
    epUsdUnit: 0,
    recipeCost: 0
  });
  const [itemList, setItemList] = useState<any[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchAllItems({}))
      .unwrap()
      .then((res) => {
        setItemList(res.itemList || []);
      });
  }, [dispatch]);

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};

    if (!currentIngredient.itemName) newErrors.itemName = 'Item is required';
    if (!currentIngredient.quantity || currentIngredient.quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    if (!currentIngredient.yieldPercentage || currentIngredient.yieldPercentage <= 0) newErrors.yieldPercentage = 'Yield % must be greater than 0';
    if (currentIngredient.apUsdUnit === undefined || currentIngredient.apUsdUnit < 0) newErrors.apUsdUnit = 'AP USD / Unit must be 0 or greater';
    if (currentIngredient.epUsdUnit === undefined || currentIngredient.epUsdUnit < 0) newErrors.epUsdUnit = 'EP USD / Unit must be 0 or greater';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateIngredientCost = (qty: number, epUsd: number) => {
    return qty * epUsd;
  };

  const handleAddIngredient = () => {
    if (!validateFields()) return;

    const selectedItem = itemList.find(i => i.name === currentIngredient.itemName);
    const cost = calculateIngredientCost(
      currentIngredient.quantity || 0,
      currentIngredient.epUsdUnit || 0
    );
    
    const newIngredient: Ingredient = {
      id: Date.now(),
      itemName: currentIngredient.itemName || '',
      quantity: currentIngredient.quantity || 0,
      yieldPercentage: currentIngredient.yieldPercentage || 0,
      apUsdUnit: currentIngredient.apUsdUnit || 0,
      epUsdUnit: currentIngredient.epUsdUnit || 0,
      unit: selectedItem?.unit || 'KG',
      weight: selectedItem?.weight || 'KG',
      volume: selectedItem?.volume || null,
      recipeCost: cost
    };

    setIngredients([...ingredients, newIngredient]);
    setCurrentIngredient({
      itemName: '',
      quantity: 0,
      yieldPercentage: 0,
      apUsdUnit: 0,
      epUsdUnit: 0,
      recipeCost: 0
    });
    setErrors({});
  };

  const handleRemoveIngredient = (id: number) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const handleNextClick = () => {
    if (ingredients.length === 0) {
      setErrors({ ingredients: 'At least one ingredient is required' });
      return;
    }
    onNext({ ingredients });
  };

  const totalRecipeCost = ingredients.reduce((sum, ing) => sum + ing.recipeCost, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Add Ingredients</h2>

      {/* Current Ingredient Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
        {/* Select Item */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Select Item</label>
          <select
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B] ${errors.itemName ? 'border-red-500' : 'border-gray-300'}`}
            value={currentIngredient.itemName}
            onChange={(e) => setCurrentIngredient({ ...currentIngredient, itemName: e.target.value })}
          >
            <option value="">Select an item</option>
            {itemList.map((item: any) => (
              <option key={item.itemId} value={item.name}>{item.name}</option>
            ))}
          </select>
          {errors.itemName && <p className="text-red-500 text-sm mt-1">{errors.itemName}</p>}
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Quantity</label>
          <input
            type="number"
            placeholder="Enter value"
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B] ${errors.quantity ? 'border-red-500' : 'border-gray-300'}`}
            value={currentIngredient.quantity || ''}
            onChange={(e) => setCurrentIngredient({ ...currentIngredient, quantity: Number(e.target.value) })}
          />
          {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
        </div>

        {/* Yield Percent */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Yield %</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">%</span>
            <input
              type="number"
              placeholder="Enter value"
              className={`w-full p-3 border rounded-lg pl-8 focus:outline-none focus:ring-2 focus:ring-[#00997B] ${errors.yieldPercentage ? 'border-red-500' : 'border-gray-300'}`}
              value={currentIngredient.yieldPercentage || ''}
              onChange={(e) => setCurrentIngredient({ ...currentIngredient, yieldPercentage: Number(e.target.value) })}
            />
          </div>
          {errors.yieldPercentage && <p className="text-red-500 text-sm mt-1">{errors.yieldPercentage}</p>}
        </div>

        {/* AP USD / Unit */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">AP USD / Unit</label>
          <input
            type="number"
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B] ${errors.apUsdUnit ? 'border-red-500' : 'border-gray-300'}`}
            value={currentIngredient.apUsdUnit || ''}
            onChange={(e) => setCurrentIngredient({ ...currentIngredient, apUsdUnit: Number(e.target.value) })}
          />
          {errors.apUsdUnit && <p className="text-red-500 text-sm mt-1">{errors.apUsdUnit}</p>}
        </div>

        {/* EP USD / Unit */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">EP USD / Unit</label>
          <input
            type="number"
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B] ${errors.epUsdUnit ? 'border-red-500' : 'border-gray-300'}`}
            value={currentIngredient.epUsdUnit || ''}
            onChange={(e) => setCurrentIngredient({ ...currentIngredient, epUsdUnit: Number(e.target.value) })}
          />
          {errors.epUsdUnit && <p className="text-red-500 text-sm mt-1">{errors.epUsdUnit}</p>}
        </div>

        <div className="md:col-span-2">
          <Button size="lg" onClick={handleAddIngredient} className="w-full">Add Ingredient</Button>
        </div>
      </div>

      {/* Added Ingredients List */}
      {ingredients.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Added Ingredients</h3>
          <div className="space-y-4">
            {ingredients.map((ingredient) => (
              <div key={ingredient.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                <div>
                  <p className="font-medium">{ingredient.itemName}</p>
                  <p className="text-sm text-gray-600">
                    Quantity: {ingredient.quantity} {ingredient.unit} | 
                    Yield: {ingredient.yieldPercentage}% | 
                    Cost: USD {ingredient.recipeCost.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveIngredient(ingredient.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total Recipe Cost */}
      <div className="mt-6 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold">Total Recipe Cost</h3>
        <p className="text-2xl font-bold text-[#00997B]">USD {totalRecipeCost.toFixed(2)}</p>
      </div>

      {errors.ingredients && (
        <p className="text-red-500 text-sm mt-2">{errors.ingredients}</p>
      )}

      <div className="flex justify-between mt-8">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <Button size="lg" onClick={handleNextClick}>Next</Button>
      </div>
    </div>
  );
}
