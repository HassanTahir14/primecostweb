import { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import Input from "./common/input";
import Select from "./common/select";
import Button from "@/components/common/button";
import ConfirmationModal from './common/ConfirmationModal';
import { ArrowLeft, AlertCircle, X } from "lucide-react"; 
import { AppDispatch, RootState } from '@/store/store'; 
import api from '@/store/api'; 
import {
  updateItem, // Import updateItem action
  clearError as clearItemsError, 
  resetCurrentAction, // Import the new action
  selectItemsStatus, 
  selectItemsError, 
  selectItemsCurrentAction 
} from '@/store/itemsSlice';
import { fetchAllCategories as fetchItemCategories, selectAllCategories as selectItemCategories } from '@/store/itemCategorySlice';
import { fetchAllTaxes, selectAllTaxes } from '@/store/taxSlice'; 

// Define Item interface matching the structure in itemsSlice/ItemsMasterList
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
  // Add other relevant fields if needed
}

interface EditItemFormProps {
  itemToEdit: Item; // Item being edited
  onClose: () => void;
  onSuccess?: () => void; 
}

// Match ItemData structure expected by itemsApi.update
interface ItemDataForUpdateApi {
  itemId: number; // Required for update
  name: string;
  code: string;
  itemsBrandName: string;
  categoryId: number;
  primaryUnit: number; 
  primaryUnitValue: number;
  secondaryUnit?: number; 
  secondaryUnitValue?: number;
  countryOrigin: string;
  taxId: number; 
  purchaseCostWithoutVat: number;
  purchaseCostWithVat: number;
  imageIdsToRemove?: number[]; // IDs of images to remove
}

// Interface for Unit of Measurement options
interface UnitOption {
  label: string;
  value: string; 
}

// Mock options (Keep only those not fetched from API/Redux)
const BRANCH_OPTIONS = [
  { label: "Branch 1", value: "branch1" }, 
  { label: "Branch 2", value: "branch2" },
];

const LOCATION_OPTIONS = [
  { label: "Location 1", value: "loc1" },
  { label: "Location 2", value: "loc2" },
];

const COUNTRY_OPTIONS = [
  { label: "Saudi Arabia", value: "SA" },
  { label: "UAE", value: "AE" },
];

const ITEM_TYPE_OPTIONS = [
  { label: "Type 1", value: "type1" },
  { label: "Type 2", value: "type2" },
];


