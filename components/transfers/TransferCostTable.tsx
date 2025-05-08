'use client';

import Input from '@/components/common/input';

interface TransferCostTableProps {
  costs: {
    storageCostPercent: number;
    shippingCostPercent: number;
    otherLogisticsPercent: number;
  };
  onChange: (costs: any) => void;
  totalItemCost: number; // Add prop for total cost of items
}

// Define cost types
const costTypes = [
    { name: 'Storage Cost', key: 'storageCostPercent' },
    { name: 'Shipping', key: 'shippingCostPercent' },
    { name: 'Other Logistics', key: 'otherLogisticsPercent' },
];

export default function TransferCostTable({ costs, onChange, totalItemCost }: TransferCostTableProps) {
  
  const handleCostChange = (key: string, value: number) => {
    // Ensure value is between 0 and 100
    const validatedValue = Math.min(Math.max(isNaN(value) ? 0 : value, 0), 100);
    onChange({ ...costs, [key]: validatedValue });
  };

  // Calculate amounts based on totalItemCost and percentages
  const calculateTaxAmount = (percent: number) => {
    const itemTotal = totalItemCost || 0;
    return (itemTotal * (percent / 100)).toFixed(2);
  };

  const calculateTotalWithTaxes = (percent: number) => {
     const itemTotal = totalItemCost || 0;
     const tax = itemTotal * (percent / 100);
     // For this table structure, Total with Taxes probably just means the tax amount again?
     // Or should it be itemTotal + tax? Adjust logic as needed.
     // If it represents the total cost of *this specific tax line*, it's just the tax amount.
     // If it represents the *running total* including this tax, that's more complex.
     // Assuming it's just the calculated tax amount for now.
     return tax.toFixed(2);
  };

  // Calculate totals for the footer
  const totalCalculatedTaxes = costTypes.reduce((sum, type) => {
      const taxAmount = parseFloat(calculateTaxAmount(costs[type.key as keyof typeof costs] || 0));
      return sum + taxAmount;
  }, 0).toFixed(2);

  // Grand total is the sum of item costs plus all calculated tax amounts
  const grandTotal = (totalItemCost + parseFloat(totalCalculatedTaxes)).toFixed(2);

  return (
    <div className="bg-white rounded-lg shadow-sm p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-[#00997B] text-white">
            <tr>
              <th className="p-3 text-left text-sm font-semibold">Cost Type</th>
              <th className="p-3 text-left text-sm font-semibold w-24">% Value</th>
              <th className="p-3 text-left text-sm font-semibold w-32">Taxes Amount (USD)</th>
              {/* <th className="p-3 text-left text-sm font-semibold w-32">Total with Taxes (USD)</th> -- Removing this column as it seems redundant with Taxes Amount */}
            </tr>
          </thead>
          <tbody>
            {costTypes.map((type) => (
              <tr key={type.key} className="border-b">
                <td className="p-3 text-sm font-medium text-gray-700">{type.name}</td>
                <td className="p-2 align-top">
                  <div className="relative">
                    <Input 
                      type="number"
                      value={costs[type.key as keyof typeof costs] || ''} 
                      onChange={(e) => handleCostChange(type.key, parseFloat(e.target.value))}
                      placeholder="0.00"
                      className="pr-6"
                      step="0.01"
                      min="0"
                      max="100"
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 pointer-events-none">%</span>
                  </div>
                </td>
                <td className="p-2 align-top">
                  <Input 
                    value={calculateTaxAmount(costs[type.key as keyof typeof costs] || 0)}
                    readOnly 
                    placeholder="0.00"
                    // prefix="USD" - Render prefix manually if Input doesn't support it well
                    className="bg-gray-100"
                  />
                </td>
                 {/* Removing the seemingly redundant "Total with Taxes" column
                 <td className="p-2 align-top">
                   <Input 
                    value={calculateTotalWithTaxes(costs[type.key as keyof typeof costs] || 0)}
                    readOnly 
                    placeholder="0.00"
                    // prefix="USD" 
                     className="bg-gray-100"
                  />
                </td> 
                */}
              </tr>
            ))}
            {/* Footer Row Updated */}
            <tr className="bg-gray-100 font-semibold">
                <td colSpan={2} className="p-3 text-right text-sm text-gray-800">Total Item Cost:</td>
                <td className="p-3 text-right text-sm text-gray-800">{totalItemCost.toFixed(2)}</td>
            </tr>
             <tr className="bg-gray-100 font-semibold">
                <td colSpan={2} className="p-3 text-right text-sm text-gray-800">Total Transfer Taxes:</td>
                <td className="p-3 text-right text-sm text-gray-800">{totalCalculatedTaxes}</td>
            </tr>
             <tr className="bg-gray-50 font-bold border-t-2 border-gray-300">
                <td colSpan={2} className="p-3 text-right text-sm text-gray-900">Grand Total:</td>
                <td className="p-3 text-right text-sm text-gray-900">{grandTotal}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
} 