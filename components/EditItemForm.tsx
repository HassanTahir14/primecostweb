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
import { fetchCountries, formatCountryOptions } from '@/utils/countryUtils';
import { getImageUrlWithAuth } from '@/utils/imageUtils';
import AuthImage from './common/AuthImage';
import { getCurrencyFromStorage } from '@/utils/currencyUtils';
import { useTranslation } from '@/context/TranslationContext';

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
// const BRANCH_OPTIONS = [
//   { label: "Branch 1", value: "branch1" }, 
//   { label: "Branch 2", value: "branch2" },
// ];

// const LOCATION_OPTIONS = [
//   { label: "Location 1", value: "loc1" },
//   { label: "Location 2", value: "loc2" },
// ];

const ITEM_TYPE_OPTIONS = [
  { label: "Solid Item", value: "Solid Item" },
  { label: "Liquid Item", value: "Liquid Item" },
];


export default function EditItemForm({ itemToEdit, onClose, onSuccess }: EditItemFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  
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
    taxRate: "",
    purchaseCostWithoutVAT: "",
    purchaseCostWithVAT: "",
    existingImages: [],
    newImages: [],
    imageIdsToRemove: [],
  });

  const [countryOptions, setCountryOptions] = useState<{ label: string; value: string; }[]>([]);

  // Populate form with itemToEdit data
  useEffect(() => {
    if (itemToEdit) {
      // Split the name into itemName and itemType if it contains @
      const [itemName, itemType] = itemToEdit.name.split('@');
      
      // Find the tax to get its rate
      const selectedTax = taxes.find(tax => tax.taxId === itemToEdit.taxId);
      const taxRate = selectedTax ? selectedTax.taxRate : '';

      setFormData({
        itemName: itemName || "",
        itemCode: itemToEdit.code || "",
        brandName: itemToEdit.itemsBrandName || "",
        category: itemToEdit.categoryId?.toString() || "",
        primaryUnit: itemToEdit.primaryUnitId?.toString() || "",
        primaryUnitValue: itemToEdit.primaryUnitValue?.toString() || "",
        secondaryUnit: itemToEdit.secondaryUnitId?.toString() || "",
        secondaryUnitValue: itemToEdit.secondaryUnitValue?.toString() || "",
        branch: "",
        storageLocation: "",
        countryOfOrigin: itemToEdit.countryOrigin || "",
        itemType: itemType || "",
        taxType: itemToEdit.taxId?.toString() || "",
        taxRate: taxRate,
        purchaseCostWithoutVAT: itemToEdit.purchaseCostWithoutVat?.toString() || "",
        purchaseCostWithVAT: itemToEdit.purchaseCostWithVat?.toString() || "",
        existingImages: itemToEdit.images || [],
        newImages: [],
        imageIdsToRemove: [],
      });
    }
  }, [itemToEdit, taxes]);

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
      handleShowMessage(t('items.edit.successTitle'), t('items.edit.successMessage'));
    } else if (itemStatus === 'failed' && currentAction === 'update') {
      const errorMsg = typeof itemError === 'string' ? itemError : (itemError?.description || itemError?.message || t('items.edit.errorMessage'));
      handleShowMessage(t('items.edit.errorTitle'), errorMsg);
    }
  }, [itemStatus, currentAction]); // Depend only on status and action changes

  // Add useEffect to fetch countries
  useEffect(() => {
    const loadCountries = async () => {
      const countries = await fetchCountries();
      setCountryOptions(formatCountryOptions(countries));
    };
    loadCountries();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => {
      const newData = { ...prev, [name]: value };

      // If changing tax type, update tax rate
      if (name === 'taxType') {
        const selectedTax = taxes.find(tax => tax.taxId.toString() === value);
        newData.taxRate = selectedTax ? selectedTax.taxRate : '';
      }

      // If changing purchase cost without VAT or tax type, recalculate with VAT
      if (name === 'purchaseCostWithoutVAT' || name === 'taxType') {
        const costWithoutVAT = parseFloat(newData.purchaseCostWithoutVAT) || 0;
        const taxRate = parseFloat(newData.taxRate) || 0;
        newData.purchaseCostWithVAT = (costWithoutVAT * (1 + taxRate / 100)).toFixed(2);
      }

      return newData;
    });
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
        itemName: t('items.form.itemName'),
        category: t('items.form.itemCategory'),
        primaryUnit: t('items.form.primaryUnit'),
        primaryUnitValue: t('items.form.primaryUnitValue'),
        secondaryUnit: t('items.form.secondaryUnit'),
        secondaryUnitValue: t('items.form.secondaryUnitValue'),
        countryOfOrigin: t('items.form.countryOfOrigin'),
        itemType: t('items.form.itemType'),
        brandName: t('items.form.brandName'),
    };
    for (const field in requiredDetailsFields) {
        if (!formData[field] || String(formData[field]).trim() === "") { 
            return t('items.form.requiredField', { field: requiredDetailsFields[field] });
        }
    }
    const numericDetailsFields: Record<string, string> = {
        primaryUnitValue: t('items.form.primaryUnitValue'),
        secondaryUnitValue: t('items.form.secondaryUnitValue'),
    };
    for (const field in numericDetailsFields) {
         const value = formData[field];
         if (value && isNaN(Number(value))) {
             return t('items.form.mustBeNumber', { field: numericDetailsFields[field] });
         }
         if (value && Number(value) < 0) {
              return t('items.form.cannotBeNegative', { field: numericDetailsFields[field] });
         }
    }
    if (formData.secondaryUnitValue && !formData.secondaryUnit) {
         return t('items.form.secondaryUnitRequired');
    }
    return null; 
  };

  // --- Validation for Final Submission (Same as AddItemForm) ---
  const validateForm = (): string | null => {
    const detailsError = validateDetailsTab();
    if (detailsError) return detailsError;
    const requiredCostingFields: Record<string, string> = {
        taxType: t('items.form.taxType'),
    };
    for (const field in requiredCostingFields) {
        if (!formData[field] || String(formData[field]).trim() === "") {
            return t('items.form.requiredField', { field: requiredCostingFields[field] });
        }
    }
    const numericCostingFields: Record<string, string> = {
        purchaseCostWithoutVAT: t('items.form.purchaseCostWithoutVAT'),
        purchaseCostWithVAT: t('items.form.purchaseCostWithVAT'),
    };
    for (const field in numericCostingFields) {
         const value = formData[field];
         if (value && isNaN(Number(value))) {
             return t('items.form.mustBeNumber', { field: numericCostingFields[field] });
         }
         if (value && Number(value) < 0) {
              return t('items.form.cannotBeNegative', { field: numericCostingFields[field] });
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
      name: `${formData.itemName.trim()}@${formData.itemType}`,
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

  // Update the image base URL
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || 'http://212.85.26.46:8082/api/v1/images/view';

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <button onClick={onClose} className="text-gray-600 hover:text-gray-800" disabled={isLoading}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold">{t('items.edit.title', { name: itemToEdit.name })}</h1>
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
          {t('items.edit.tabs.details')}
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
          {t('items.edit.tabs.costingImages')}
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
                 label={t('items.form.itemNameRequired')}
                 name="itemName"
                 value={formData.itemName}
                 onChange={handleInputChange}
                 placeholder={t('items.form.itemNamePlaceholder')}
                 required
               />

<Input
              label={t('items.form.brandName')}
              name="brandName"
              value={formData.brandName}
              onChange={handleInputChange}
               placeholder={t('items.form.brandNamePlaceholder')}
              />
               {/* <Select
                 label="Branch"
                 name="branch"
                 value={formData.branch}
                 onChange={handleInputChange}
                 options={BRANCH_OPTIONS}
               /> */}
               <div className="relative">
                  <Input
                   label={t('items.form.itemCode')}
                   name="itemCode"
                   value={formData.itemCode}
                   onChange={handleInputChange}
                   placeholder={t('items.form.itemCodePlaceholder')}
                   className="pr-4 md:pr-40"
                 />
                 <div className="mt-2 md:mt-0 md:absolute md:right-2 md:bottom-1.5">
                   <button
                     type="button"
                     onClick={generateItemCode}
                     className="w-full md:w-auto px-4 py-1.5 bg-[#339A89] text-white text-sm rounded-full hover:bg-[#2b8274] transition-colors"
                     disabled={isLoading}
                   >
                     {t('items.form.generateItemCode')}
                   </button>
                 </div>
               </div>
               {/* <Select
                 label="Storage Location"
                 name="storageLocation"
                 value={formData.storageLocation}
                 onChange={handleInputChange}
                 options={LOCATION_OPTIONS}
               /> */}
               <Input
                 label={t('items.form.brandName')}
                 name="brandName"
                 value={formData.brandName}
                 onChange={handleInputChange}
                 placeholder={t('items.form.brandNamePlaceholder')}
               />
                <Select
                 label={t('items.form.countryOfOrigin')}
                 name="countryOfOrigin"
                 value={formData.countryOfOrigin}
                 onChange={handleInputChange}
                 options={countryOptions}
               />
               <Select
                 label={t('items.form.itemCategoryRequired')}
                 name="category"
                 value={formData.category}
                 onChange={handleInputChange}
                 options={categoryOptions} 
                 required
               />
               <Select
                 label={t('items.form.itemType')}
                 name="itemType"
                 value={formData.itemType}
                 onChange={handleInputChange}
                 options={ITEM_TYPE_OPTIONS}
               />
             </div>
             {/* Units of Measurement - same structure, values from formData */}
             <div className="space-y-3 mt-6">
               <h3 className="font-medium">{t('items.form.unitsOfMeasurement')}</h3>
                {unitsError && (
                 <div className="text-red-600 text-sm flex items-center gap-2">
                   <AlertCircle size={16} /> {t('items.form.unitsLoadError', { error: unitsError })}
                 </div>
               )} 
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Select
                   label={t('items.form.primaryUnitRequired')}
                   name="primaryUnit"
                   value={formData.primaryUnit}
                   onChange={handleInputChange}
                   options={unitOptions} 
                   required
                   disabled={unitsLoading || !!unitsError} 
                 />
                 <Input
                   label={t('items.form.primaryUnitValue')}
                   name="primaryUnitValue"
                   type="number"
                   value={formData.primaryUnitValue}
                   onChange={handleInputChange}
                   placeholder={t('items.form.primaryUnitValuePlaceholder')}
                   step="any"
                   min="0"
                 />
                 <Select
                   label={t('items.form.secondaryUnit')}
                   name="secondaryUnit"
                   value={formData.secondaryUnit}
                   onChange={handleInputChange}
                   options={unitOptions} 
                   disabled={unitsLoading || !!unitsError} 
                 />
                 <Input
                   label={t('items.form.secondaryUnitValue')}
                   name="secondaryUnitValue"
                   type="number"
                   value={formData.secondaryUnitValue}
                   onChange={handleInputChange}
                   placeholder={t('items.form.secondaryUnitValuePlaceholder')}
                   step="any"
                   min="0"
                 />
               </div>
             </div>
             {/* Next Button */}
             <div className="flex justify-end mt-6">
               <Button type="button" onClick={handleNextClick} disabled={isLoading}>
                 {t('items.edit.next')}
               </Button>
             </div>
           </div>
        ) : (
          // Costing/Images Tab Content
          <div className="space-y-5">
             {/* TAX Type Select - same structure, value from formData */}
             <Select
               label={t('items.form.taxTypeRequired')}
               name="taxType"
               value={formData.taxType}
               onChange={handleInputChange}
               options={taxTypeOptions} 
               required
             />

             <div className="relative">
               <Input
                 label={t('items.form.taxRate')}
                 name="taxRate"
                 value={formData.taxRate}
                 disabled
                 className="bg-gray-50"
               />
             </div>

             {/* Cost Inputs - same structure, values from formData */}
              <div className="relative">
               <Input
                 label={t('items.form.purchaseCostWithoutVAT')}
                 name="purchaseCostWithoutVAT"
                 type="number"
                 value={formData.purchaseCostWithoutVAT}
                 onChange={handleInputChange}
                 placeholder={t('items.form.purchaseCostWithoutVATPlaceholder')}
                 className="pl-16"
                 step="any"
                 min="0"
               />
               <span className="absolute bottom-2 left-3 text-gray-500">
                 {getCurrencyFromStorage()}
               </span>
             </div>

             <div className="relative">
               <Input
                 label={t('items.form.purchaseCostWithVAT')}
                 name="purchaseCostWithVAT"
                 type="number"
                 value={formData.purchaseCostWithVAT}
                 disabled
                 className="pl-16 bg-gray-50"
               />
               <span className="absolute bottom-2 left-3 text-gray-500">
                 {getCurrencyFromStorage()}
               </span>
             </div>

             {/* Image Management Section */}
             <div className="space-y-4">
               <h3 className="font-medium">{t('items.form.itemImages')}</h3>
               
               {/* Display Existing Images */} 
               {formData.existingImages.length > 0 && (
                 <div className="mb-4">
                   <h4 className="text-sm font-medium mb-2 text-gray-600">{t('items.form.currentImages')}</h4>
                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                     {formData.existingImages.map((img: ItemImage) => (
                       <div
                         key={img.imageId}
                         className="relative aspect-square bg-gray-100 rounded-lg group"
                       >
                         <AuthImage
                           src={getImageUrlWithAuth(img.path, imageBaseUrl)}
                           alt={`Image ${img.imageId}`}
                           className="w-full h-full object-cover rounded-lg"
                           fallbackSrc="/placeholder-image.jpg"
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
                   {t('items.form.uploadNewImages')}
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
                    <h4 className="text-sm font-medium mb-2 text-gray-600">{t('items.form.newImagesToUpload')}</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                     {formData.newImages.map((file: File, index: number) => (
                       <div
                         key={index}
                         className="relative aspect-square bg-gray-100 rounded-lg group"
                       >
                         <AuthImage
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
                  {t('items.edit.back')}
                </Button>
               <Button type="submit" disabled={isLoading}>
                 {isLoading ? t('items.edit.updating') : t('items.edit.updateProduct')}
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
        okText={t('common.ok')}
      />
    </div>
  );
}