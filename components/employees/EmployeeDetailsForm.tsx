'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import Button from '@/components/common/button';
import Input from '../common/input'; // Assuming SelectField component
import Select from '../common/select';
import { fetchCountries, formatCountryOptions } from '@/utils/countryUtils';
import { formatPositionName } from '@/utils/formatters';
import { useTranslation } from '@/context/TranslationContext';

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
  const { t } = useTranslation();
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
          newErrors.firstname = t('employees.details.errors.firstnameRequired');
      } else if (formData.firstname.length > 50) {
          newErrors.firstname = t('employees.details.errors.firstnameLength');
      }

      // Email validation
      if (!formData.loginId.trim()) {
          newErrors.loginId = t('employees.details.errors.emailRequired');
      } else if (formData.loginId.length < 5 || formData.loginId.length > 50) {
          newErrors.loginId = t('employees.details.errors.emailLength');
      } else {
        // Email format validation
        const emailRegex = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(formData.loginId)) {
          newErrors.loginId = t('employees.details.errors.emailInvalid');
        }
      }

      // Iqama expiry date validation
      if (!formData.iqamaExpiryDate) {
          newErrors.iqamaExpiryDate = t('employees.details.errors.iqamaExpiryDateRequired');
      }

      // Position validation
      if (!formData.position) {
          newErrors.position = t('employees.details.errors.positionRequired');
      }

      // Mobile number validation
      if (!formData.mobileNumber.trim()) {
          newErrors.mobileNumber = t('employees.details.errors.mobileNumberRequired');
      }

      // Iqama ID validation
      if (!formData.iqamaId.trim()) {
          newErrors.iqamaId = t('employees.details.errors.iqamaIdRequired');
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
          newErrors.healthCardExpiry = t('employees.details.errors.invalidDateFormat');
        } else if (expiry < today) {
          newErrors.healthCardExpiry = t('employees.details.errors.healthCardExpiryPast');
        }
      }

      // Iqama Expiry
      if (formData.iqamaExpiryDate) {
        const expiry = parseDate(formData.iqamaExpiryDate);
        if (!expiry || isNaN(expiry.getTime())) {
          newErrors.iqamaExpiryDate = t('employees.details.errors.invalidDateFormat');
        } else if (expiry < today) {
          newErrors.iqamaExpiryDate = t('employees.details.errors.iqamaExpiryPast');
        }
      }

      // Date of Birth
      if (formData.dateOfBirth) {
        const dob = parseDate(formData.dateOfBirth);
        if (!dob || isNaN(dob.getTime())) {
          newErrors.dateOfBirth = t('employees.details.errors.invalidDateFormat');
        } else if (dob > today) {
          newErrors.dateOfBirth = t('employees.details.errors.dobFuture');
        }
      }

      return Object.keys(newErrors).length === 0;
  };

  const handleNextClick = () => {
    const newErrors: Record<string, string> = {};
    
    // First name validation
    if (!formData.firstname.trim()) {
      newErrors.firstname = t('employees.details.errors.firstnameRequired');
    } else if (formData.firstname.length > 50) {
      newErrors.firstname = t('employees.details.errors.firstnameLength');
    }

    // Email validation
    if (!formData.loginId.trim()) {
      newErrors.loginId = t('employees.details.errors.emailRequired');
    } else if (formData.loginId.length < 5 || formData.loginId.length > 50) {
      newErrors.loginId = t('employees.details.errors.emailLength');
    } else {
      // Email format validation
      const emailRegex = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.loginId)) {
        newErrors.loginId = t('employees.details.errors.emailInvalid');
      }
    }

    // Iqama expiry date validation
    if (!formData.iqamaExpiryDate) {
      newErrors.iqamaExpiryDate = t('employees.details.errors.iqamaExpiryDateRequired');
    }

    // Position validation
    if (!formData.position) {
      newErrors.position = t('employees.details.errors.positionRequired');
    }

    // Mobile number validation
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = t('employees.details.errors.mobileNumberRequired');
    }

    // Iqama ID validation
    if (!formData.iqamaId.trim()) {
      newErrors.iqamaId = t('employees.details.errors.iqamaIdRequired');
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
        newErrors.healthCardExpiry = t('employees.details.errors.invalidDateFormat');
      } else if (expiry < today) {
        newErrors.healthCardExpiry = t('employees.details.errors.healthCardExpiryPast');
      }
    }

    // Iqama Expiry
    if (formData.iqamaExpiryDate) {
      const expiry = parseDate(formData.iqamaExpiryDate);
      if (!expiry || isNaN(expiry.getTime())) {
        newErrors.iqamaExpiryDate = t('employees.details.errors.invalidDateFormat');
      } else if (expiry < today) {
        newErrors.iqamaExpiryDate = t('employees.details.errors.iqamaExpiryPast');
      }
    }

    // Date of Birth
    if (formData.dateOfBirth) {
      const dob = parseDate(formData.dateOfBirth);
      if (!dob || isNaN(dob.getTime())) {
        newErrors.dateOfBirth = t('employees.details.errors.invalidDateFormat');
      } else if (dob > today) {
        newErrors.dateOfBirth = t('employees.details.errors.dobFuture');
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
       <h2 className="text-2xl font-semibold text-gray-800 mb-6">{t('employees.details.title')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <Input 
          label={t('employees.details.name')} 
          name="firstname" 
          value={formData.firstname} 
          onChange={handleChange} 
          placeholder={t('employees.details.enterValue')} 
          error={getFieldError('firstname')} 
        />
        <Input 
          label={t('employees.details.familyName')} 
          name="familyName" 
          value={formData.familyName} 
          onChange={handleChange} 
          placeholder={t('employees.details.enterValue')} 
          error={getFieldError('familyName')} 
        />
        <Select 
          label={t('employees.details.nationality')} 
          name="nationality" 
          value={formData.nationality} 
          onChange={handleChange} 
          options={nationalityOptions} 
          error={getFieldError('nationality')} 
        />
        <Input 
          label={t('employees.details.mobileNumber')} 
          name="mobileNumber" 
          value={formData.mobileNumber} 
          onChange={handleChange} 
          placeholder={t('employees.details.enterValue')} 
          // type="tel" 
          error={getFieldError('mobileNumber')} 
        />
        <Select 
          label={t('employees.details.position')} 
          name="position" 
          value={formData.position} 
          onChange={handleChange} 
          options={positionOptions} 
          error={getFieldError('position')} 
        />
        <Input 
          label={t('employees.details.healthCardNumber')} 
          name="healthCardNumber" 
          value={formData.healthCardNumber} 
          onChange={handleChange} 
          placeholder={t('employees.details.healthCardNum')} 
          error={getFieldError('healthCardNumber')} 
        />
        <Input 
          label={t('employees.details.iqamaId')} 
          name="iqamaId" 
          value={formData.iqamaId} 
          onChange={handleChange} 
          placeholder={t('employees.details.enterValue')} 
          error={getFieldError('iqamaId')} 
        />
        <Input 
          label={t('employees.details.healthCardExpiry')} 
          name="healthCardExpiry" 
          value={formData.healthCardExpiry} 
          onChange={handleChange} 
          type="date" 
          error={getFieldError('healthCardExpiry')} 
        />
        <Input 
          label={t('employees.details.iqamaExpiryDate')} 
          name="iqamaExpiryDate" 
          value={formData.iqamaExpiryDate} 
          onChange={handleChange} 
          type="date" 
          error={getFieldError('iqamaExpiryDate')} 
        />
        <Input 
          label={t('employees.details.dateOfBirth')} 
          name="dateOfBirth" 
          value={formData.dateOfBirth} 
          onChange={handleChange} 
          type="date" 
          error={getFieldError('dateOfBirth')} 
        />
        <Input 
          label={t('employees.details.email')} 
          name="loginId" 
          value={formData.loginId} 
          onChange={handleChange} 
          placeholder={t('employees.details.enterValue')} 
          type="email" 
          error={getFieldError('loginId')} 
        />
        <Input 
          label={t('employees.details.password')} 
          name="password" 
          value={formData.password} 
          onChange={handleChange} 
          placeholder={t('employees.details.enterValue')} 
          type="password" 
          error={getFieldError('password')} 
        />
      </div>
      
      {/* Action Button */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleNextClick} size="lg" >{t('employees.details.next')}</Button>
      </div>
    </div>
  );
}