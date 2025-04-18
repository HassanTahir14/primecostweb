'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import debounce from 'lodash/debounce'; // Import debounce
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import SearchInput from '@/components/common/SearchInput';
import AddItemForm from '@/components/AddItemForm';
import EditItemForm from '@/components/EditItemForm'; // Import EditItemForm
import Categories from '@/components/Categories';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { AppDispatch } from '@/store/store';
import {
  fetchAllItems,
  deleteItem,
  selectAllItems,
  selectItemsPagination,
  selectItemsStatus,
  selectItemsError,
  selectItemsCurrentAction,
  clearError as clearItemsError,
} from '@/store/itemsSlice';

// Define Item interface matching the structure in itemsSlice
interface ItemImage {
  imageId: number;
  path: string;
}
interface Item {
  itemId: number;
  name: string;
  code: string;
  itemsBrandName: string;
  categoryId: number;
  taxId: number;
  primaryUnitId: number;
  primaryUnitValue: number;
  secondaryUnitId: number;
  secondaryUnitValue: number;
  countryOrigin: string;
  purchaseCostWithoutVat: number;
  purchaseCostWithVat: number;
  images: ItemImage[];
  // Add other relevant fields used in the table
  // Example placeholders if names differ:
  // quantity: number; // Might need calculation or be available directly
  // units: string; // Might need mapping from primaryUnitId
  // expiry: string; // If available
  // supplier: string; // If available
  // cost: string; // Format purchaseCostWithVat or WithoutVat
}

