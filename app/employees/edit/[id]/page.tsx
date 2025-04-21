'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation'; 
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ConfirmationModal from '@/components/common/ConfirmationModal';

// Import form components
import EmployeeDetailsForm from '@/components/employees/EmployeeDetailsForm';
import EmployeeDutyScheduleForm from '@/components/employees/EmployeeDutyScheduleForm';
import EmployeeSalaryForm from '@/components/employees/EmployeeSalaryForm';

// Import Redux stuff
import { AppDispatch, RootState } from '@/store/store';
import { 
  updateEmployee, 
  clearError, 
  clearSelectedEmployee, 
  Employee,
  fetchAllEmployees,
  setSelectedEmployeeForEdit
} from '@/store/employeeSlice';

type Step = 'Details' | 'Duty Schedule' | 'Salary';

const steps: Step[] = ['Details', 'Duty Schedule', 'Salary'];

export default function EditEmployeePage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams();
  const employeeId = Number(params.id); 

  const { 
    selectedEmployee, 
    loading: employeeLoading, 
    error: employeeError 
  } = useSelector((state: RootState) => state.employee);

  const [activeStep, setActiveStep] = useState<Step>('Details');
  const [employeeData, setEmployeeData] = useState<any>({}); 
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  const [modalMessage, setModalMessage] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  
  console.log("Selected Employee Data:", selectedEmployee);

  useEffect(() => {
    const loadEmployeeData = async () => {
      if (!selectedEmployee || selectedEmployee.employeeId !== employeeId) {
        // First attempt to get fresh data
        await dispatch(fetchAllEmployees());
        
        // Second attempt after a delay to ensure we have the latest data
        setTimeout(async () => {
          await dispatch(fetchAllEmployees());
          
          // After second fetch, check if we have the employee data
          const state = (await dispatch(fetchAllEmployees())).payload;
          if (state && Array.isArray(state)) {
            const foundEmployee = state.find(emp => emp.employeeId === employeeId);
            if (foundEmployee) {
              dispatch(setSelectedEmployeeForEdit(foundEmployee));
            }
          }
        }, 1000);
      }
    };

    if (!initialLoadComplete) {
      loadEmployeeData();
    }

    if (selectedEmployee && selectedEmployee.employeeId === employeeId && !initialLoadComplete) {
      console.log("Selected Employee Data:", selectedEmployee);
      
      const transformedData = {
        // Personal Details
        firstname: selectedEmployee.employeeDetailsDTO?.firstname || '',
        familyName: selectedEmployee.employeeDetailsDTO?.familyName || '',
        nationality: selectedEmployee.employeeDetailsDTO?.nationality || '',
        mobileNumber: selectedEmployee.employeeDetailsDTO?.mobileNumber || '',
        position: selectedEmployee.employeeDetailsDTO?.position || '',
        healthCardNumber: selectedEmployee.employeeDetailsDTO?.healthCardNumber || '',
        iqamaId: selectedEmployee.employeeDetailsDTO?.iqamaId || '',
        healthCardExpiry: selectedEmployee.employeeDetailsDTO?.healthCardExpiry || '',
        iqamaExpiryDate: selectedEmployee.employeeDetailsDTO?.iqamaExpiryDate || '',
        dateOfBirth: selectedEmployee.employeeDetailsDTO?.dateOfBirth || '',
        loginId: selectedEmployee.employeeDetailsDTO?.loginId || '',
        password: selectedEmployee.employeeDetailsDTO?.password || '',
        
        // Duty Schedule
        dutySchedulesDTO: selectedEmployee.dutyScheduleResponseList || [],
        
        // Salary Details
        basicSalary: selectedEmployee.salaryDTO?.basicSalary?.toString() || '',
        foodAllowance: selectedEmployee.salaryDTO?.foodAllowance?.toString() || '',
        accommodationAllowance: selectedEmployee.salaryDTO?.accommodationAllowance?.toString() || '',
        transportAllowance: selectedEmployee.salaryDTO?.transportAllowance?.toString() || '',
        mobileAllowance: selectedEmployee.salaryDTO?.mobileAllowance?.toString() || '',
        otherAllowance: selectedEmployee.salaryDTO?.otherAllowance?.toString() || '',
        
        // Images
        existingImages: selectedEmployee.images || []
      };
      
      console.log("Transformed Data for Forms:", transformedData);
      setEmployeeData(transformedData);
      setInitialLoadComplete(true);
    } 
    // Only redirect if we've waited longer and still don't have data
    else if (!selectedEmployee && !employeeLoading && initialLoadComplete) {
      const timer = setTimeout(() => {
        console.warn(`No selected employee found in state for ID: ${employeeId}. Redirecting to employees list.`);
        router.push('/employees');
      }, 3000); // Wait 3 seconds before redirecting
      
      return () => clearTimeout(timer);
    }
  }, [selectedEmployee, employeeId, initialLoadComplete, employeeLoading, router, dispatch]);

  useEffect(() => {
    if (employeeError && !isModalOpen) {
        const errorMsg = typeof employeeError === 'string' ? employeeError : 
                        (employeeError as any)?.description || (employeeError as any)?.message || 'An error occurred.';
        setModalMessage(errorMsg);
        setIsModalOpen(true);
        setIsSuccess(false);
    }
  }, [employeeError, isModalOpen]);

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
    const images = completeData.newImages || [];
    const imageIdsToRemove = completeData.imageIdsToRemove || [];
    
    delete completeData.newImages;
    delete completeData.imageIdsToRemove;
    
    console.log("Updating Employee Data:", completeData);
    console.log("New Images:", images);
    console.log("Image IDs to Remove:", imageIdsToRemove);
    
    dispatch(clearError());
    setIsSuccess(false);

    try {
        const resultAction = await dispatch(updateEmployee({ 
            employeeId,
            employeeData: completeData, 
            images, 
            imageIdsToRemove 
        }));

        if (updateEmployee.fulfilled.match(resultAction)) {
            const successMsg = resultAction.payload?.description || 'Employee updated successfully!';
            setModalMessage(successMsg);
            setIsModalOpen(true);
            setIsSuccess(true); 
        } else {
            const errorPayload = resultAction.payload as any;
            const errorMsg = errorPayload?.description || errorPayload?.message || employeeError || 'Failed to update employee.';
            setModalMessage(errorMsg);
            setIsModalOpen(true);
            setIsSuccess(false);
        }
    } catch (error: any) { 
         console.error("Update error:", error);
         setModalMessage(error.message || 'An unexpected error occurred during update.');
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
      if (!initialLoadComplete) {
          if (employeeLoading || (!selectedEmployee && !employeeError)){
              return <div className="text-center p-10">Loading employee data...</div>;
          } else if (!selectedEmployee && employeeError) {
               return <div className="text-center p-10 text-red-500">Failed to load employee data.</div>;
          } else if (!selectedEmployee) {
               return <div className="text-center p-10 text-orange-500">Employee data not found. Please select an employee from the list.</div>;
          }
      } 
      
      switch (activeStep) {
          case 'Details':
              return <EmployeeDetailsForm onNext={handleNext} initialData={employeeData} />;
          case 'Duty Schedule':
              return <EmployeeDutyScheduleForm onNext={handleNext} onPrevious={handlePrevious} initialData={employeeData} />;
          case 'Salary':
              const existingImages = selectedEmployee?.images || [];
              return <EmployeeSalaryForm 
                        onSubmit={handleSubmit} 
                        onPrevious={handlePrevious} 
                        initialData={employeeData} 
                        existingImages={existingImages} 
                        isLoading={employeeLoading}
                     />;
          default:
              return null;
      }
  };

  // Clear selected employee when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearSelectedEmployee());
    };
  }, [dispatch]);

  return (
    <PageLayout title={`Edit Employee #${employeeId}`}>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <Link href="/employees" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
            <ArrowLeft size={20} />
            <span>Back to Employees</span>
          </Link>
        </div>

        <div className="flex border-b border-gray-200 mb-6">
          {steps.map((step) => (
            <button
              key={step}
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

        <div>
          {renderStepContent()} 
        </div>
      </div>
      
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isSuccess ? 'Success' : 'Error'}
        message={modalMessage}
        isAlert={true}
        okText="OK"
      />
    </PageLayout>
  );
} 