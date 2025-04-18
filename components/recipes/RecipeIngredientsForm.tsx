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

export default function RecipeIngredientsForm({ onNext, onBack, initialData }: RecipeIngredientsFormProps) {
  const [item, setItem] = useState(initialData.ingredients?.[0]?.itemName || '');
  const [quantity, setQuantity] = useState(initialData.ingredients?.[0]?.quantity?.toString() || '');
  const [yieldPercent, setYieldPercent] = useState(initialData.ingredients?.[0]?.yieldPercentage?.toString() || '');
  const [apUsdUnit, setApUsdUnit] = useState(initialData.ingredients?.[0]?.apUsdUnit?.toString() || '');
  const [epUsdUnit, setEpUsdUnit] = useState(initialData.ingredients?.[0]?.epUsdUnit?.toString() || '');
  const [recipeCost, setRecipeCost] = useState(initialData.ingredients?.[0]?.recipeCost || 0.00);
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

    if (!item) newErrors.item = 'Item is required';
    if (!quantity || Number(quantity) <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    if (!yieldPercent || Number(yieldPercent) <= 0) newErrors.yieldPercent = 'Yield % must be greater than 0';
    if (apUsdUnit === '' || Number(apUsdUnit) < 0) newErrors.apUsdUnit = 'AP USD / Unit must be 0 or greater';
    if (epUsdUnit === '' || Number(epUsdUnit) < 0) newErrors.epUsdUnit = 'EP USD / Unit must be 0 or greater';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateIngredientCost = (qty: number, epUsd: number) => {
    return qty * epUsd;
  };

  const handleNextClick = () => {
    if (!validateFields()) return;

    const selectedItem = itemList.find(i => i.name === item);
    const cost = calculateIngredientCost(Number(quantity), Number(epUsdUnit));
    
    const updatedIngredient = {
      id: initialData.ingredients?.[0]?.id || Date.now(),
      item,
      itemName: selectedItem?.name || item,
      quantity: Number(quantity),
      yieldPercentage: Number(yieldPercent),
      apUsdUnit: Number(apUsdUnit),
      epUsdUnit: Number(epUsdUnit),
      unit: selectedItem?.unit || initialData.ingredients?.[0]?.unit || 'KG',
      weight: selectedItem?.weight || initialData.ingredients?.[0]?.weight || 'KG',
      volume: selectedItem?.volume || initialData.ingredients?.[0]?.volume || null,
      recipeCost: cost
    };

    onNext({ ingredients: [updatedIngredient] });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Edit Ingredient</h2>

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
            <option key={item.itemId} value={item.name}>{item.name}</option>
          ))}
        </select>
        {errors.item && <p className="text-red-500 text-sm mt-1">{errors.item}</p>}
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
        />
        {errors.apUsdUnit && <p className="text-red-500 text-sm mt-1">{errors.apUsdUnit}</p>}
      </div>

      {/* EP USD / Unit */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">EP USD / Unit</label>
        <input
          type="number"
          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B] ${errors.epUsdUnit ? 'border-red-500' : 'border-gray-300'}`}
          value={epUsdUnit}
          onChange={(e) => setEpUsdUnit(e.target.value)}
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

      <div className="flex justify-between mt-8">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <Button size="lg" onClick={handleNextClick}>Next</Button>
      </div>
    </div>
  );
}
