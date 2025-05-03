'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/common/button';
import { fetchAllItems } from '@/store/itemsSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { useUnits } from '@/hooks/useUnits';

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
  unitId: number | null;
}

interface RecipeIngredientsFormProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData: any;
}

export default function RecipeIngredientsForm({ onNext, onBack, initialData }: RecipeIngredientsFormProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialData.ingredients || []);
  const [selectedIngredientIndex, setSelectedIngredientIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [yieldPercent, setYieldPercent] = useState('');
  const [apUsdUnit, setApUsdUnit] = useState('');
  const [epUsdUnit, setEpUsdUnit] = useState('');
  const [recipeCost, setRecipeCost] = useState(0.00);
  const [itemList, setItemList] = useState<any[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);

  const { units } = useUnits();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchAllItems({
      page: 0, 
        size: 200000, 
        searchQuery: '',
        sortBy: 'name',
        direction: 'asc'
    }))
      .unwrap()
      .then((res) => {
        // Filter items to only show those with quantity > 0 in any branch
        const availableItems = res.itemList.filter((item: any) => {
          return item.branchDetails.some((branch: any) => branch.quantity > 0);
        });
        setItemList(availableItems);
      });
  }, [dispatch]);

  // Update available units when item changes
  useEffect(() => {
    if (item) {
      const selectedItem = itemList.find(i => i.name.split('@')[0] === item);
      if (selectedItem) {
        // Get primary and secondary units for the selected item
        const primaryUnit = units.find(u => u.unitOfMeasurementId === selectedItem.primaryUnitId);
        const secondaryUnit = units.find(u => u.unitOfMeasurementId === selectedItem.secondaryUnitId);
        
        const availableUnitsList = [];
        if (primaryUnit) availableUnitsList.push(primaryUnit);
        if (secondaryUnit) availableUnitsList.push(secondaryUnit);
        
        setAvailableUnits(availableUnitsList);
        
        // Set default unit to primary unit
        if (primaryUnit) {
          setSelectedUnitId(primaryUnit.unitOfMeasurementId);
        }
      }
    }
  }, [item, itemList, units]);

  // Calculate AP USD/Unit based on selected unit
  useEffect(() => {
    if (item && selectedUnitId) {
      const selectedItem = itemList.find(i => i.name.split('@')[0] === item);
      if (selectedItem) {
        const basePrice = selectedItem.purchaseCostWithoutVat;
        let calculatedPrice = basePrice;

        // If selected unit is secondary unit, adjust price based on conversion
        if (selectedUnitId === selectedItem.secondaryUnitId) {
          calculatedPrice = basePrice / selectedItem.secondaryUnitValue;
        }

        setApUsdUnit(calculatedPrice.toFixed(4));
      }
    }
  }, [item, selectedUnitId, itemList]);

  // Calculate EP USD/Unit based on yield percentage
  useEffect(() => {
    if (apUsdUnit && yieldPercent) {
      const yieldValue = parseFloat(yieldPercent);
      if (yieldValue > 0) {
        const calculatedEpUsd = parseFloat(apUsdUnit) / (yieldValue / 100);
        setEpUsdUnit(calculatedEpUsd.toFixed(4));
      }
    }
  }, [apUsdUnit, yieldPercent]);

  // Calculate recipe cost
  useEffect(() => {
    if (quantity && epUsdUnit) {
      const calculatedCost = parseFloat(quantity) * parseFloat(epUsdUnit);
      setRecipeCost(calculatedCost);
    }
  }, [quantity, epUsdUnit]);

  const resetForm = () => {
    setItem('');
    setQuantity('');
    setYieldPercent('');
    setApUsdUnit('');
    setEpUsdUnit('');
    setRecipeCost(0.00);
    setErrors({});
    setSelectedIngredientIndex(null);
    setShowForm(false);
    setSelectedUnitId(null);
    setAvailableUnits([]);
  };

  const handleEditIngredient = (index: number) => {
    const ingredient = ingredients[index];
    const [itemName] = ingredient.itemName.split('@');
    
    setItem(itemName);
    setQuantity(ingredient.quantity.toString());
    setYieldPercent(ingredient.yieldPercentage.toString());
    setApUsdUnit(ingredient.apUsdUnit.toString());
    setEpUsdUnit(ingredient.epUsdUnit.toString());
    setRecipeCost(ingredient.recipeCost);
    setSelectedUnitId(ingredient.unitId || null);
    
    setSelectedIngredientIndex(index);
    setShowForm(true);
  };

  const handleDeleteIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};

    if (!item) newErrors.item = 'Item is required';
    if (!quantity || Number(quantity) <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    if (!yieldPercent || Number(yieldPercent) <= 0) newErrors.yieldPercent = 'Yield % must be greater than 0';
    if (apUsdUnit === '' || Number(apUsdUnit) < 0) newErrors.apUsdUnit = 'AP USD / Unit must be 0 or greater';
    if (epUsdUnit === '' || Number(epUsdUnit) < 0) newErrors.epUsdUnit = 'EP USD / Unit must be 0 or greater';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveIngredient = () => {
    if (!validateFields()) return;

    const selectedItem = itemList.find(i => i.name.split('@')[0] === item);
    const [, itemType] = selectedItem?.name.split('@') || [];
    const selectedUnit = units.find(u => u.unitOfMeasurementId === selectedUnitId);
    
    const updatedIngredient = {
      id: selectedIngredientIndex !== null ? ingredients[selectedIngredientIndex].id : Date.now(),
      item,
      itemName: `${item}@${itemType || 'Solid Item'}`,
      quantity: Number(quantity),
      yieldPercentage: Number(yieldPercent),
      apUsdUnit: Number(apUsdUnit),
      epUsdUnit: Number(epUsdUnit),
      unit: selectedUnit?.unitName || 'KG',
      weight: selectedUnit?.unitName || 'KG',
      volume: null,
      recipeCost: recipeCost,
      unitId: selectedUnitId
    };

    if (selectedIngredientIndex !== null) {
      // Update existing ingredient
      setIngredients(ingredients.map((ing, index) => 
        index === selectedIngredientIndex ? updatedIngredient : ing
      ));
    } else {
      // Add new ingredient
      setIngredients([...ingredients, updatedIngredient]);
    }

    resetForm();
  };

  const handleNextClick = () => {
    onNext({ 
      ...initialData, // Preserve all previous data
      ingredients 
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Recipe Ingredients</h2>

      {/* Ingredients List */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Ingredients List</h3>
          <Button 
            onClick={() => setShowForm(true)} 
            disabled={showForm}
          >
            Add Ingredient
          </Button>
        </div>

        {ingredients.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No ingredients added yet</p>
        ) : (
          <div className="space-y-4">
            {ingredients.map((ingredient, index) => (
              <div key={ingredient.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{ingredient.itemName.split('@')[0]}</p>
                  <p className="text-sm text-gray-600">
                    Quantity: {ingredient.quantity} {ingredient.unit} | 
                    Yield: {ingredient.yieldPercentage}% | 
                    Cost: USD {ingredient.recipeCost.toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditIngredient(index)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteIngredient(index)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ingredient Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {selectedIngredientIndex !== null ? 'Edit Ingredient' : 'Add New Ingredient'}
            </h3>
            <Button variant="outline" size="sm" onClick={resetForm}>
              Cancel
            </Button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Select Item */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Select Item</label>
              <select
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B] ${errors.item ? 'border-red-500' : 'border-gray-300'}`}
                value={item}
                onChange={(e) => setItem(e.target.value)}
              >
                <option value="">Select an item</option>
                {itemList.map((item: any) => (
                  <option key={item.itemId} value={item.name.split('@')[0]}>
                    {item.name.split('@')[0]}
                  </option>
                ))}
              </select>
              {errors.item && <p className="text-red-500 text-sm mt-1">{errors.item}</p>}
            </div>

            {/* Unit Selection */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Unit</label>
              <select
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B] ${errors.unit ? 'border-red-500' : 'border-gray-300'}`}
                value={selectedUnitId || ''}
                onChange={(e) => setSelectedUnitId(Number(e.target.value))}
                disabled={!item}
              >
                <option value="">Select a unit</option>
                {availableUnits.map((unit) => (
                  <option key={unit.unitOfMeasurementId} value={unit.unitOfMeasurementId}>
                    {unit.unitName} - {unit.unitDescription}
                  </option>
                ))}
              </select>
              {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Quantity</label>
              <input
                type="number"
                placeholder="Enter value"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B] ${errors.quantity ? 'border-red-500' : 'border-gray-300'}`}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
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
                  className={`w-full p-3 border rounded-lg pl-8 focus:outline-none focus:ring-2 focus:ring-[#00997B] ${errors.yieldPercent ? 'border-red-500' : 'border-gray-300'}`}
                  value={yieldPercent}
                  onChange={(e) => setYieldPercent(e.target.value)}
                />
              </div>
              {errors.yieldPercent && <p className="text-red-500 text-sm mt-1">{errors.yieldPercent}</p>}
            </div>

            {/* AP USD / Unit */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">AP USD / Unit</label>
              <input
                type="number"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B] ${errors.apUsdUnit ? 'border-red-500' : 'border-gray-300'}`}
                value={apUsdUnit}
                onChange={(e) => setApUsdUnit(e.target.value)}
                readOnly
              />
              {errors.apUsdUnit && <p className="text-red-500 text-sm mt-1">{errors.apUsdUnit}</p>}
            </div>

            {/* EP USD / Unit */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">EP USD / Unit</label>
              <input
                type="number"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B] ${errors.epUsdUnit ? 'border-red-500' : 'border-gray-300'} bg-gray-100`}
                value={epUsdUnit}
                onChange={(e) => setEpUsdUnit(e.target.value)}
                readOnly
                disabled
              />
              {errors.epUsdUnit && <p className="text-red-500 text-sm mt-1">{errors.epUsdUnit}</p>}
            </div>

            {/* Recipe Cost */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Recipe cost</label>
              <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100">
                USD {recipeCost.toFixed(2)}
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full mt-4" 
              onClick={handleSaveIngredient}
            >
              {selectedIngredientIndex !== null ? 'Update Ingredient' : 'Add Ingredient'}
            </Button>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <Button 
          size="lg" 
          onClick={handleNextClick}
          disabled={ingredients.length === 0}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
