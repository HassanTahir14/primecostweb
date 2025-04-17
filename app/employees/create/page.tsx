'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation'; // Import useRouter for redirection
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ConfirmationModal from '@/components/common/ConfirmationModal'; // Import the modal

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
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading: employeeLoading, error: employeeError } = useSelector((state: RootState) => state.employee);

  const [activeStep, setActiveStep] = useState<Step>('Details');
  const [employeeData, setEmployeeData] = useState<any>({}); // Store data across steps
  
  // Modal state
  const [modalMessage, setModalMessage] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isModalAlert, setIsModalAlert] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false); // To track if submit was successful for modal logic

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
  
  const handleSubmit = async (finalSalaryData: any) => {
    const completeData = { ...employeeData, ...finalSalaryData };
    const images = completeData.images || []; // Extract images
    delete completeData.images; // Remove images from the main data object passed to slice
    
    console.log("Submitting Employee Data:", completeData);
    console.log("Submitting Images:", images);
    
    // Clear previous errors
    dispatch(clearError());
    setIsSuccess(false);

    try {
        const resultAction = await dispatch(addEmployee({ employeeData: completeData, images }));

        if (addEmployee.fulfilled.match(resultAction)) {
            const successMsg = resultAction.payload?.description || 'Employee created successfully!';
            setModalMessage(successMsg);
            setIsModalAlert(true); // Use alert style for success
            setIsModalOpen(true);
            setIsSuccess(true); // Flag success
            // Optionally reset form state here: setEmployeeData({}); setActiveStep('Details');
        } else {
            // Error handled by rejected case, but grab message if available in payload
            const errorPayload = resultAction.payload as any;
            const errorMsg = errorPayload?.description || errorPayload?.message || employeeError || 'Failed to create employee.';
            setModalMessage(errorMsg);
            setIsModalAlert(true);
            setIsModalOpen(true);
            setIsSuccess(false);
        }
    } catch (error: any) { // Catch unexpected errors
         console.error("Submission error:", error);
         setModalMessage(error.message || 'An unexpected error occurred during submission.');
         setIsModalAlert(true);
         setIsModalOpen(true);
         setIsSuccess(false);
    }
  };

  // Close modal and redirect/reset if submission was successful
  const handleCloseModal = () => {
      setIsModalOpen(false);
      setModalMessage('');
      if (isSuccess) {
          // Redirect to employees list after successful creation
          router.push('/employees'); 
      } else {
          // Clear Redux error state if modal is closed after showing an error
          dispatch(clearError());
      }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 'Details':
        return <EmployeeDetailsForm onNext={handleNext} initialData={employeeData} />;
      case 'Duty Schedule':
        return <EmployeeDutyScheduleForm onNext={handleNext} onPrevious={handlePrevious} initialData={employeeData} />;
      case 'Salary':
        // Pass employeeLoading state to disable submit button while loading
        return <EmployeeSalaryForm onSubmit={handleSubmit} onPrevious={handlePrevious} initialData={employeeData} />;
      default:
        return null;
    }
  };

  // Update Submit button in EmployeeSalaryForm to show loading state
  // Need to pass `employeeLoading` down or handle loading state here.
  // For simplicity, let's modify EmployeeSalaryForm directly later if needed,
  // or ideally, the submit button should be part of this parent component.
  // For now, the loading state is available here.

  return (
    <PageLayout title="Create New Employee">
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/employees" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
            <ArrowLeft size={20} />
            <span>Back to Employees</span>
          </Link>
        </div>

        {/* Step Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {steps.map((step) => (
            <button
              key={step}
              // Disable navigation by clicking tabs while submitting
              disabled={employeeLoading}
              onClick={() => {!employeeLoading && setActiveStep(step)}}
              className={`py-3 px-6 font-medium text-sm transition-colors duration-150 
                ${activeStep === step 
                  ? 'border-b-2 border-[#00997B] text-[#00997B]' 
                  : 'text-gray-500 hover:text-gray-700'
              } ${employeeLoading ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              {step}
            </button>
          ))}
        </div>

        {/* Form Content Area */}
        <div>
          {renderStepContent()} 
        </div>

        {/* Render Submit button here maybe? Or pass loading state down */} 
        {/* If kept in Salary form, need to pass `isLoading={employeeLoading}` prop */}

      </div>
      
      {/* Confirmation/Error Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isSuccess ? 'Success' : 'Error'}
        message={modalMessage}
        isAlert={true} // Always use alert style for create feedback
        okText="OK"
      />
    </PageLayout>
  );
} 