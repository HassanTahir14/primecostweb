'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import Button from '@/components/common/button';
import Input from '../common/input'; // Assuming SelectField component
import Select from '../common/select';
import { fetchCountries, formatCountryOptions } from '@/utils/countryUtils';
import { formatPositionName } from '@/utils/formatters';

interface EmployeeDetailsFormProps {
  onNext: (data: any) => void;
  initialData: any; // Data from previous steps or initial state
  onSave?: (data: any) => void;
  errors?: Record<string, string>; // Add errors prop
}

// Interface for the form data state
interface FormDataState {
  firstname: string;
  familyName: string;
  nationality: string;
  mobileNumber: string;
  position: string;
  healthCardNumber: string;
  iqamaId: string;
  healthCardExpiry: string;
  iqamaExpiryDate: string;
  dateOfBirth: string;
  loginId: string;
  password: string;
  [key: string]: any; // Allow for additional properties from initialData
}

// Remove hardcoded nationality options
// const nationalityOptions = [
//   { value: '', label: 'Select country', disabled: true },
//   { value: 'sa', label: 'Saudi Arabian' },
//   { value: 'eg', label: 'Egyptian' },
//   { value: 'pk', label: 'Pakistani' },
//   { value: 'in', label: 'Indian' },
//   // Add more nationalities
// ];

// Update position options to match backend roles
const positionOptions = [
  { value: 'CHEF', label: formatPositionName('CHEF') },
  { value: 'HEAD_CHEF', label: formatPositionName('HEAD_CHEF') },
  { value: 'MANAGER', label: formatPositionName('MANAGER') },
  // Add other valid roles if needed, remove invalid ones like 'waiter', 'admin', 'sous_chef'
];

