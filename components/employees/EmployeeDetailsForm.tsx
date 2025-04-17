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

// Add default disabled option
const positionOptions = [
  { value: '', label: 'Select Position', disabled: true },
  { value: 'chef', label: 'Chef' },
  { value: 'head_chef', label: 'Head Chef' },
  { value: 'sous_chef', label: 'Sous Chef' },
  { value: 'waiter', label: 'Waiter' },
  { value: 'admin', label: 'Admin' },
  // Add more positions
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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Use the explicit type for prev
    setFormData((prev: FormDataState) => ({
       ...prev, 
       [name]: value 
    }));
  };

  const handleNextClick = () => {
    // Add validation logic here if needed
    console.log("Details Data:", formData);
    onNext(formData);
  };

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-semibold text-gray-800 mb-6">Employee Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Left Column */}
        <Input label="Name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter value" />
        <Input label="Family Name" name="familyName" value={formData.familyName} onChange={handleChange} placeholder="Enter value" />
        <Select label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} options={nationalityOptions} />
        <Input label="Mobile Number" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} placeholder="Enter value" type="tel" />
        <Select label="Position" name="position" value={formData.position} onChange={handleChange} options={positionOptions} />
        <Input label="Health Card Number" name="healthCardNumber" value={formData.healthCardNumber} onChange={handleChange} placeholder="Health Card Num" />
        <Input label="Iqama ID" name="iqamaId" value={formData.iqamaId} onChange={handleChange} placeholder="Enter value" />
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