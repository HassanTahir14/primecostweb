import { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import Input from "./common/input";
import Select from "./common/select";
import Button from "@/components/common/button";
import ConfirmationModal from './common/ConfirmationModal';
import { ArrowLeft, AlertCircle } from "lucide-react";
import { AppDispatch, RootState } from '@/store/store';
import api from '@/store/api';
import { addItem, clearError as clearItemsError, resetCurrentAction, selectItemsStatus, selectItemsError, selectItemsCurrentAction } from '@/store/itemsSlice';
import { fetchAllCategories as fetchItemCategories, selectAllCategories as selectItemCategories } from '@/store/itemCategorySlice';
import { fetchAllTaxes, selectAllTaxes } from '@/store/taxSlice';
import { fetchAllBranches } from "@/store/branchSlice";
// TODO: Import actions/selectors for Units and Tax Types when available
// import { fetchAllUnits, selectAllUnits } from '@/store/unitSlice'; 
// import { fetchAllTaxTypes, selectAllTaxTypes } from '@/store/taxTypeSlice';

interface AddItemFormProps {
  onClose: () => void;
  onSuccess?: () => void; // Optional callback on successful add
}

// Match ItemData structure expected by itemsApi.add
interface ItemDataForApi {
  name: string;
  code: string;
  itemsBrandName: string;
  categoryId: number;
  primaryUnit: number; // Assuming this is the ID
  primaryUnitValue: number;
  secondaryUnit?: number; // Assuming this is the ID
  secondaryUnitValue?: number;
  // branch: string; // Map to branchId if needed by API
  // storageLocation: string; // Map to storageLocationId if needed by API
  countryOrigin: string;
  // itemType: string; // Map to itemTypeId if needed by API
  taxId: number; // Assuming this is the ID
  purchaseCostWithoutVat: number;
  purchaseCostWithVat: number;
}

// Interface for Unit of Measurement options
interface UnitOption {
  label: string;
  value: string; // Keep value as string for Select component
}

// Temporary mock options until slices are ready
// const UNITS_OPTIONS = [
//   { label: "KG", value: "1" }, // Use string IDs
//   { label: "Grams", value: "2" },
//   { label: "Pieces", value: "3" },
// ];

// const TAX_TYPE_OPTIONS = [
//   { label: "VAT 15%", value: "1" }, // Use string IDs
//   { label: "VAT 5%", value: "2" },
// ];

// Mock options - replace with actual data fetching if needed
// const BRANCH_OPTIONS = [
//   { label: "Branch 1", value: "branch1" },
//   { label: "Branch 2", value: "branch2" },
// ];

// const LOCATION_OPTIONS = [
//   { label: "Location 1", value: "loc1" },
//   { label: "Location 2", value: "loc2" },
// ];

const COUNTRY_OPTIONS = [
  { label: "Saudi Arabia", value: "SA" }, // Ensure values match API expectations
  { label: "UAE", value: "AE" },
];

const ITEM_TYPE_OPTIONS = [
  { label: "Solid Item", value: "Solid Item" },
  { label: "Liquid Item", value: "Liquid Item" },
];


export default function AddItemForm({ onClose, onSuccess }: AddItemFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const itemCategories = useSelector(selectItemCategories);
  const taxes = useSelector(selectAllTaxes);
  // const branches = useSelector();
  // const units = useSelector(selectAllUnits); // TODO: Uncomment when unitSlice exists
  // const taxTypes = useSelector(selectAllTaxTypes); // TODO: Uncomment when taxTypeSlice exists

  const itemStatus = useSelector(selectItemsStatus);
  const itemError = useSelector(selectItemsError);
  const currentAction = useSelector(selectItemsCurrentAction);

  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageModalContent, setMessageModalContent] = useState({ title: '', message: '' });

  const [currentTab, setCurrentTab] = useState<"details" | "costing">(
    "details"
  );
  // Use more specific types for form state if possible
  const [formData, setFormData] = useState<any>({
    itemName: "",
    itemCode: "",
    brandName: "",
    category: "", // Will hold categoryId as string
    primaryUnit: "", // Will hold unitId as string
    primaryUnitValue: "",
    secondaryUnit: "", // Will hold unitId as string
    secondaryUnitValue: "",
    branch: "",
    storageLocation: "",
    countryOfOrigin: "",
    itemType: "",
    taxType: "", // Will hold taxId as string
    taxRate: "",
    purchaseCostWithoutVAT: "",
    purchaseCostWithVAT: "",
    images: [],
  });

  // Local state for Units of Measurement
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [unitsError, setUnitsError] = useState<string | null>(null);

  // Fetch dropdown data on mount
  useEffect(() => {
    dispatch(fetchItemCategories());
    dispatch(fetchAllTaxes());
    const branches = dispatch(fetchAllBranches());
    

    // Fetch Units of Measurement directly
    const fetchUnits = async () => {
      setUnitsLoading(true);
      setUnitsError(null);
      try {
        const response = await api.get('/units-of-measurement/all');
        if (response.data && response.data.unitsOfMeasurement) {
          const formattedUnits = response.data.unitsOfMeasurement.map((unit: any) => ({
            label: unit.unitName, // Use unitName for label
            value: unit.unitOfMeasurementId.toString(), // Use ID as value (string)
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
    if (itemStatus === 'succeeded' && currentAction === 'add') {
       handleShowMessage('Success', 'Item added successfully!');
    } else if (itemStatus === 'failed' && currentAction === 'add') {
       const errorMsg = typeof itemError === 'string' ? itemError : (itemError?.description || itemError?.message || 'Failed to add item. Please check details and try again.');
       handleShowMessage('Error Adding Item', errorMsg);
    }
    // No dependency on itemError needed here, only for displaying message if status is failed
  }, [itemStatus, currentAction]); // Depend only on status and action changes

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
    // Limit number of files if necessary
    setFormData((prev: any) => ({ ...prev, images: [...prev.images, ...files] }));
  };

  // TODO: Implement image removal logic if needed
  // const handleRemoveImage = (indexToRemove: number) => {
  //   setFormData((prev: any) => ({ 
  //     ...prev, 
  //     images: prev.images.filter((_: File, index: number) => index !== indexToRemove)
  //   }));
  // };

  const generateItemCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData((prev: any) => ({ ...prev, itemCode: code }));
  };

  // Helper to show messages via modal
  const handleShowMessage = (title: string, message: string) => {
    setMessageModalContent({ title, message });
    setIsMessageModalOpen(true);
  };

  // --- Validation for Details Tab --- 
  const validateDetailsTab = (): string | null => {
    // Check only the fields required on the Details tab
    const requiredDetailsFields: Record<string, string> = {
        itemName: "Item Name",
        category: "Item Category",
        primaryUnit: "Primary Unit",
        primaryUnitValue: "Primary Unit Value",
        secondaryUnit: "Secondary Unit",
        secondaryUnitValue: "Secondary Unit Value",
        countryOfOrigin: "Country of Origin",
        itemType: "Item Type",
        // branch: "Branch",
        // storageLocation: "Storage Location",
        brandName: "Brand Name",

        // Add other required fields VISIBLE ON DETAILS TAB if any
    };

    for (const field in requiredDetailsFields) {
        if (!formData[field] || String(formData[field]).trim() === "") {
            return `${requiredDetailsFields[field]} is required.`;
        }
    }
    
    // You might want basic numeric checks here too if applicable
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

    return null; // Details tab is valid
  };

  // --- Validation for Final Submission (Checks both tabs) ---
  const validateForm = (): string | null => {
    // First, validate details tab fields
    const detailsError = validateDetailsTab();
    if (detailsError) return detailsError;

    // Then, check required fields on the Costing tab
    const requiredCostingFields: Record<string, string> = {
        taxType: "TAX Type",
        // Add other required costing fields like purchase costs if mandatory
        // purchaseCostWithoutVAT: "Purchase Cost (Without VAT)",
    };
    for (const field in requiredCostingFields) {
        if (!formData[field] || String(formData[field]).trim() === "") {
            return `${requiredCostingFields[field]} is required.`;
        }
    }

    // Numeric checks for costing fields
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
    
    // Add any other cross-tab validation if needed

    return null; // Entire form is valid
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
    const itemDataForApi: ItemDataForApi = {
      name: `${formData.itemName.trim()}@${formData.itemType}`,
      code: formData.itemCode.trim(),
      itemsBrandName: formData.brandName.trim(),
      categoryId: parseInt(formData.category, 10),
      primaryUnit: parseInt(formData.primaryUnit, 10),
      primaryUnitValue: parseFloat(formData.primaryUnitValue) || 0,
      // Conditionally add secondary unit/value only if primary unit exists
      ...(formData.secondaryUnit && { secondaryUnit: parseInt(formData.secondaryUnit, 10) }),
      ...(formData.secondaryUnit && formData.secondaryUnitValue && { secondaryUnitValue: parseFloat(formData.secondaryUnitValue) || 0 }),
      countryOrigin: formData.countryOfOrigin, // Assuming API accepts code like "SA"
      taxId: parseInt(formData.taxType, 10),
      purchaseCostWithoutVat: parseFloat(formData.purchaseCostWithoutVAT) || 0,
      purchaseCostWithVat: parseFloat(formData.purchaseCostWithVAT) || 0,
    };

    console.log("Submitting Item Data:", itemDataForApi);
    console.log("Submitting Images:", formData.images);

    await dispatch(addItem({ itemData: itemDataForApi, images: formData.images }));
  };

  // Format options for the Select component
  const categoryOptions = itemCategories.map(cat => ({ label: cat.name, value: cat.categoryId.toString() }));
  const unitOptions = units;
  const taxTypeOptions = taxes.map(tax => ({ label: tax.taxName, value: tax.taxId.toString() }));

  const isLoading = itemStatus === 'loading' && currentAction === 'add';

  const handleMessageModalClose = () => {
    setIsMessageModalOpen(false);
    
    const actionCompleted = currentAction === 'add'; // Check if the relevant action was completed
    const wasSuccess = itemStatus === 'succeeded';

    // Reset the action state in Redux *after* the modal is closed
    if (actionCompleted) {
      dispatch(resetCurrentAction()); 
    }

    // Clear the specific error from the slice if it was an error modal
    if (!wasSuccess && actionCompleted) {
         dispatch(clearItemsError());
    }

    // Trigger success/close callback only if the action was 'add' and it succeeded
    if (wasSuccess && actionCompleted) {
      if (onSuccess) {
        onSuccess(); 
      } else {
        onClose(); 
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <button onClick={onClose} className="text-gray-600 hover:text-gray-800" disabled={isLoading}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold">Add New Item</h1>
      </div>

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
          // Details Tab Content
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                 label="Item Name *"
                name="itemName"
                value={formData.itemName}
                onChange={handleInputChange}
                 placeholder="Enter item name"
                 required
              />

              <Input
              label="Brand Name"
              name="brandName"
              value={formData.brandName}
              onChange={handleInputChange}
               placeholder="Enter brand name"
              />
              {/* <Select
                label="Branch"
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                 options={BRANCH_OPTIONS} // Replace with fetched data if needed
              /> */}
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
              {/* <Select
                label="Storage Location"
                name="storageLocation"
                value={formData.storageLocation}
                onChange={handleInputChange}
                 options={LOCATION_OPTIONS} // Replace with fetched data if needed
              />
              <Input
                label="Items Brand Name"
                name="brandName"
                value={formData.brandName}
                onChange={handleInputChange}
                 placeholder="Enter brand name"
              /> */}
              <Select
                label="Country of Origin"
                name="countryOfOrigin"
                value={formData.countryOfOrigin}
                onChange={handleInputChange}
                 options={COUNTRY_OPTIONS} // Replace with fetched data
              />
              <Select
                 label="Item Category *"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                 options={categoryOptions} // Use fetched categories
                 required
              />
              <Select
                label="Item Type"
                name="itemType"
                value={formData.itemType}
                onChange={handleInputChange}
                 options={ITEM_TYPE_OPTIONS} // Replace with fetched data if needed
              />
            </div>

            <div className="space-y-3 mt-6">
              <h3 className="font-medium">Units of Measurement</h3>
               {/* Display error if units failed to load */} 
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
                   options={unitOptions} // Use fetched units
                   required
                   disabled={unitsLoading || !!unitsError} // Disable if loading or error
                />
                <Input
                  label="Primary Unit Value"
                  name="primaryUnitValue"
                   type="number" // Use number type
                  value={formData.primaryUnitValue}
                  onChange={handleInputChange}
                   placeholder="Enter value (e.g., 1, 0.5)"
                   step="any" // Allow decimals
                   min="0"
                />
                <Select
                  label="Secondary Unit"
                  name="secondaryUnit"
                  value={formData.secondaryUnit}
                  onChange={handleInputChange}
                   options={unitOptions} // Use fetched units
                   disabled={unitsLoading || !!unitsError} // Disable if loading or error
                />
                <Input
                  label="Secondary Unit Value"
                  name="secondaryUnitValue"
                   type="number" // Use number type
                  value={formData.secondaryUnitValue}
                  onChange={handleInputChange}
                   placeholder="Enter value"
                   step="any" // Allow decimals
                   min="0"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
               <Button type="button" onClick={handleNextClick} disabled={isLoading}>
                Next
              </Button>
            </div>
          </div>
        ) : (
          // Costing/Images Tab Content
          <div className="space-y-5">
            <Select
               label="TAX Type *"
              name="taxType"
              value={formData.taxType}
              onChange={handleInputChange}
               options={taxTypeOptions}
               required
            />

            <div className="relative">
              <Input
                label="Tax Rate (%)"
                name="taxRate"
                value={formData.taxRate}
                disabled
                className="bg-gray-50"
              />
            </div>

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
              <span className="absolute bottom-2 left-3 text-gray-500">
                 USD
              </span>
            </div>

            <div className="relative">
              <Input
                label="Purchase Cost (With VAT)"
                name="purchaseCostWithVAT"
                 type="number"
                value={formData.purchaseCostWithVAT}
                disabled
                className="pl-12 bg-gray-50"
              />
              <span className="absolute bottom-2 left-3 text-gray-500">
                 USD
              </span>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Item Images</h3>
               <label htmlFor="file-upload" className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
                 Upload Image(s)
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
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-2">
                 {formData.images.map((file: File, index: number) => (
                  <div
                    key={index}
                     className="relative aspect-square bg-gray-100 rounded-lg group"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                     {/* TODO: Implement remove button 
                     <button 
                        type="button" 
                        onClick={() => handleRemoveImage(index)} 
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={isLoading}
                     >
                       <X size={14} /> 
                     </button>
                     */} 
                  </div>
                ))}
              </div>
            </div>

             <div className="flex justify-between items-center mt-6">
                <Button type="button" variant="outline" onClick={() => setCurrentTab("details")} disabled={isLoading}>
                  Back
                </Button>
               <Button type="submit" disabled={isLoading}>
                 {isLoading ? 'Adding Item...' : 'Add Product'}
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
