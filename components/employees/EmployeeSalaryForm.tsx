'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import Button from '@/components/common/button';
import Input from '@/components/common/input'; // Assuming InputField component
import { Upload, X } from 'lucide-react'; // Import icons

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
}

export default function EmployeeSalaryForm({ 
  onSubmit, 
  onPrevious, 
  initialData, 
  existingImages = [], // Default to empty array
  isLoading = false 
}: EmployeeSalaryFormProps) {
  const [formData, setFormData] = useState({
    basicSalary: '',
    foodAllowance: '',
    accommodationAllowance: '',
    transportAllowance: '',
    telephoneAllowance: '',
    otherAllowance: '',
    ...initialData, // Pre-fill with existing data
  });
  
  const [newImages, setNewImages] = useState<File[]>([]); // State for newly added images
  const [imageIdsToRemove, setImageIdsToRemove] = useState<number[]>([]); // State for IDs of existing images to remove
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate form data from initialData
  useEffect(() => {
    setFormData({
      basicSalary: initialData.basicSalary || '',
      foodAllowance: initialData.foodAllowance || '',
      accommodationAllowance: initialData.accommodationAllowance || '',
      transportAllowance: initialData.transportAllowance || '',
      telephoneAllowance: initialData.telephoneAllowance || '', 
      otherAllowance: initialData.otherAllowance || '',
    });
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
  };
  
  // Handle NEW image selection
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewImages(prevImages => [...prevImages, ...files]);
    }
     if (fileInputRef.current) {
       fileInputRef.current.value = '';
     }
  };
  
  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Remove a NEWLY ADDED image preview
  const handleRemoveNewImage = (index: number) => {
      setNewImages(prevImages => prevImages.filter((_, i) => i !== index));
  };
  
  // Mark an EXISTING image for removal
  const handleRemoveExistingImage = (imageId: number) => {
      setImageIdsToRemove(prevIds => [...prevIds, imageId]);
  };
  
  // Check if an existing image is marked for removal
  const isImageMarkedForRemoval = (imageId: number) => {
      return imageIdsToRemove.includes(imageId);
  };

  const handleSubmitClick = () => {
    const finalData = { 
      ...formData, 
      totalSalary, 
      newImages: newImages, // Pass new images separately
      imageIdsToRemove: imageIdsToRemove, // Pass IDs to remove
    };
    console.log("Submitting Salary Data:", finalData);
    onSubmit(finalData);
  };

  // Construct full image URL (adjust based on your backend/hosting setup)
  const getImageUrl = (path: string) => {
      // Example: Assuming paths are relative and need a base URL
      // Replace with your actual image base URL logic
      const BASE_IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ''; 
      return path ? `${BASE_IMAGE_URL}/${path}` : '/placeholder.png'; // Provide a placeholder
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
          />
          <Input label="Food Allowance" name="foodAllowance" value={formData.foodAllowance} onChange={handleChange} placeholder="Enter food allowance" type="number" />
          <Input label="Accommodation Allowance" name="accommodationAllowance" value={formData.accommodationAllowance} onChange={handleChange} placeholder="Enter accommodation allowance" type="number" />
          <Input label="Transport Allowance" name="transportAllowance" value={formData.transportAllowance} onChange={handleChange} placeholder="Enter transport allowance" type="number" />
          <Input label="Telephone or Mobile Allowance" name="telephoneAllowance" value={formData.telephoneAllowance} onChange={handleChange} placeholder="Enter telephone allowance" type="number" />
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
                                     <img 
                                        src={getImageUrl(image.path)} 
                                        alt={`existing image ${image.imageId}`} 
                                        className="w-full h-20 object-cover rounded-md border border-gray-200"
                                        // Add onError handler for broken images
                                        onError={(e) => (e.currentTarget.src = '/placeholder.png')} 
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
                                className="w-full h-20 object-cover rounded-md border border-gray-200"
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
          <Input label="Other Allowance" name="otherAllowance" value={formData.otherAllowance} onChange={handleChange} placeholder="Any other allowances" type="number" />
          <Input label="Total Salary" name="totalSalary" value={totalSalary} readOnly placeholder="Calculated total" prefix="USD" />
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