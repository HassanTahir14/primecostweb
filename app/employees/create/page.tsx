'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation'; // Import useRouter for redirection
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ConfirmationModal from '@/components/common/ConfirmationModal'; // Import the modal
import { useTranslation } from '@/context/TranslationContext';

// Import form components
import EmployeeDetailsForm from '@/components/employees/EmployeeDetailsForm';
import EmployeeDutyScheduleForm from '@/components/employees/EmployeeDutyScheduleForm';
import EmployeeSalaryForm from '@/components/employees/EmployeeSalaryForm';

// Import Redux stuff
import { AppDispatch, RootState } from '@/store/store';
import { addEmployee, clearError } from '@/store/employeeSlice';

type Step = 'Details' | 'Duty Schedule' | 'Salary';

const steps: Step[] = ['Details', 'Duty Schedule', 'Salary'];

export default function CreateEmployeePage() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading: employeeLoading, error: employeeError } = useSelector((state: RootState) => state.employee);

  const [activeStep, setActiveStep] = useState<Step>('Details');
  const [employeeData, setEmployeeData] = useState<any>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Modal state
  const [modalMessage, setModalMessage] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isModalAlert, setIsModalAlert] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false); // To track if submit was successful for modal logic

  // Clear local storage when component unmounts
  useEffect(() => {
    return () => {
      localStorage.removeItem('employeeDutySchedule');
    };
  }, []);

  const handleNext = (data: any) => {
    setEmployeeData((prev: any) => ({ ...prev, ...data }));
    const currentIndex = steps.indexOf(activeStep);
    if (currentIndex < steps.length - 1) {
      setActiveStep(steps[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const currentIndex = steps.indexOf(activeStep);
    if (currentIndex > 0) {
      setActiveStep(steps[currentIndex - 1]);
    }
  };

  const handleSave = (data: any) => {
    setEmployeeData((prev: any) => ({ ...prev, ...data }));
  };

  const handleTabClick = (step: Step) => {
    setActiveStep(step);
  };

  const handleSubmit = async (finalSalaryData: any) => {
    const completeData = { ...employeeData, ...finalSalaryData };
    const images = completeData.newImages || [];
    // Remove imageIdsToRemove from payload if not in AddEmployeePayload type
    delete completeData.newImages;
    
    console.log("Creating Employee Data:", completeData);
    console.log("New Images:", images);
    
    dispatch(clearError());
    setIsSuccess(false);
    setValidationErrors({}); // Clear previous validation errors

    try {
        const resultAction = await dispatch(addEmployee({ 
            employeeData: completeData, 
            images, 
        }));

        if (addEmployee.fulfilled.match(resultAction)) {
            const successMsg = resultAction.payload?.description || 'Employee created successfully!';
            setModalMessage(successMsg);
            setIsModalOpen(true);
            setIsSuccess(true); 
        } else {
            const errorPayload = resultAction.payload as any;
            if (errorPayload?.errors) {
                // Handle validation errors
                setValidationErrors(errorPayload.errors);
                // Show the first error in the modal
                const firstErrorKey = Object.keys(errorPayload.errors)[0];
                setModalMessage(errorPayload.errors[firstErrorKey]);
                setIsModalOpen(true);
                setIsSuccess(false);
            } else if (errorPayload?.error) {
                // Handle duplicate email error
                setValidationErrors({ error: errorPayload.error });
                setModalMessage('This email is already registered. Please use a different email address.');
                setIsModalOpen(true);
                setIsSuccess(false);
            } else {
                const errorMsg = errorPayload?.description || errorPayload?.message || employeeError || 'Failed to create employee.';
                setModalMessage(errorMsg);
                setIsModalOpen(true);
                setIsSuccess(false);
            }
        }
    } catch (error: any) { 
         console.error("Create error:", error);
         setModalMessage(error.message || 'An unexpected error occurred during creation.');
         setIsModalOpen(true);
         setIsSuccess(false);
    }
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setModalMessage('');
      if (isSuccess) {
          router.push('/employees');
      } else {
          dispatch(clearError());
      }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 'Details':
        return <EmployeeDetailsForm 
          onNext={handleNext} 
          initialData={employeeData} 
          onSave={handleSave} 
          errors={validationErrors}
        />;
      case 'Duty Schedule':
        return <EmployeeDutyScheduleForm 
          onNext={handleNext} 
          onPrevious={handlePrevious} 
          initialData={employeeData} 
          onSave={handleSave} 
        />;
      case 'Salary':
        return <EmployeeSalaryForm 
          onSubmit={handleSubmit} 
          onPrevious={handlePrevious} 
          initialData={employeeData} 
          isLoading={employeeLoading} 
          onSave={handleSave}
          errors={validationErrors}
        />;
      default:
        return null;
    }
  };

  return (
    <PageLayout title={t('employees.createTitle')}>
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/employees" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
            <ArrowLeft size={20} />
            <span>{t('common.backToEmployees')}</span>
          </Link>
        </div>

        {/* Step Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {steps.map((step) => (
            <button
              key={step}
              onClick={() => handleTabClick(step)}
              className={`py-3 px-6 font-medium text-sm transition-colors duration-150 
                ${activeStep === step 
                  ? 'border-b-2 border-[#00997B] text-[#00997B]' 
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {t(`employees.steps.${step.toLowerCase().replace(' ', '_')}`)}
            </button>
          ))}
        </div>

        {/* Form Content Area */}
        <div>
          {renderStepContent()} 
        </div>
      </div>
      
      {/* Confirmation/Error Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isSuccess ? t('common.success') : t('common.error')}
        message={modalMessage}
        isAlert={true}
        okText={t('common.ok')}
      />
    </PageLayout>
  );
}