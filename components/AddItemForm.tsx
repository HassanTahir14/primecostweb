import { useState } from "react";
import Input from "./common/input";
import Select from "./common/select";
import Button from "@/components/common/button";
import { ArrowLeft } from "lucide-react";

interface AddItemFormProps {
  onClose: () => void;
}

interface ItemFormData {
  itemName: string;
  itemCode: string;
  brandName: string;
  category: string;
  primaryUnit: string;
  primaryUnitValue: string;
  secondaryUnit: string;
  secondaryUnitValue: string;
  branch: string;
  storageLocation: string;
  countryOfOrigin: string;
  itemType: string;
  taxType: string;
  purchaseCostWithoutVAT: string;
  purchaseCostWithVAT: string;
  images: File[];
}

const UNITS_OPTIONS = [
  { label: "KG", value: "kg" },
  { label: "Grams", value: "grams" },
  { label: "Pieces", value: "pieces" },
];

const CATEGORY_OPTIONS = [
  { label: "Category 1", value: "cat1" },
  { label: "Category 2", value: "cat2" },
];

const BRANCH_OPTIONS = [
  { label: "Branch 1", value: "branch1" },
  { label: "Branch 2", value: "branch2" },
];

const LOCATION_OPTIONS = [
  { label: "Location 1", value: "loc1" },
  { label: "Location 2", value: "loc2" },
];

const COUNTRY_OPTIONS = [
  { label: "Saudi Arabia", value: "sa" },
  { label: "UAE", value: "uae" },
];

const ITEM_TYPE_OPTIONS = [
  { label: "Type 1", value: "type1" },
  { label: "Type 2", value: "type2" },
];

const TAX_TYPE_OPTIONS = [
  { label: "VAT 15%", value: "vat15" },
  { label: "VAT 5%", value: "vat5" },
];

export default function AddItemForm({ onClose }: AddItemFormProps) {
  const [currentTab, setCurrentTab] = useState<"details" | "costing">(
    "details"
  );
  const [formData, setFormData] = useState<ItemFormData>({
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
    images: [],
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateItemCode = () => {
    // Generate a random code for now
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData((prev) => ({ ...prev, itemCode: code }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
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
        >
          Costing/Images
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 bg-white rounded-lg p-4 md:p-6">
        {currentTab === "details" ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Item Name"
                name="itemName"
                value={formData.itemName}
                onChange={handleInputChange}
                placeholder="Enter value"
              />

              <Select
                label="Branch"
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                options={BRANCH_OPTIONS}
                placeholder="Select branch"
              />

              <div className="relative">
                <Input
                  label="Item Code"
                  name="itemCode"
                  value={formData.itemCode}
                  onChange={handleInputChange}
                  placeholder="Enter value"
                  className="pr-4 md:pr-40"
                />
                <div className="mt-2 md:mt-0 md:absolute md:right-2 md:bottom-1.5">
                  <button
                    type="button"
                    onClick={generateItemCode}
                    className="w-full md:w-auto px-4 py-1.5 bg-[#339A89] text-white text-sm rounded-full hover:bg-[#2b8274] transition-colors"
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
                placeholder="Select location"
              />

              <Input
                label="Items Brand Name"
                name="brandName"
                value={formData.brandName}
                onChange={handleInputChange}
                placeholder="Enter Value"
              />

              <Select
                label="Country of Origin"
                name="countryOfOrigin"
                value={formData.countryOfOrigin}
                onChange={handleInputChange}
                options={COUNTRY_OPTIONS}
                placeholder="Select country"
              />

              <Select
                label="Item Category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                options={CATEGORY_OPTIONS}
                placeholder="Select Option"
              />

              <Select
                label="Item Type"
                name="itemType"
                value={formData.itemType}
                onChange={handleInputChange}
                options={ITEM_TYPE_OPTIONS}
                placeholder="Select item type"
              />
            </div>

            <div className="space-y-3 mt-6">
              <h3 className="font-medium">Units of Measurement</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Primary unit"
                  name="primaryUnit"
                  value={formData.primaryUnit}
                  onChange={handleInputChange}
                  options={UNITS_OPTIONS}
                  placeholder="Select primary unit"
                />
                <Input
                  label="Primary Unit Value"
                  name="primaryUnitValue"
                  value={formData.primaryUnitValue}
                  onChange={handleInputChange}
                  placeholder="Enter Value"
                />
                <Select
                  label="Secondary Unit"
                  name="secondaryUnit"
                  value={formData.secondaryUnit}
                  onChange={handleInputChange}
                  options={UNITS_OPTIONS}
                  placeholder="Select Secondary unit"
                />
                <Input
                  label="Secondary Unit Value"
                  name="secondaryUnitValue"
                  value={formData.secondaryUnitValue}
                  onChange={handleInputChange}
                  placeholder="Enter Value"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button type="button" onClick={() => setCurrentTab("costing")}>
                Next
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <Select
              label="TAX Type"
              name="taxType"
              value={formData.taxType}
              onChange={handleInputChange}
              options={TAX_TYPE_OPTIONS}
              placeholder="Select tax type"
            />

            <div className="relative">
              <Input
                label="Purchase Cost (Without VAT)"
                name="purchaseCostWithoutVAT"
                value={formData.purchaseCostWithoutVAT}
                onChange={handleInputChange}
                placeholder="Enter Value"
                className="pl-12"
              />
              <span className="absolute bottom-2 left-3 text-gray-500">
                USD
              </span>
            </div>

            <div className="relative">
              <Input
                label="Purchase Cost (With VAT)"
                name="purchaseCostWithVAT"
                value={formData.purchaseCostWithVAT}
                onChange={handleInputChange}
                placeholder="Enter Value"
                className="pl-12"
              />
              <span className="absolute bottom-2 left-3 text-gray-500">
                USD
              </span>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Item Images</h3>
              <button
                type="button"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                Upload Image
              </button>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setFormData((prev) => ({ ...prev, images: files }));
                }}
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {formData.images.map((file, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-gray-100 rounded-lg"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button type="submit">Add Product</Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
