'use client';

import Input from '@/components/ui/input';

interface TransferCostTableProps {
  costs: {
    storageCostPercent: number;
    shippingCostPercent: number;
    otherLogisticsPercent: number;
  };
  onChange: (costs: any) => void;
  // Pass total item cost if calculation is needed here
  // totalItemCost: number; 
}

// Define cost types
const costTypes = [
    { name: 'Storage Cost', key: 'storageCostPercent' },
    { name: 'Shipping', key: 'shippingCostPercent' },
    { name: 'Other Logistics', key: 'otherLogisticsPercent' },
];

export default function TransferCostTable({ costs, onChange /*, totalItemCost */ }: TransferCostTableProps) {
  
  const handleCostChange = (key: string, value: number) => {
    onChange({ ...costs, [key]: isNaN(value) ? 0 : value }); // Ensure value is a number
  };

  // TODO: Implement actual calculation based on item costs and percentages
  const calculateTaxAmount = (percent: number) => {
    // const itemTotal = totalItemCost || 0;
    // return (itemTotal * (percent / 100)).toFixed(2);
    return (0).toFixed(2); // Placeholder
  };

  const calculateTotalWithTaxes = (percent: number) => {
     // const itemTotal = totalItemCost || 0;
     // const tax = itemTotal * (percent / 100);
     // return (itemTotal + tax).toFixed(2);
     return (0).toFixed(2); // Placeholder
  };

  const totalTransferAmount = costTypes.reduce((sum, type) => {
      // const taxAmount = parseFloat(calculateTaxAmount(costs[type.key as keyof typeof costs] || 0));
      // return sum + taxAmount;
      return sum + 0; // Placeholder
  }, 0).toFixed(2);

  const grandTotal = costTypes.reduce((sum, type) => {
      // const totalWithTax = parseFloat(calculateTotalWithTaxes(costs[type.key as keyof typeof costs] || 0));
      // This logic likely needs totalItemCost from props
      // return sum + totalWithTax;
       return sum + 0; // Placeholder
  }, 0 /* + (totalItemCost || 0) */).toFixed(2); // Add base item cost if needed

  return (
    <div className="bg-white rounded-lg shadow-sm p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-[#00997B] text-white">
            <tr>
              <th className="p-3 text-left text-sm font-semibold">Cost Type</th>
              <th className="p-3 text-left text-sm font-semibold w-24">% Value</th>
              <th className="p-3 text-left text-sm font-semibold w-32">Taxes Amount</th>
              <th className="p-3 text-left text-sm font-semibold w-32">Total with Taxes</th>
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
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 pointer-events-none">%</span>
                  </div>
                </td>
                <td className="p-2 align-top">
                  <Input 
                    value={calculateTaxAmount(costs[type.key as keyof typeof costs] || 0)}
                    readOnly 
                    placeholder="Amount"
                    prefix="USD" 
                  />
                </td>
                <td className="p-2 align-top">
                   <Input 
                    value={calculateTotalWithTaxes(costs[type.key as keyof typeof costs] || 0)}
                    readOnly 
                    placeholder="Total"
                    prefix="USD" 
                  />
                </td>
              </tr>
            ))}
            {/* Footer Row */}
            <tr className="bg-gray-50 font-semibold">
                <td className="p-3 text-sm text-gray-800">Total Transfer Amount</td>
                <td className="p-3"></td> {/* Empty cell */}
                <td className="p-3 text-sm text-gray-800">Total: {totalTransferAmount}</td>
                <td className="p-3 text-sm text-gray-800">Total: {grandTotal}</td> 
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
} 