export default function EmployeeDetailsForm({ onNext, initialData, onSave, errors }: EmployeeDetailsFormProps) {
  const [formData, setFormData] = useState({
    firstname: initialData?.firstname || '',
    familyName: initialData?.familyName || '',
    nationality: initialData?.nationality || '',
    mobileNumber: initialData?.mobileNumber || '',
    position: initialData?.position || '',
    healthCardNumber: initialData?.healthCardNumber || '',
    iqamaId: initialData?.iqamaId || '',
    healthCardExpiry: initialData?.healthCardExpiry || '',
    iqamaExpiryDate: initialData?.iqamaExpiryDate || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    loginId: initialData?.loginId || '',
    password: initialData?.password || ''
  });

  // Add state for country options
  const [nationalityOptions, setNationalityOptions] = useState<{ label: string; value: string; disabled?: boolean }[]>([
    { value: '', label: 'Select country', disabled: true }
  ]);

  // Add state for validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Fetch countries on component mount
  useEffect(() => {
    const loadCountries = async () => {
      const countries = await fetchCountries();
      const formattedOptions = formatCountryOptions(countries);
      setNationalityOptions([
        { value: '', label: 'Select country', disabled: true },
        ...formattedOptions
      ]);
    };
    loadCountries();
  }, []);

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
    setFormData((prev: FormDataState) => ({ ...prev, [name]: value }));
    // Save immediately
    if (onSave) {
      onSave({
        ...formData,
        [name]: value
      });
    }
  };

  // Transform API error keys to form field names
  const getFieldError = (fieldName: string): string | undefined => {
    // Check validation errors first
    if (validationErrors[fieldName]) {
      return validationErrors[fieldName];
    }
    
    // Then check API errors
    if (!errors) return undefined;
    
    // Handle duplicate email error
    if (fieldName === 'loginId' && errors.error?.includes('Duplicate entry') && errors.error?.includes('email')) {
      return 'This email is already registered. Please use a different email address.';
    }
    
    const apiKey = `employeeDetailsRequestDTO.${fieldName}`;
    return errors[apiKey];
  };

  // Add validation function
  const validateForm = (): boolean => {
      const newErrors: Partial<Record<keyof FormDataState, string>> = {};
      
      // First name validation
      if (!formData.firstname.trim()) {
          newErrors.firstname = 'First name is required';
      } else if (formData.firstname.length > 50) {
          newErrors.firstname = 'First name must be between 1 and 50 characters';
      }

      // Email validation
      if (!formData.loginId.trim()) {
          newErrors.loginId = 'Email is required';
      } else if (formData.loginId.length < 5 || formData.loginId.length > 50) {
          newErrors.loginId = 'Email must be between 5 and 50 characters';
      }

      // Iqama expiry date validation
      if (!formData.iqamaExpiryDate) {
          newErrors.iqamaExpiryDate = 'Iqama expiry date is required';
      }

      // Position validation
      if (!formData.position) {
          newErrors.position = 'Position is required';
      }

      // Mobile number validation
      if (!formData.mobileNumber.trim()) {
          newErrors.mobileNumber = 'Mobile number is required';
      }

      // Iqama ID validation
      if (!formData.iqamaId.trim()) {
          newErrors.iqamaId = 'Iqama ID is required';
      }

      // Helper to parse yyyy-mm-dd
      const parseDate = (str: string) => {
        if (!str) return null;
        const [yyyy, mm, dd] = str.split('-');
        if (!yyyy || !mm || !dd) return null;
        return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      };
      const today = new Date();
      today.setHours(0,0,0,0);

      // Health Card Expiry
      if (formData.healthCardExpiry) {
        const expiry = parseDate(formData.healthCardExpiry);
        if (!expiry || isNaN(expiry.getTime())) {
          newErrors.healthCardExpiry = 'Invalid date format';
        } else if (expiry < today) {
          newErrors.healthCardExpiry = 'Health card expiry cannot be in the past';
        }
      }

      // Iqama Expiry
      if (formData.iqamaExpiryDate) {
        const expiry = parseDate(formData.iqamaExpiryDate);
        if (!expiry || isNaN(expiry.getTime())) {
          newErrors.iqamaExpiryDate = 'Invalid date format';
        } else if (expiry < today) {
          newErrors.iqamaExpiryDate = 'Iqama expiry cannot be in the past';
        }
      }

      // Date of Birth
      if (formData.dateOfBirth) {
        const dob = parseDate(formData.dateOfBirth);
        if (!dob || isNaN(dob.getTime())) {
          newErrors.dateOfBirth = 'Invalid date format';
        } else if (dob > today) {
          newErrors.dateOfBirth = 'Date of birth cannot be in the future';
        }
      }

      return Object.keys(newErrors).length === 0;
  };

  const handleNextClick = () => {
    const newErrors: Record<string, string> = {};
    
    // First name validation
    if (!formData.firstname.trim()) {
      newErrors.firstname = 'First name is required';
    } else if (formData.firstname.length > 50) {
      newErrors.firstname = 'First name must be between 1 and 50 characters';
    }

    // Email validation
    if (!formData.loginId.trim()) {
      newErrors.loginId = 'Email is required';
    } else if (formData.loginId.length < 5 || formData.loginId.length > 50) {
      newErrors.loginId = 'Email must be between 5 and 50 characters';
    }

    // Iqama expiry date validation
    if (!formData.iqamaExpiryDate) {
      newErrors.iqamaExpiryDate = 'Iqama expiry date is required';
    }

    // Position validation
    if (!formData.position) {
      newErrors.position = 'Position is required';
    }

    // Mobile number validation
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    }

    // Iqama ID validation
    if (!formData.iqamaId.trim()) {
      newErrors.iqamaId = 'Iqama ID is required';
    }

    // Helper to parse yyyy-mm-dd
    const parseDate = (str: string) => {
      if (!str) return null;
      const [yyyy, mm, dd] = str.split('-');
      if (!yyyy || !mm || !dd) return null;
      return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    };
    const today = new Date();
    today.setHours(0,0,0,0);

    // Health Card Expiry
    if (formData.healthCardExpiry) {
      const expiry = parseDate(formData.healthCardExpiry);
      if (!expiry || isNaN(expiry.getTime())) {
        newErrors.healthCardExpiry = 'Invalid date format';
      } else if (expiry < today) {
        newErrors.healthCardExpiry = 'Health card expiry cannot be in the past';
      }
    }

    // Iqama Expiry
    if (formData.iqamaExpiryDate) {
      const expiry = parseDate(formData.iqamaExpiryDate);
      if (!expiry || isNaN(expiry.getTime())) {
        newErrors.iqamaExpiryDate = 'Invalid date format';
      } else if (expiry < today) {
        newErrors.iqamaExpiryDate = 'Iqama expiry cannot be in the past';
      }
    }

    // Date of Birth
    if (formData.dateOfBirth) {
      const dob = parseDate(formData.dateOfBirth);
      if (!dob || isNaN(dob.getTime())) {
        newErrors.dateOfBirth = 'Invalid date format';
      } else if (dob > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }

    // Update validation errors state
    setValidationErrors(newErrors);

    // If there are no errors, proceed with next step
    if (Object.keys(newErrors).length === 0) {
      // Transform the data to match the API format
      const transformedData = {
        firstname: formData.firstname,
        familyName: formData.familyName,
        nationality: formData.nationality,
        mobileNumber: formData.mobileNumber,
        position: formData.position,
        healthCardNumber: formData.healthCardNumber,
        iqamaId: formData.iqamaId,
        healthCardExpiry: formData.healthCardExpiry,
        iqamaExpiryDate: formData.iqamaExpiryDate,
        dateOfBirth: formData.dateOfBirth,
        email: formData.loginId, // Map loginId to email
        password: formData.password
      };
      
      console.log("Details Data:", transformedData);
      onNext(transformedData);
    }
  };

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-semibold text-gray-800 mb-6">Employee Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <Input 
          label="Name" 
          name="firstname" 
          value={formData.firstname} 
          onChange={handleChange} 
          placeholder="Enter value" 
          error={getFieldError('firstname')} 
        />
        <Input 
          label="Family Name" 
          name="familyName" 
          value={formData.familyName} 
          onChange={handleChange} 
          placeholder="Enter value" 
          error={getFieldError('familyName')} 
        />
        <Select 
          label="Nationality" 
          name="nationality" 
          value={formData.nationality} 
          onChange={handleChange} 
          options={nationalityOptions} 
          error={getFieldError('nationality')} 
        />
        <Input 
          label="Mobile Number" 
          name="mobileNumber" 
          value={formData.mobileNumber} 
          onChange={handleChange} 
          placeholder="Enter value" 
          type="tel" 
          error={getFieldError('mobileNumber')} 
        />
        <Select 
          label="Position" 
          name="position" 
          value={formData.position} 
          onChange={handleChange} 
          options={positionOptions} 
          error={getFieldError('position')} 
        />
        <Input 
          label="Health Card Number" 
          name="healthCardNumber" 
          value={formData.healthCardNumber} 
          onChange={handleChange} 
          placeholder="Health Card Num" 
          error={getFieldError('healthCardNumber')} 
        />
        <Input 
          label="Iqama ID" 
          name="iqamaId" 
          value={formData.iqamaId} 
          onChange={handleChange} 
          placeholder="Enter value" 
          error={getFieldError('iqamaId')} 
        />
        <Input 
          label="Health Card Expiry" 
          name="healthCardExpiry" 
          value={formData.healthCardExpiry} 
          onChange={handleChange} 
          type="date" 
          error={getFieldError('healthCardExpiry')} 
        />
        <Input 
          label="Iqama ID Expiry Date" 
          name="iqamaExpiryDate" 
          value={formData.iqamaExpiryDate} 
          onChange={handleChange} 
          type="date" 
          error={getFieldError('iqamaExpiryDate')} 
        />
        <Input 
          label="Date of Birth" 
          name="dateOfBirth" 
          value={formData.dateOfBirth} 
          onChange={handleChange} 
          type="date" 
          error={getFieldError('dateOfBirth')} 
        />
        <Input 
          label="Email" 
          name="loginId" 
          value={formData.loginId} 
          onChange={handleChange} 
          placeholder="Enter value" 
          type="email" 
          error={getFieldError('loginId')} 
        />
        <Input 
          label="Password" 
          name="password" 
          value={formData.password} 
          onChange={handleChange} 
          placeholder="Enter value" 
          type="password" 
          error={getFieldError('password')} 
        />
      </div>
      
      {/* Action Button */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleNextClick} size="lg" >Next</Button>
      </div>
    </div>
  );
} 