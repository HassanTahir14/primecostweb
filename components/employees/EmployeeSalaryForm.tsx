'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import Button from '@/components/common/button';
import Input from '@/components/common/input'; // Assuming InputField component
import { Upload, X } from 'lucide-react'; // Import icons
import { getImageUrlWithAuth } from '@/utils/imageUtils';
import AuthImage from '@/components/common/AuthImage';

// Interface for existing image data passed as prop
interface ExistingImage {
  imageId: number;
  path: string; 
  // Add other properties if available, e.g., url
}

interface EmployeeSalaryFormProps {
  onSubmit: (data: any) => void;
  onPrevious: () => void;
  initialData: any; // Data from previous steps
  existingImages?: ExistingImage[]; // Optional array of existing images
  isLoading?: boolean; // Optional loading state for submit button
  onSave?: (data: any) => void;
  errors?: Record<string, string>; // Add errors prop
}

export default function EmployeeSalaryForm({ 
  onSubmit, 
  onPrevious, 
  initialData, 
  existingImages = [], // Default to empty array
  isLoading = false,
  onSave,
  errors
}: EmployeeSalaryFormProps) {
  const [formData, setFormData] = useState({
    basicSalary: initialData?.basicSalary || '',
    foodAllowance: initialData?.foodAllowance || '',
    accommodationAllowance: initialData?.accommodationAllowance || '',
    transportAllowance: initialData?.transportAllowance || '',
    telephoneAllowance: initialData?.telephoneAllowance || '',
    otherAllowance: initialData?.otherAllowance || '',
  });
  
  // Initialize state from initialData
  const [newImages, setNewImages] = useState<File[]>(() => {
    return initialData?.newImages || [];
  });
  const [imageIdsToRemove, setImageIdsToRemove] = useState<number[]>(() => {
    return initialData?.imageIdsToRemove || [];
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update state when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        basicSalary: initialData.basicSalary || '',
        foodAllowance: initialData.foodAllowance || '',
        accommodationAllowance: initialData.accommodationAllowance || '',
        transportAllowance: initialData.transportAllowance || '',
        telephoneAllowance: initialData.telephoneAllowance || '',
        otherAllowance: initialData.otherAllowance || '',
      });
      setNewImages(initialData.newImages || []);
      setImageIdsToRemove(initialData.imageIdsToRemove || []);
    }
  }, [initialData]);

  // Calculate total salary (example calculation)
  const calculateTotalSalary = () => {
    const { basicSalary, foodAllowance, accommodationAllowance, transportAllowance, telephoneAllowance, otherAllowance } = formData;
    const total = [
      basicSalary,
      foodAllowance,
      accommodationAllowance,
      transportAllowance,
      telephoneAllowance,
      otherAllowance
    ]
      .map(val => parseFloat(val) || 0) // Convert to number, default to 0 if invalid
      .reduce((sum, current) => sum + current, 0);
    return total.toFixed(2); // Format to 2 decimal places
  };

  const totalSalary = calculateTotalSalary();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    // Save immediately with all state
    if (onSave) {
      onSave({
        ...formData,
        [name]: value,
        newImages,
        imageIdsToRemove,
        totalSalary: calculateTotalSalary()
      });
    }
  };
  
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewImages(prevImages => {
        const updatedImages = [...prevImages, ...files];
        // Save immediately with updated images
        if (onSave) {
          onSave({
            ...formData,
            newImages: updatedImages,
            imageIdsToRemove,
            totalSalary: calculateTotalSalary()
          });
        }
        return updatedImages;
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages(prevImages => {
      const updatedImages = prevImages.filter((_, i) => i !== index);
      // Save immediately with updated images
      if (onSave) {
        onSave({
          ...formData,
          newImages: updatedImages,
          imageIdsToRemove,
          totalSalary: calculateTotalSalary()
        });
      }
      return updatedImages;
    });
  };
  
  const handleRemoveExistingImage = (imageId: number) => {
    setImageIdsToRemove(prevIds => {
      const updatedIds = [...prevIds, imageId];
      // Save immediately with updated image IDs to remove
      if (onSave) {
        onSave({
          ...formData,
          newImages,
          imageIdsToRemove: updatedIds,
          totalSalary: calculateTotalSalary()
        });
      }
      return updatedIds;
    });
  };
  
  // Check if an existing image is marked for removal
  const isImageMarkedForRemoval = (imageId: number) => {
      return imageIdsToRemove.includes(imageId);
  };

  const handleSubmitClick = () => {
    const finalData = { 
      ...formData, 
      totalSalary: calculateTotalSalary(),
      newImages,
      imageIdsToRemove
    };
    console.log("Submitting Salary Data:", finalData);
    onSubmit(finalData);
  };

  // Update the image base URL
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || 'http://212.85.26.46:8082/api/v1/images/view';

  // Transform API error keys to form field names
  const getFieldError = (fieldName: string): string | undefined => {
    if (!errors) return undefined;
    
    const apiKey = `salaryRequestDTO.${fieldName}`;
    return errors[apiKey];
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Salary & Images</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Left Column - Allowances */}
        <div className="space-y-4">
          <Input 
            label="Basic Salary" 
            name="basicSalary" 
            value={formData.basicSalary} 
            onChange={handleChange} 
            placeholder="Enter basic salary" 
            type="number" 
            prefix="USD" 
            error={getFieldError('basicSalary')}
          />
          <Input 
            label="Food Allowance" 
            name="foodAllowance" 
            value={formData.foodAllowance} 
            onChange={handleChange} 
            placeholder="Enter food allowance" 
            type="number" 
          />
          <Input 
            label="Accommodation Allowance" 
            name="accommodationAllowance" 
            value={formData.accommodationAllowance} 
            onChange={handleChange} 
            placeholder="Enter accommodation allowance" 
            type="number" 
          />
          <Input 
            label="Transport Allowance" 
            name="transportAllowance" 
            value={formData.transportAllowance} 
            onChange={handleChange} 
            placeholder="Enter transport allowance" 
            type="number" 
          />
          <Input 
            label="Telephone or Mobile Allowance" 
            name="telephoneAllowance" 
            value={formData.telephoneAllowance} 
            onChange={handleChange} 
            placeholder="Enter telephone allowance" 
            type="number" 
          />
        </div>

        {/* Right Column - Image Upload, Other Allowance, Total */}
        <div className="space-y-4">
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Employee Images</label>
             {/* Existing Images Preview */} 
             {existingImages.length > 0 && (
                 <div className="mb-4 p-3 border border-dashed border-gray-300 rounded-md">
                     <p className="text-xs font-medium text-gray-500 mb-2">Existing Images:</p>
                     <div className="grid grid-cols-3 gap-2">
                         {existingImages.map((image) => (
                             !isImageMarkedForRemoval(image.imageId) && (
                                 <div key={image.imageId} className="relative group">
                                     <AuthImage 
                                        src={getImageUrlWithAuth(image.path, imageBaseUrl)}
                                        alt={`existing image ${image.imageId}`} 
                                        className="w-full h-32 object-contain rounded-md border border-gray-200 bg-gray-50"
                                        fallbackSrc="/placeholder-image.svg"
                                     />
                                     <button
                                         onClick={() => handleRemoveExistingImage(image.imageId)}
                                         className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                         aria-label="Remove existing image"
                                      >
                                         <X size={12} />
                                     </button>
                                 </div>
                             )
                         ))}
                     </div>
                 </div>
             )}
             
             {/* Hidden file input for adding new images */}
             <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleImageChange} 
                ref={fileInputRef} 
                className="hidden"
             />
             <Button variant="outline" onClick={handleImageUploadClick} className="w-full justify-center">
               <Upload size={16} className="mr-2" />
               Add New Image(s)
             </Button>
             
             {/* New Images Preview */} 
             {newImages.length > 0 && (
                 <div className="mt-4 grid grid-cols-3 gap-2">
                     {newImages.map((image, index) => (
                         <div key={index} className="relative group">
                             <img 
                                src={URL.createObjectURL(image)} 
                                alt={`new preview ${index}`} 
                                className="w-full h-32 object-contain rounded-md border border-gray-200 bg-gray-50"
                             />
                             <button
                                 onClick={() => handleRemoveNewImage(index)}
                                 className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                 aria-label="Remove new image"
                              >
                                 <X size={12} />
                             </button>
                         </div>
                     ))}
                 </div>
             )}
          </div>
          <Input 
            label="Other Allowance" 
            name="otherAllowance" 
            value={formData.otherAllowance} 
            onChange={handleChange} 
            placeholder="Any other allowances" 
            type="number" 
          />
          <Input 
            label="Total Salary" 
            name="totalSalary" 
            value={totalSalary} 
            readOnly 
            placeholder="Calculated total" 
            prefix="USD" 
            error={getFieldError('totalSalary')}
          />
        </div>
      </div>

      {/* Action Buttons */} 
      <div className="flex justify-between pt-4">
        <Button variant="secondary" onClick={onPrevious} disabled={isLoading}>Previous</Button>
        <Button onClick={handleSubmitClick} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'} 
        </Button>
      </div>
    </div>
  );
} 