'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import GenericDetailPage from '@/components/common/GenericDetailPage';
import api from '@/store/api';

export default function TransferDetailPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = searchParams.get('type');
  const id = searchParams.get('id');

  useEffect(() => {
    fetchTransferDetails();
  }, [type, id]);

  const fetchTransferDetails = async () => {
    if (!type || !id) {
      setError('Invalid transfer details');
      return;
    }

    setLoading(true);
    try {
      let endpoint = '';
      let responseKey = '';

      switch (type) {
        case 'inventory':
          endpoint = '/transfer/view/items';
          responseKey = 'itemList';
          break;
        case 'recipe':
          endpoint = '/transfer/view/prepared-main-recipe';
          responseKey = 'transferPreparedMainRecipeList';
          break;
        case 'sub-recipe':
          endpoint = '/transfer/view/prepared-sub-recipe';
          responseKey = 'transferPreparedSubRecipeList';
          break;
        default:
          throw new Error('Invalid transfer type');
      }

      const result = await api.post(endpoint, {
        page: 0,
        size: 10,
        sortBy: "createdAt",
        direction: "asc"
      });

      // Find the specific transfer by ID
      const items = result.data[responseKey] || [];
      const transfer = items.find((item: any) => item.transferReferenceNumber === Number(id));

      if (!transfer) {
        throw new Error('Transfer not found');
      }

      setData(transfer);
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch transfer details');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Configure fields based on transfer type
  const getFieldConfig = () => {
    const commonFields = [
      { key: 'transferReferenceNumber', label: 'Reference Number' },
      { key: 'transferType', label: 'Transfer Type' },
      { key: 'transferDate', label: 'Transfer Date', render: (value: string) => new Date(value).toLocaleDateString() },
      { key: 'transferStatus', label: 'Status' },
      { key: 'transferredBy', label: 'Transferred By' },
      { key: 'approvedBy', label: 'Approved By' },
    ];

    const itemsConfig = [
      ...commonFields,
      {
        key: 'itemTransferList',
        label: 'Items',
        render: (items: any[]) => (
          <div className="space-y-2">
            {items?.map((item, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded">
                <p>Name: {item.itemName}</p>
                <p>Code: {item.itemCode}</p>
                <p>Quantity: {item.itemQuantity} {item.uom}</p>
                <p>Cost: ${item.cost}</p>
              </div>
            ))}
          </div>
        ),
      },
    ];

    const recipeConfig = [
      ...commonFields,
      {
        key: 'preparedMainRecipeTransferList',
        label: 'Recipes',
        render: (items: any[]) => (
          <div className="space-y-2">
            {items?.map((item, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded">
                <p>Name: {item.mainRecipeName}</p>
                <p>Code: {item.mainRecipeCode}</p>
                <p>Quantity: {item.quantity} {item.uom}</p>
                <p>Cost: ${item.cost}</p>
              </div>
            ))}
          </div>
        ),
      },
    ];

    const subRecipeConfig = [
      ...commonFields,
      {
        key: 'preparedSubRecipeTransferList',
        label: 'Sub-Recipes',
        render: (items: any[]) => (
          <div className="space-y-2">
            {items?.map((item, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded">
                <p>Name: {item.subRecipeName}</p>
                <p>Code: {item.subRecipeCode}</p>
                <p>Quantity: {item.quantity} {item.uom}</p>
                <p>Cost: ${item.cost}</p>
              </div>
            ))}
          </div>
        ),
      },
    ];

    switch (type) {
      case 'inventory':
        return itemsConfig;
      case 'recipe':
        return recipeConfig;
      case 'sub-recipe':
        return subRecipeConfig;
      default:
        return commonFields;
    }
  };

  return (
    <GenericDetailPage
      title={`Transfer Details #${id}`}
      data={data}
      fieldConfig={getFieldConfig()}
      onBack={handleBack}
      isLoading={loading}
      error={error}
    />
  );
} 