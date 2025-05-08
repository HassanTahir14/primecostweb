import React from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { DollarSign } from 'lucide-react';
import { getCurrencySymbol } from '@/utils/currencyUtils';

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const currencySymbol = getCurrencySymbol(currency);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex justify-between items-center">
        <span className="text-gray-700 font-medium">Currency</span>
        <div className="flex items-center gap-2">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="text-gray-600 bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer"
          >
            <option value="USD">USD</option>
            <option value="SAR">SAR</option>
            <option value="AED">AED</option>
          </select>
          <span className="text-gray-600">{currencySymbol}</span>
        </div>
      </div>
    </div>
  );
} 