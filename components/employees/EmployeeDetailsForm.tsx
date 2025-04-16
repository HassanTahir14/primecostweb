'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/common/button';
import Input from '../common/input'; // Assuming SelectField component
import Select from '../common/select';

interface EmployeeDetailsFormProps {
  onNext: (data: any) => void;
  initialData: any; // Data from previous steps or initial state
}

// Mock options for selects - replace with actual data fetching if needed
const nationalityOptions = [
  { value: 'sa', label: 'Saudi Arabian' },
  { value: 'eg', label: 'Egyptian' },
  { value: 'pk', label: 'Pakistani' },
  { value: 'in', label: 'Indian' },
  // Add more nationalities
];

const positionOptions = [
  { value: 'chef', label: 'Chef' },
  { value: 'head_chef', label: 'Head Chef' },
  { value: 'sous_chef', label: 'Sous Chef' },
  { value: 'waiter', label: 'Waiter' },
  { value: 'admin', label: 'Admin' },
  // Add more positions
];

export default function EmployeeDetailsForm({ onNext, initialData }: EmployeeDetailsFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    familyName: '',
    nationality: '',
    mobileNumber: '',
    position: '',
    healthCardNumber: '',
    iqamaId: '',
    healthCardExpiry: '',
    iqamaIdExpiry: '',
    dateOfBirth: '',
    email: '',
    password: '', 
    ...initialData, // Pre-fill with existing data if any
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
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
        <Select label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} options={nationalityOptions} placeholder="Select country" />
        <Input label="Mobile Number" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} placeholder="Enter value" type="tel" />
        <Select label="Position" name="position" value={formData.position} onChange={handleChange} options={positionOptions} placeholder="Select Position" />
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
        <Button onClick={handleNextClick}>Next</Button>
      </div>
    </div>
  );
} 