'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import Button from '@/components/common/button';
import Input from '../common/input'; // Assuming SelectField component
import Select from '../common/select';

interface EmployeeDetailsFormProps {
  onNext: (data: any) => void;
  initialData: any; // Data from previous steps or initial state
}

// Interface for the form data state
interface FormDataState {
  name: string;
  familyName: string;
  nationality: string;
  mobileNumber: string;
  position: string;
  healthCardNumber: string;
  iqamaId: string;
  healthCardExpiry: string;
  iqamaIdExpiry: string;
  dateOfBirth: string;
  email: string;
  password: string;
  [key: string]: any; // Allow for additional properties from initialData
}

// Add default disabled option
const nationalityOptions = [
  { value: '', label: 'Select country', disabled: true },
  { value: 'sa', label: 'Saudi Arabian' },
  { value: 'eg', label: 'Egyptian' },
  { value: 'pk', label: 'Pakistani' },
  { value: 'in', label: 'Indian' },
  // Add more nationalities
];

// Update position options to match backend roles
const positionOptions = [
  { value: '', label: 'Select Position', disabled: true },
  { value: 'CHEF', label: 'Chef' },
  { value: 'HEAD_CHEF', label: 'Head Chef' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'ASSISTANT', label: 'Assistant' },
  // Add other valid roles if needed, remove invalid ones like 'waiter', 'admin', 'sous_chef'
];

export default function EmployeeDetailsForm({ onNext, initialData }: EmployeeDetailsFormProps) {
  const [formData, setFormData] = useState<FormDataState>(() => ({
    name: '',
    familyName: '',
    nationality: '', // Default to empty string for controlled component
    mobileNumber: '',
    position: '', // Default to empty string for controlled component
    healthCardNumber: '',
    iqamaId: '',
    healthCardExpiry: '',
    iqamaIdExpiry: '',
    dateOfBirth: '',
    email: '',
    password: '', 
    ...initialData, // Pre-fill with existing data if any
  }));

  // Ensure initial data uses empty string if value is null/undefined for selects
  useEffect(() => {
      setFormData(prev => ({
          ...prev,
          nationality: initialData.nationality || '',
          position: initialData.position || '',
      }));
  }, [initialData]);

  // Add state for validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof FormDataState, string>>>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: FormDataState) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Add validation function
  const validateForm = (): boolean => {
      const newErrors: Partial<Record<keyof FormDataState, string>> = {};
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.position) newErrors.position = 'Position is required';
      if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required'; // Add mobile validation if needed
      if (!formData.iqamaId.trim()) newErrors.iqamaId = 'Iqama ID is required';
      // Add more specific validations (email format, date format, etc.) if necessary
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handleNextClick = () => {
    if (!validateForm()) {
        // Optionally show an alert or focus the first error field
        console.warn("Validation failed:", errors);
        return; 
    }
    console.log("Details Data:", formData);
    onNext(formData);
  };

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-semibold text-gray-800 mb-6">Employee Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Add error display to relevant fields */}
        <Input label="Name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter value" error={errors.name} />
        <Input label="Family Name" name="familyName" value={formData.familyName} onChange={handleChange} placeholder="Enter value" />
        <Select label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} options={nationalityOptions} />
        <Input label="Mobile Number" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} placeholder="Enter value" type="tel" error={errors.mobileNumber} />
        <Select label="Position" name="position" value={formData.position} onChange={handleChange} options={positionOptions} error={errors.position} />
        <Input label="Health Card Number" name="healthCardNumber" value={formData.healthCardNumber} onChange={handleChange} placeholder="Health Card Num" />
        <Input label="Iqama ID" name="iqamaId" value={formData.iqamaId} onChange={handleChange} placeholder="Enter value" error={errors.iqamaId} />
        <Input label="Health Card Expiry" name="healthCardExpiry" value={formData.healthCardExpiry} onChange={handleChange} placeholder="dd/mm/yyyy" type="text" /> 
        <Input label="Iqama ID Expiry Date" name="iqamaIdExpiry" value={formData.iqamaIdExpiry} onChange={handleChange} placeholder="dd/mm/yyyy" type="text" /> 
        <Input label="Date of Birth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} placeholder="dd/mm/yyyy" type="text" /> 
        <Input label="Email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter value" type="email" />
        <Input label="Password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter value" type="password" />
      </div>
      
      {/* Action Button */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleNextClick} size="lg" >Next</Button>
      </div>
    </div>
  );
} 