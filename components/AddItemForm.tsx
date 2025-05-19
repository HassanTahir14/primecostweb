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
import { fetchCountries, formatCountryOptions } from '@/utils/countryUtils';
import { getCurrencyFromStorage } from '@/utils/currencyUtils';
import { useTranslation } from '@/context/TranslationContext';
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

  const [countryOptions, setCountryOptions] = useState<{ label: string; value: string; }[]>([]);

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

  // Add useEffect to fetch countries
  useEffect(() => {
    const loadCountries = async () => {
      const countries = await fetchCountries();
      setCountryOptions(formatCountryOptions(countries));
    };
    loadCountries();
  }, []);

  // useEffect for showing modal based on status/action
  useEffect(() => {
    if (itemStatus === 'succeeded' && currentAction === 'add') {
       handleShowMessage(t('items.add.successTitle'), t('items.add.successMessage'));
    } else if (itemStatus === 'failed' && currentAction === 'add') {
       const errorMsg = typeof itemError === 'string' ? itemError : (itemError?.description || itemError?.message || t('items.add.errorMessage'));
       handleShowMessage(t('items.add.errorTitle'), errorMsg);
    }
  }, [itemStatus, currentAction]);

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

  // --- Validation for Final Submission (Checks both tabs) ---
  const validateForm = (): string | null => {
    // First, validate details tab fields
    const detailsError = validateDetailsTab();
    if (detailsError) return detailsError;

    // Then, check required fields on the Costing tab
    const requiredCostingFields: Record<string, string> = {
        taxType: t('items.form.taxType'),
    };
    for (const field in requiredCostingFields) {
        if (!formData[field] || String(formData[field]).trim() === "") {
            return t('items.form.requiredField', { field: requiredCostingFields[field] });
        }
    }

    // Numeric checks for costing fields
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

  const { t } = useTranslation();

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <button onClick={onClose} className="text-gray-600 hover:text-gray-800" disabled={isLoading}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold">{t('items.add.title')}</h1>
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
          {t('items.add.tabs.details')}
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
          {t('items.add.tabs.costingImages')}
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex-1 bg-white rounded-lg p-4 md:p-6">
        {currentTab === "details" ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="flex justify-end mt-6">
               <Button type="button" onClick={handleNextClick} disabled={isLoading}>
                {t('items.add.next')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
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
            <div className="space-y-4">
              <h3 className="font-medium">{t('items.form.itemImages')}</h3>
               <label htmlFor="file-upload" className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
                 {t('items.form.uploadImages')}
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
                      alt={t('items.form.imagePreviewAlt', { index: index + 1 })}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
             <div className="flex justify-between items-center mt-6">
                <Button type="button" variant="outline" onClick={() => setCurrentTab("details")} disabled={isLoading}>
                  {t('items.add.back')}
                </Button>
               <Button type="submit" disabled={isLoading}>
                 {isLoading ? t('items.add.adding') : t('items.add.addProduct')}
               </Button>
            </div>
          </div>
        )}
      </form>
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
