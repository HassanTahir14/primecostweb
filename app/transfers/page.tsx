'use client';

import { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/store/api';
import Loader from '@/components/common/Loader';
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
  const [activeTab, setActiveTab] = useState<TransferTab>('Inventory Items');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

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
            <Button>Create New</Button>
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-4">
            <Loader size="medium" />
          </div>
        ) : !data.length ? (
          <div className="text-center py-4 text-gray-500">No transfers found</div>
        ) : (
          /* Table Content */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-[#00997B] text-white">
                <tr>
                <th className="p-3 text-left text-sm font-semibold">Item Name</th>
                  {/* <th className="p-3 text-left text-sm font-semibold">Reference No.</th> */}
                  <th className="p-3 text-left text-sm font-semibold">Transfer Date</th>
                  <th className="p-3 text-left text-sm font-semibold">Status</th>
                  <th className="p-3 text-left text-sm font-semibold">Transferred By</th>
                  {/* <th className="p-3 text-left text-sm font-semibold">Approved By</th> */}
                  <th className="p-3 text-left text-sm font-semibold">Quantity</th>
                  <th className="p-3 text-left text-sm font-semibold">UOM</th>
                  <th className="p-3 text-left text-sm font-semibold">Cost</th>
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
                      {/* <td className="p-3 text-sm">{item.transferReferenceNumber}</td> */}
                      <td className="p-3 text-sm">{new Date(item.transferDate).toLocaleDateString()}</td>
                      <td className="p-3 text-sm">{item.transferStatus}</td>
                      <td className="p-3 text-sm">{item.transferredBy}</td>
                      {/* <td className="p-3 text-sm">{item.approvedBy || 'N/A'}</td> */}
                      <td className="p-3 text-sm">{itemQuantity}</td>
                      <td className="p-3 text-sm">{uom}</td>
                      <td className="p-3 text-sm">{cost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
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
    <PageLayout title="Transfers">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-lg shadow-sm overflow-hidden">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`flex-1 py-3 px-6 font-medium text-sm transition-colors duration-150 text-center 
              ${activeTab === tab.name
                ? 'bg-[#00997B] text-white'
                : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
              }`}
          >
            Transfer {tab.name}
          </button>
        ))}
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-lg shadow-sm mt-6">
        {renderTable()}
      </div>
    </PageLayout>
  );
} 