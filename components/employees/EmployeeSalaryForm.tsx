'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import Button from '@/components/common/button';
import Input from '@/components/common/input'; // Assuming InputField component
import { Upload, X } from 'lucide-react'; // Import icons

interface EmployeeSalaryFormProps {
  onSubmit: (data: any) => void;
  onPrevious: () => void;
  initialData: any; // Data from previous steps
}

export default function EmployeeSalaryForm({ onSubmit, onPrevious, initialData }: EmployeeSalaryFormProps) {
  const [formData, setFormData] = useState({
    basicSalary: '',
    foodAllowance: '',
    accommodationAllowance: '',
    transportAllowance: '',
    telephoneAllowance: '',
    otherAllowance: '',
    // No total salary state, calculate on submit or display
    ...initialData, // Pre-fill with existing data
  });
  
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  
  // Handle image selection
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Append new files to the existing ones
      const newFiles = Array.from(e.target.files);
      setImages(prevImages => [...prevImages, ...newFiles]);
    }
     // Reset file input value to allow selecting the same file again
     if (fileInputRef.current) {
       fileInputRef.current.value = '';
     }
  };
  
  // Trigger hidden file input
  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Remove an image from the preview
  const handleRemoveImage = (index: number) => {
      setImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const handleSubmitClick = () => {
    // Add validation logic here if needed
    const finalData = { 
      ...formData, 
      totalSalary, // Include calculated total salary 
      // images: images // Include selected images
    };
    console.log("Salary Data (including images):", finalData);
    onSubmit(finalData);
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
             <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleImageChange} 
                ref={fileInputRef} 
                className="hidden" // Hide the default input
             />
             <Button variant="outline" onClick={handleImageUploadClick} className="w-full justify-center">
               <Upload size={16} className="mr-2" />
               Add Employee Image(s)
             </Button>
             {/* Image Preview Area */}
             {images.length > 0 && (
                 <div className="mt-4 grid grid-cols-3 gap-2">
                     {images.map((image, index) => (
                         <div key={index} className="relative group">
                             <img 
                                src={URL.createObjectURL(image)} 
                                alt={`preview ${index}`} 
                                className="w-full h-20 object-cover rounded-md border border-gray-200"
                             />
                             <button
                                 onClick={() => handleRemoveImage(index)}
                                 className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                 aria-label="Remove image"
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
        <Button variant="secondary" onClick={onPrevious}>Previous</Button>
        <Button onClick={handleSubmitClick}>Submit</Button>
      </div>
    </div>
  );
} 