'use client';

import { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/store/api';
import Loader from '@/components/common/Loader';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrencyValue } from '@/utils/currencyUtils';
import { useTranslation } from '@/context/TranslationContext';

type TransferTab = 'Inventory Items' | 'Recipe' | 'Sub Recipe';

const tabs: { name: TransferTab; param: string }[] = [
  { name: 'Inventory Items', param: 'inventory' },
  { name: 'Recipe', param: 'recipe' },
  { name: 'Sub Recipe', param: 'sub-recipe' },
];

const DEFAULT_PAYLOAD = {
  page: 0,
  size: 10,
  sortBy: "createdAt",
  direction: "asc"
};

export default function TransfersPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TransferTab>('Inventory Items');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { currency } = useCurrency();
  const [formattedCosts, setFormattedCosts] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (data && currency) {
      const formatCosts = async () => {
        try {
          const costs: {[key: string]: string} = {};
          for (const item of data) {
            const transferList = item.itemTransferList || item.preparedMainRecipeTransferList || item.preparedSubRecipeTransferList || [];
            const cost = transferList.reduce((sum: number, it: any) => sum + (it.cost || 0), 0);
            costs[item.transferReferenceNumber] = await formatCurrencyValue(cost, currency);
          }
          setFormattedCosts(costs);
        } catch (error) {
          console.error('Error formatting costs:', error);
          setFormattedCosts({});
        }
      };
      formatCosts();
    }
  }, [data, currency]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      let responseKey = '';

      switch (activeTab) {
        case 'Inventory Items':
          endpoint = '/transfer/view/items';
          responseKey = 'itemList';
          break;
        case 'Recipe':
          endpoint = '/transfer/view/prepared-main-recipe';
          responseKey = 'transferPreparedMainRecipeList';
          break;
        case 'Sub Recipe':
          endpoint = '/transfer/view/prepared-sub-recipe';
          responseKey = 'transferPreparedSubRecipeList';
          break;
      }

      const result: any = await api.post(endpoint, DEFAULT_PAYLOAD);
      
      // Extract the correct list based on the response key
      const items = result.data[responseKey] || [];
      setData(items);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (item: any) => {
    // Get the correct param from tabs array
    const currentTab = tabs.find(tab => tab.name === activeTab);
    // Navigate to detail page with the transfer data using the param
    router.push(`/transfers/detail?type=${currentTab?.param}&id=${item.transferReferenceNumber}`);
  };

  const renderTable = () => {
    return (
      <div className="flex flex-col">
        {/* Create New Button - Always visible */}
        <div className="flex justify-end p-4 border-b">
          <Link href={`/transfers/create?type=${tabs.find(tab => tab.name === activeTab)?.param}`}>
            <Button>{t('transfersList.btnCreate')}</Button>
          </Link>
        </div>
        {/* Loading State */}
        {loading ? (
          <div className="text-center py-4">
            <Loader size="medium" />
          </div>
        ) : !data.length ? (
          <div className="text-center py-4 text-gray-500">{t('transfersList.noResults')}</div>
        ) : (
          /* Table Content */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-[#00997B] text-white">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold">{t('transfersList.colItemName')}</th>
                  <th className="p-3 text-left text-sm font-semibold">{t('transfersList.colTransferDate')}</th>
                  <th className="p-3 text-left text-sm font-semibold">{t('transfersList.colStatus')}</th>
                  <th className="p-3 text-left text-sm font-semibold">{t('transfersList.colTransferredBy')}</th>
                  <th className="p-3 text-left text-sm font-semibold">{t('transfersList.colQuantity')}</th>
                  <th className="p-3 text-left text-sm font-semibold">{t('transfersList.colUom')}</th>
                  <th className="p-3 text-left text-sm font-semibold">{t('transfersList.colCost')}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => {
                  let transferList = [];
                  if (item.itemTransferList) transferList = item.itemTransferList;
                  else if (item.preparedMainRecipeTransferList) transferList = item.preparedMainRecipeTransferList;
                  else if (item.preparedSubRecipeTransferList) transferList = item.preparedSubRecipeTransferList;

                  const firstItem = transferList.length > 0 ? transferList[0] : null;

                  // Item Name
                  let itemName = 'N/A';
                  if (firstItem) {
                    if (firstItem.itemName) itemName = firstItem.itemName.split('@')[0];
                    else if (firstItem.mainRecipeName) itemName = firstItem.mainRecipeName;
                    else if (firstItem.subRecipeName) itemName = firstItem.subRecipeName;
                  }

                  // Quantity
                  const itemQuantity = firstItem ? (firstItem.itemQuantity ?? firstItem.quantity ?? 'N/A') : 'N/A';

                  // UOM
                  const uom = firstItem ? (firstItem.uom || 'N/A') : 'N/A';

                  // Cost
                  const cost = transferList.length > 0
                    ? transferList.reduce((sum: number, it: any) => sum + (it.cost || 0), 0)
                    : 0;

                  return (
                    <tr 
                      key={item.transferReferenceNumber || index}
                      onClick={() => handleRowClick(item)}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                    >
                       <td className="p-3 text-sm">{itemName}</td>
                      <td className="p-3 text-sm">{new Date(item.transferDate).toLocaleDateString()}</td>
                      <td className="p-3 text-sm">{item.transferStatus}</td>
                      <td className="p-3 text-sm">{item.transferredBy}</td>
                      <td className="p-3 text-sm">{itemQuantity}</td>
                      <td className="p-3 text-sm">{uom}</td>
                      <td className="p-3 text-sm">{formattedCosts[item.transferReferenceNumber] || 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <PageLayout title={t('transfersList.pageTitle')}>
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-lg shadow-sm overflow-hidden">
        <button
          onClick={() => setActiveTab('Inventory Items')}
          className={`flex-1 py-3 px-6 font-medium text-sm transition-colors duration-150 text-center 
            ${activeTab === 'Inventory Items'
              ? 'bg-[#00997B] text-white'
              : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
            }`}
        >
          {t('transfersList.tabInventory')}
        </button>
        <button
          onClick={() => setActiveTab('Recipe')}
          className={`flex-1 py-3 px-6 font-medium text-sm transition-colors duration-150 text-center 
            ${activeTab === 'Recipe'
              ? 'bg-[#00997B] text-white'
              : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
            }`}
        >
          {t('transfersList.tabRecipe')}
        </button>
        <button
          onClick={() => setActiveTab('Sub Recipe')}
          className={`flex-1 py-3 px-6 font-medium text-sm transition-colors duration-150 text-center 
            ${activeTab === 'Sub Recipe'
              ? 'bg-[#00997B] text-white'
              : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
            }`}
        >
          {t('transfersList.tabSubRecipe')}
        </button>
      </div>
      {/* Table Content */}
      <div className="bg-white rounded-lg shadow-sm mt-6">
        {renderTable()}
      </div>
    </PageLayout>
  );
}