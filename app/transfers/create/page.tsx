'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Import form parts (assuming they will be created)
import TransferHeaderForm from '@/components/transfers/TransferHeaderForm';
import TransferInventoryItemsTable from '@/components/transfers/TransferInventoryItemsTable';
import TransferRecipeTable from '@/components/transfers/TransferRecipeTable';
import TransferSubRecipeTable from '@/components/transfers/TransferSubRecipeTable';
import TransferCostTable from '@/components/transfers/TransferCostTable';

function CreateTransferContent() {
  const searchParams = useSearchParams();
  const transferTypeParam = searchParams.get('type') || 'inventory'; // Default to inventory

  const [formData, setFormData] = useState<any>({
      transferType: transferTypeParam.charAt(0).toUpperCase() + transferTypeParam.slice(1), // Set initial type from param
      transferDate: '',
      transferBy: 'sulieman.walid@gmail.com', // Mock logged-in user
      sourceBranch: '',
      targetBranch: '',
      items: [], // To hold items/recipes/sub-recipes
      costs: { // Initial cost structure
          storageCostPercent: 0,
          shippingCostPercent: 0,
          otherLogisticsPercent: 0,
      }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };
  
  const handleItemsChange = (items: any[]) => {
      setFormData((prev: any) => ({ ...prev, items }));
  };
  
  const handleCostsChange = (costs: any) => {
      setFormData((prev: any) => ({ ...prev, costs }));
  };

  const handleSubmit = () => {
    console.log("Submitting Transfer Data:", formData);
    // TODO: Add actual submission logic (API call)
    // TODO: Calculate final costs based on percentages and item values before submit
    // Redirect or show success message
  };

  const renderItemTable = () => {
    switch (transferTypeParam) {
      case 'inventory':
        return <TransferInventoryItemsTable items={formData.items} onChange={handleItemsChange} />;
      case 'recipe':
        return <TransferRecipeTable items={formData.items} onChange={handleItemsChange} />;
      case 'sub-recipe':
        return <TransferSubRecipeTable items={formData.items} onChange={handleItemsChange} />;
      default:
        return <p className="text-red-500">Invalid transfer type.</p>;
    }
  };

  return (
    <PageLayout title={`Create Transfer - ${formData.transferType}`}>
      <div className="space-y-6">
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/transfers" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
            <ArrowLeft size={20} />
            <span>Back to Transfers</span>
          </Link>
        </div>

        {/* Header Form */}
        <TransferHeaderForm formData={formData} handleChange={handleChange} />

        {/* Dynamic Item/Recipe Table */}
        {renderItemTable()}
        
        {/* Cost Table */}
        <TransferCostTable costs={formData.costs} onChange={handleCostsChange} />

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </div>
    </PageLayout>
  );
}

export default function CreateTransferPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}> 
            <CreateTransferContent />
        </Suspense>
    );
} 