export default function ItemsMasterList() {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector(selectAllItems);
  const pagination = useSelector(selectItemsPagination);
  const status = useSelector(selectItemsStatus);
  const error = useSelector(selectItemsError);
  const currentAction = useSelector(selectItemsCurrentAction);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false); // State for edit form visibility
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null); // State for item being edited
  const [showCategories, setShowCategories] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageModalContent, setMessageModalContent] = useState({ title: '', message: '' });
  
  // State for search/pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10); // Default page size
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // Default sort column
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [internalSearchTerm, setInternalSearchTerm] = useState(''); // For controlled input

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
      setCurrentPage(0); // Reset page on search
    }, 500), // 500ms debounce delay
    [] // Dependencies: empty array means the debounced function is created once
  );

  // Handler for the input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setInternalSearchTerm(newQuery);
    debouncedSearch(newQuery); // Call the debounced function
  };

  // Fetch items when component mounts or pagination/search changes
  useEffect(() => {
    dispatch(fetchAllItems({ 
        page: currentPage, 
        size: pageSize, 
        searchQuery: searchQuery,
        sortBy: sortBy,
        direction: sortDirection
    }));
  }, [dispatch, currentPage, pageSize, searchQuery, sortBy, sortDirection]);

  // Handle API call results (success/error for delete)
   useEffect(() => {
    if (status === 'succeeded' && currentAction === 'delete') {
      setMessageModalContent({ title: 'Success', message: 'Item deleted successfully!' });
      setIsMessageModalOpen(true);
      // Optionally refetch current page if needed (though slice handles local removal)
      // dispatch(fetchAllItems({ page: currentPage, size: pageSize, ... })); 
    } else if (status === 'failed' && currentAction === 'delete') {
      setMessageModalContent({ 
        title: 'Error',
        message: typeof error === 'string' ? error : (error?.message || 'Failed to delete item. Please try again.')
      });
      setIsMessageModalOpen(true);
    }
  }, [status, currentAction, error, dispatch, currentPage, pageSize]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(0); // Reset to first page on new search
  };

  const handleEditClick = (item: Item) => {
    setItemToEdit(item);
    setShowEditForm(true);
    setShowAddForm(false); // Ensure add form is closed
    setShowCategories(false); // Ensure categories view is closed
  };

  const handleDeleteClick = (item: Item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      dispatch(clearItemsError()); // Clear previous errors
      await dispatch(deleteItem(itemToDelete.itemId));
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleCloseForms = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setItemToEdit(null);
  };

  // --- Render Logic --- 
  const isLoading = status === 'loading';
  const isActionLoading = isLoading && (currentAction === 'delete'); // Specific loading for delete

  const handleMessageModalClose = () => {
    setIsMessageModalOpen(false);
    dispatch(clearItemsError());
  };

  const handleAddSuccess = () => {
    handleCloseForms();
    // Refetch current page data after adding
    dispatch(fetchAllItems({ 
        page: currentPage, 
        size: pageSize, 
        searchQuery: searchQuery,
        sortBy: sortBy,
        direction: sortDirection
    }));
  };

  const handleEditSuccess = () => {
    handleCloseForms();
    // Refetch current page data after editing
    dispatch(fetchAllItems({ page: currentPage, size: pageSize, searchQuery, sortBy, direction: sortDirection }));
  };

  // Determine main view content
  let mainContent;
  if (showAddForm) {
    mainContent = <AddItemForm onClose={handleCloseForms} onSuccess={handleAddSuccess} />;
  } else if (showEditForm && itemToEdit) {
    mainContent = <EditItemForm itemToEdit={itemToEdit} onClose={handleCloseForms} onSuccess={handleEditSuccess} />;
  } else if (showCategories) {
    mainContent = <Categories onClose={() => setShowCategories(false)} />;
  } else {
    // Default view: Items List Table
    mainContent = (
      <>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <SearchInput 
            placeholder="Search items..." 
            value={internalSearchTerm} 
            onChange={handleSearchInputChange} 
          />
          <div className="flex gap-3 self-end md:self-center">
            <Button onClick={() => {setShowAddForm(true); setShowEditForm(false); setItemToEdit(null);}}>Add Item</Button>
            <Button onClick={() => setShowCategories(true)} variant="outline">Manage Categories</Button>
          </div>
        </div>

        {isLoading && currentAction === 'fetch' && <div className="text-center p-4">Loading items...</div>}
        
        {!isLoading && error && currentAction === 'fetch' && (
           <div className="text-center p-4 text-red-600">
             Error loading items: {typeof error === 'string' ? error : error?.message || 'Unknown error'}
           </div>
        )}

        {status !== 'loading' && status !== 'failed' && (
          <div className="bg-white bg-opacity-70 p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg">
            <h2 className="text-base md:text-lg font-bold mb-4">Items List</h2>
            <div className="bg-white bg-opacity-90 rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Item name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Brand</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Primary Unit</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Cost (VAT Excl)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.length === 0 && (
                       <tr>
                         <td colSpan={7} className="px-4 py-4 text-center text-sm text-gray-500">No items found.</td>
                       </tr>
                    )}
                    {items.map((item) => (
                      <tr key={item.itemId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 font-medium">{item.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{item.code || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{item.itemsBrandName || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {item.primaryUnitValue}
                        </td> 
                         <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            SAR {item.purchaseCostWithoutVat?.toFixed(2) ?? '0.00'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                           <div className="flex gap-2">
                             <Button 
                               variant="outline" 
                               size="sm" 
                               className="text-xs"
                               onClick={() => handleEditClick(item)}
                               disabled={isLoading}
                              >
                                Edit
                              </Button> 
                             <Button 
                               variant="destructive"
                               size="sm" 
                               className="text-xs"
                               onClick={() => handleDeleteClick(item)}
                               disabled={isActionLoading}
                              >
                               {isActionLoading && itemToDelete?.itemId === item.itemId ? 'Deleting...' : 'Delete'}
                             </Button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-between items-center p-4 border-t bg-gray-50">
                   <span className="text-sm text-gray-600">
                     Page {pagination.pageNumber + 1} of {pagination.totalPages} ({pagination.totalElements} items)
                   </span>
                  <div className="flex gap-2">
                     <Button 
                       onClick={() => handlePageChange(pagination.pageNumber - 1)} 
                       disabled={pagination.first || isLoading}
                       variant="outline" 
                       size="sm"
                     >
                       Previous
                     </Button>
                     <Button 
                       onClick={() => handlePageChange(pagination.pageNumber + 1)} 
                       disabled={pagination.last || isLoading}
                       variant="outline" 
                       size="sm"
                     >
                       Next
                     </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <PageLayout title="Items Master List">
      {mainContent}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Item"
        message={`Are you sure you want to delete the item "${itemToDelete?.name}"? This action cannot be undone.`}
        confirmText={isActionLoading ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        isAlert={false}
      />

      <ConfirmationModal
        isOpen={isMessageModalOpen}
        onClose={handleMessageModalClose}
        title={messageModalContent.title}
        message={messageModalContent.message}
        isAlert={true}
        okText="OK"
      />
    </PageLayout>
  );
} 