export default function EditItemForm({ itemToEdit, onClose, onSuccess }: EditItemFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state selectors
  const itemCategories = useSelector(selectItemCategories);
  const taxes = useSelector(selectAllTaxes);
  const itemStatus = useSelector(selectItemsStatus);
  const itemError = useSelector(selectItemsError);
  const currentAction = useSelector(selectItemsCurrentAction);

  // Local state for Units of Measurement
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [unitsError, setUnitsError] = useState<string | null>(null);

  // Modal state
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageModalContent, setMessageModalContent] = useState({ title: '', message: '' });

  // Form state
  const [currentTab, setCurrentTab] = useState<"details" | "costing">("details");
  const [formData, setFormData] = useState<any>({
    itemName: "",
    itemCode: "",
    brandName: "",
    category: "",
    primaryUnit: "",
    primaryUnitValue: "",
    secondaryUnit: "",
    secondaryUnitValue: "",
    branch: "",
    storageLocation: "",
    countryOfOrigin: "",
    itemType: "",
    taxType: "",
    purchaseCostWithoutVAT: "",
    purchaseCostWithVAT: "",
    existingImages: [], // Store existing images separately
    newImages: [], // Store newly added images
    imageIdsToRemove: [], // Store IDs of images marked for removal
  });

  // Populate form with itemToEdit data
  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        itemName: itemToEdit.name || "",
        itemCode: itemToEdit.code || "",
        brandName: itemToEdit.itemsBrandName || "",
        category: itemToEdit.categoryId?.toString() || "",
        primaryUnit: itemToEdit.primaryUnitId?.toString() || "",
        primaryUnitValue: itemToEdit.primaryUnitValue?.toString() || "",
        secondaryUnit: itemToEdit.secondaryUnitId?.toString() || "",
        secondaryUnitValue: itemToEdit.secondaryUnitValue?.toString() || "",
        // Assuming branch, storageLocation, itemType aren't directly on itemToEdit - fetch/map if needed
        branch: "", // Replace with actual mapping if needed
        storageLocation: "", // Replace with actual mapping if needed
        countryOfOrigin: itemToEdit.countryOrigin || "",
        itemType: "", // Replace with actual mapping if needed
        taxType: itemToEdit.taxId?.toString() || "",
        purchaseCostWithoutVAT: itemToEdit.purchaseCostWithoutVat?.toString() || "",
        purchaseCostWithVAT: itemToEdit.purchaseCostWithVat?.toString() || "",
        existingImages: itemToEdit.images || [],
        newImages: [],
        imageIdsToRemove: [],
      });
    }
  }, [itemToEdit]);

  // Fetch dropdown data on mount
  useEffect(() => {
    dispatch(fetchItemCategories());
    dispatch(fetchAllTaxes());

    const fetchUnits = async () => {
      setUnitsLoading(true);
      setUnitsError(null);
      try {
        const response = await api.get('/units-of-measurement/all');
        if (response.data && response.data.unitsOfMeasurement) {
          const formattedUnits = response.data.unitsOfMeasurement.map((unit: any) => ({
            label: unit.unitName, 
            value: unit.unitOfMeasurementId.toString(), 
          }));
          setUnits(formattedUnits);
        } else {
           throw new Error('Invalid response structure for units');
        }
      } catch (error: any) {
        console.error("Failed to fetch units:", error);
        setUnitsError(error.message || 'Failed to load units of measurement.');
      } finally {
        setUnitsLoading(false);
      }
    };
    fetchUnits();
  }, [dispatch]);

  // useEffect for showing modal based on status/action
  useEffect(() => {
    if (itemStatus === 'succeeded' && currentAction === 'update') {
      handleShowMessage('Success', 'Item updated successfully!');
    } else if (itemStatus === 'failed' && currentAction === 'update') {
      const errorMsg = typeof itemError === 'string' ? itemError : (itemError?.description || itemError?.message || 'Failed to update item. Please check details and try again.');
      handleShowMessage('Error Updating Item', errorMsg);
    }
  }, [itemStatus, currentAction]); // Depend only on status and action changes

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev: any) => ({ ...prev, newImages: [...prev.newImages, ...files] }));
  };

  const handleRemoveExistingImage = (imageIdToRemove: number) => {
    setFormData((prev: any) => ({ 
      ...prev, 
      // Add ID to removal list
      imageIdsToRemove: [...prev.imageIdsToRemove, imageIdToRemove],
      // Visually remove from displayed existing images
      existingImages: prev.existingImages.filter((img: ItemImage) => img.imageId !== imageIdToRemove)
    }));
  };

  const handleRemoveNewImage = (indexToRemove: number) => {
    setFormData((prev: any) => ({ 
      ...prev, 
      newImages: prev.newImages.filter((_: File, index: number) => index !== indexToRemove)
    }));
  };

  const generateItemCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData((prev: any) => ({ ...prev, itemCode: code }));
  };

  // Helper to show messages via modal
  const handleShowMessage = (title: string, message: string) => {
    setMessageModalContent({ title, message });
    setIsMessageModalOpen(true);
  };

  // --- Validation for Details Tab (Same as AddItemForm) ---
  const validateDetailsTab = (): string | null => {
    const requiredDetailsFields: Record<string, string> = {
        itemName: "Item Name",
        category: "Item Category",
        primaryUnit: "Primary Unit",
        primaryUnitValue: "Primary Unit Value",
        secondaryUnit: "Secondary Unit",
        secondaryUnitValue: "Secondary Unit Value",
        countryOfOrigin: "Country of Origin",
        itemType: "Item Type",
        branch: "Branch",
        storageLocation: "Storage Location",
        brandName: "Brand Name",
    };
    for (const field in requiredDetailsFields) {
        // Convert to string for validation as initial value might be number
        if (!formData[field] || String(formData[field]).trim() === "") { 
            return `${requiredDetailsFields[field]} is required.`;
        }
    }
    const numericDetailsFields: Record<string, string> = {
        primaryUnitValue: "Primary Unit Value",
        secondaryUnitValue: "Secondary Unit Value",
    };
    for (const field in numericDetailsFields) {
         const value = formData[field];
         if (value && isNaN(Number(value))) {
             return `${numericDetailsFields[field]} must be a valid number.`;
         }
         if (value && Number(value) < 0) {
              return `${numericDetailsFields[field]} cannot be negative.`;
         }
    }
    if (formData.secondaryUnitValue && !formData.secondaryUnit) {
         return "Secondary Unit must be selected if Secondary Unit Value is entered.";
    }
    return null; 
  };

  // --- Validation for Final Submission (Same as AddItemForm) ---
  const validateForm = (): string | null => {
    const detailsError = validateDetailsTab();
    if (detailsError) return detailsError;

    const requiredCostingFields: Record<string, string> = {
        taxType: "TAX Type",
        // purchaseCostWithoutVAT: "Purchase Cost (Without VAT)", 
    };
    for (const field in requiredCostingFields) {
        // Convert to string for validation
        if (!formData[field] || String(formData[field]).trim() === "") {
            return `${requiredCostingFields[field]} is required.`;
        }
    }

    const numericCostingFields: Record<string, string> = {
        purchaseCostWithoutVAT: "Purchase Cost (Without VAT)",
        purchaseCostWithVAT: "Purchase Cost (With VAT)",
    };
    for (const field in numericCostingFields) {
         const value = formData[field];
         if (value && isNaN(Number(value))) {
             return `${numericCostingFields[field]} must be a valid number.`;
         }
         if (value && Number(value) < 0) {
              return `${numericCostingFields[field]} cannot be negative.`;
         }
    }
    return null; 
  };

  // --- Handler for the Next Button --- 
  const handleNextClick = () => {
      const detailsValidationError = validateDetailsTab();
      if (detailsValidationError) {
          handleShowMessage('Validation Error', detailsValidationError);
      } else {
          setCurrentTab("costing");
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearItemsError());

    // Use the comprehensive validateForm for final submission
    const validationError = validateForm();
    if (validationError) {
        handleShowMessage('Validation Error', validationError);
        return;
    }

    // --- Prepare Data for API (Trim strings, parse numbers) --- 
    const itemDataForApi: ItemDataForUpdateApi = {
      itemId: itemToEdit.itemId, // Include the item ID for update
      name: formData.itemName.trim(),
      code: formData.itemCode.trim(),
      itemsBrandName: formData.brandName.trim(),
      categoryId: parseInt(formData.category, 10),
      primaryUnit: parseInt(formData.primaryUnit, 10),
      primaryUnitValue: parseFloat(formData.primaryUnitValue) || 0,
      // Conditionally add secondary unit/value
      ...(formData.secondaryUnit && { secondaryUnit: parseInt(formData.secondaryUnit, 10) }),
      ...(formData.secondaryUnit && formData.secondaryUnitValue && { secondaryUnitValue: parseFloat(formData.secondaryUnitValue) || 0 }),
      countryOrigin: formData.countryOfOrigin, 
      taxId: parseInt(formData.taxType, 10),
      purchaseCostWithoutVat: parseFloat(formData.purchaseCostWithoutVAT) || 0,
      purchaseCostWithVat: parseFloat(formData.purchaseCostWithVAT) || 0,
      imageIdsToRemove: formData.imageIdsToRemove, // Add IDs to remove
    };

    console.log("Submitting Updated Item Data:", itemDataForApi);
    console.log("Submitting New Images:", formData.newImages);

    // Dispatch updateItem action with data and *only new* images
    await dispatch(updateItem({ itemData: itemDataForApi, images: formData.newImages }));
  };

  // Format options for Select components
  const categoryOptions = itemCategories.map(cat => ({ label: cat.name, value: cat.categoryId.toString() }));
  const unitOptions = units; 
  const taxTypeOptions = taxes.map(tax => ({ label: tax.taxName, value: tax.taxId.toString() }));

  const isLoading = itemStatus === 'loading' && currentAction === 'update'; // Check for update loading

  const handleMessageModalClose = () => {
    setIsMessageModalOpen(false);
    
    const actionCompleted = currentAction === 'update'; // Check for update action
    const wasSuccess = itemStatus === 'succeeded';

    // Reset the action state in Redux *after* the modal is closed
    if (actionCompleted) {
      dispatch(resetCurrentAction()); 
    }
    
    // Clear the specific error from the slice if it was an error modal
    if (!wasSuccess && actionCompleted) {
         dispatch(clearItemsError());
    }
    
    // Trigger success/close callback only if the action was 'update' and it succeeded
    if (wasSuccess && actionCompleted) {
      if (onSuccess) {
        onSuccess(); 
      } else {
        onClose(); 
      }
    }
  };

  // Construct base URL for images if paths are relative
  const imageBaseUrl = api.defaults.baseURL?.replace('/api/v1', '') || ''; // Adjust if needed

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <button onClick={onClose} className="text-gray-600 hover:text-gray-800" disabled={isLoading}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold">Edit Item: {itemToEdit.name}</h1>
      </div>

      {/* Tabs */}
      <div className="flex mb-4 md:mb-6">
         <button
          className={`flex-1 py-3 text-center font-medium rounded-none ${ 
            currentTab === "details"
              ? "bg-[#339A89] text-white"
              : "bg-gray-200 text-gray-700"
          }`} 
          onClick={() => setCurrentTab("details")} 
          disabled={isLoading}
        >
          Details
        </button>
        <button
          className={`flex-1 py-3 text-center font-medium rounded-none ${ 
            currentTab === "costing"
              ? "bg-[#339A89] text-white"
              : "bg-gray-200 text-gray-700"
          }`} 
          onClick={() => setCurrentTab("costing")} 
          disabled={isLoading}
        >
          Costing/Images
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 bg-white rounded-lg p-4 md:p-6">
        {currentTab === "details" ? (
          // Details Tab Content (Same as Add form, pre-filled)
          <div className="space-y-5">
             {/* Input Grid - same structure, values from formData */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Inputs like Item Name, Branch, Code, Location, Brand, Country */}
                <Input
                 label="Item Name *"
                 name="itemName"
                 value={formData.itemName}
                 onChange={handleInputChange}
                 placeholder="Enter item name"
                 required
               />
               <Select
                 label="Branch"
                 name="branch"
                 value={formData.branch}
                 onChange={handleInputChange}
                 options={BRANCH_OPTIONS}
               />
               <div className="relative">
                  <Input
                   label="Item Code"
                   name="itemCode"
                   value={formData.itemCode}
                   onChange={handleInputChange}
                   placeholder="Enter or generate code"
                   className="pr-4 md:pr-40"
                 />
                 <div className="mt-2 md:mt-0 md:absolute md:right-2 md:bottom-1.5">
                   <button
                     type="button"
                     onClick={generateItemCode}
                     className="w-full md:w-auto px-4 py-1.5 bg-[#339A89] text-white text-sm rounded-full hover:bg-[#2b8274] transition-colors"
                     disabled={isLoading}
                   >
                     Generate Item Code
                   </button>
                 </div>
               </div>
               <Select
                 label="Storage Location"
                 name="storageLocation"
                 value={formData.storageLocation}
                 onChange={handleInputChange}
                 options={LOCATION_OPTIONS}
               />
               <Input
                 label="Items Brand Name"
                 name="brandName"
                 value={formData.brandName}
                 onChange={handleInputChange}
                 placeholder="Enter brand name"
               />
                <Select
                 label="Country of Origin"
                 name="countryOfOrigin"
                 value={formData.countryOfOrigin}
                 onChange={handleInputChange}
                 options={COUNTRY_OPTIONS}
               />
               <Select
                 label="Item Category *"
                 name="category"
                 value={formData.category}
                 onChange={handleInputChange}
                 options={categoryOptions} 
                 required
               />
               <Select
                 label="Item Type"
                 name="itemType"
                 value={formData.itemType}
                 onChange={handleInputChange}
                 options={ITEM_TYPE_OPTIONS}
               />
             </div>
             {/* Units of Measurement - same structure, values from formData */}
             <div className="space-y-3 mt-6">
               <h3 className="font-medium">Units of Measurement</h3>
                {unitsError && (
                 <div className="text-red-600 text-sm flex items-center gap-2">
                   <AlertCircle size={16} /> Could not load units: {unitsError}
                 </div>
               )} 
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Select
                   label="Primary unit *"
                   name="primaryUnit"
                   value={formData.primaryUnit}
                   onChange={handleInputChange}
                   options={unitOptions} 
                   required
                   disabled={unitsLoading || !!unitsError} 
                 />
                 <Input
                   label="Primary Unit Value"
                   name="primaryUnitValue"
                   type="number"
                   value={formData.primaryUnitValue}
                   onChange={handleInputChange}
                   placeholder="Enter value"
                   step="any"
                   min="0"
                 />
                 <Select
                   label="Secondary Unit"
                   name="secondaryUnit"
                   value={formData.secondaryUnit}
                   onChange={handleInputChange}
                   options={unitOptions} 
                   disabled={unitsLoading || !!unitsError} 
                 />
                 <Input
                   label="Secondary Unit Value"
                   name="secondaryUnitValue"
                   type="number"
                   value={formData.secondaryUnitValue}
                   onChange={handleInputChange}
                   placeholder="Enter value"
                   step="any"
                   min="0"
                 />
               </div>
             </div>
             {/* Next Button */}
             <div className="flex justify-end mt-6">
               <Button type="button" onClick={handleNextClick} disabled={isLoading}>
                 Next
               </Button>
             </div>
           </div>
        ) : (
          // Costing/Images Tab Content
          <div className="space-y-5">
             {/* TAX Type Select - same structure, value from formData */}
             <Select
               label="TAX Type *"
               name="taxType"
               value={formData.taxType}
               onChange={handleInputChange}
               options={taxTypeOptions} 
               required
             />
             {/* Cost Inputs - same structure, values from formData */}
              <div className="relative">
               <Input
                 label="Purchase Cost (Without VAT)"
                 name="purchaseCostWithoutVAT"
                 type="number"
                 value={formData.purchaseCostWithoutVAT}
                 onChange={handleInputChange}
                 placeholder="Enter value"
                 className="pl-12"
                 step="any"
                 min="0"
               />
               <span className="absolute bottom-2 left-3 text-gray-500">USD</span>
             </div>
             <div className="relative">
               <Input
                 label="Purchase Cost (With VAT)"
                 name="purchaseCostWithVAT"
                 type="number"
                 value={formData.purchaseCostWithVAT}
                 onChange={handleInputChange}
                 placeholder="Enter value"
                 className="pl-12"
                 step="any"
                 min="0"
               />
               <span className="absolute bottom-2 left-3 text-gray-500">USD</span>
             </div>

             {/* Image Management Section */}
             <div className="space-y-4">
               <h3 className="font-medium">Item Images</h3>
               
               {/* Display Existing Images */} 
               {formData.existingImages.length > 0 && (
                 <div className="mb-4">
                   <h4 className="text-sm font-medium mb-2 text-gray-600">Current Images:</h4>
                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                     {formData.existingImages.map((img: ItemImage) => (
                       <div
                         key={img.imageId}
                         className="relative aspect-square bg-gray-100 rounded-lg group"
                       >
                         <img
                           src={`${imageBaseUrl}${img.path}`} // Construct full URL if path is relative
                           alt={`Image ${img.imageId}`}
                           className="w-full h-full object-cover rounded-lg"
                           onError={(e) => { e.currentTarget.src = '/placeholder-image.png'; }} // Basic fallback
                         />
                         <button 
                            type="button" 
                            onClick={() => handleRemoveExistingImage(img.imageId)} 
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                            aria-label="Remove image"
                            disabled={isLoading}
                         >
                           <X size={14} /> 
                         </button>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {/* Upload New Images */} 
               <div>
                 <label htmlFor="file-upload" className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
                   Upload New Image(s)
                 </label>
                 <input
                   id="file-upload"
                   type="file"
                   accept="image/*"
                   multiple
                   className="hidden"
                   onChange={handleFileChange}
                   disabled={isLoading}
                 />
               </div>

               {/* Display New Image Previews */} 
               {formData.newImages.length > 0 && (
                 <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2 text-gray-600">New Images to Upload:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                     {formData.newImages.map((file: File, index: number) => (
                       <div
                         key={index}
                         className="relative aspect-square bg-gray-100 rounded-lg group"
                       >
                         <img
                           src={URL.createObjectURL(file)}
                           alt={`New Preview ${index + 1}`}
                           className="w-full h-full object-cover rounded-lg"
                         />
                          <button 
                            type="button" 
                            onClick={() => handleRemoveNewImage(index)} 
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                            aria-label="Remove new image"
                            disabled={isLoading}
                         >
                           <X size={14} /> 
                         </button>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
             </div>

             {/* Back and Submit Buttons */}
             <div className="flex justify-between items-center mt-6">
                <Button type="button" variant="outline" onClick={() => setCurrentTab("details")} disabled={isLoading}>
                  Back
                </Button>
               <Button type="submit" disabled={isLoading}>
                 {isLoading ? 'Updating Item...' : 'Update Product'}
               </Button>
             </div>
           </div>
        )}
      </form>

      {/* Message Modal */}
      <ConfirmationModal
        isOpen={isMessageModalOpen}
        onClose={handleMessageModalClose}
        title={messageModalContent.title}
        message={messageModalContent.message}
        isAlert={true} 
        okText="OK"
      />
    </div>
  );
} 