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
  const [isLoading, setIsLoading] = useState(true);
  
  const [modalMessage, setModalMessage] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  
  console.log("Selected Employee Data:", selectedEmployee);

  useEffect(() => {
    const loadEmployeeData = async () => {
      setIsLoading(true);
      try {
        if (!selectedEmployee || selectedEmployee.employeeId !== employeeId) {
          console.log("Employee not found in Redux store, fetching all employees");
          const result = await dispatch(fetchAllEmployees());
          if (result.payload) {
            const foundEmployee = result.payload.find((emp: Employee) => emp.employeeId === employeeId);
            if (foundEmployee) {
              console.log("Found employee in API response:", foundEmployee);
              await dispatch(setSelectedEmployeeForEdit(foundEmployee));
              // Add a small delay to ensure Redux state is updated
              await new Promise(resolve => setTimeout(resolve, 100));
            } else {
              console.error("Employee not found in API response");
              setModalMessage(`Employee with ID ${employeeId} not found. Please verify the employee ID and try again.`);
              setIsModalOpen(true);
              router.push('/employees'); // Redirect back to employees list
            }
          } else {
            console.error("No employees returned from API");
            setModalMessage("Unable to fetch employee data. Please try again.");
            setIsModalOpen(true);
            router.push('/employees');
          }
        } else {
          console.log("Employee already in Redux store:", selectedEmployee);
        }
      } catch (error) {
        console.error("Error loading employee data:", error);
        setModalMessage("An error occurred while loading employee data. Please try again.");
        setIsModalOpen(true);
        router.push('/employees');
      } finally {
        setIsLoading(false);
      }
    };

    loadEmployeeData();
  }, [employeeId, dispatch, selectedEmployee, router]);

  useEffect(() => {
    if (selectedEmployee && selectedEmployee.employeeId === employeeId) {
      const transformedData = {
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
        
        dutySchedulesDTO: selectedEmployee.dutyScheduleResponseList || [],
        
        basicSalary: selectedEmployee.salaryDTO?.basicSalary?.toString() || '',
        foodAllowance: selectedEmployee.salaryDTO?.foodAllowance?.toString() || '',
        accommodationAllowance: selectedEmployee.salaryDTO?.accommodationAllowance?.toString() || '',
        transportAllowance: selectedEmployee.salaryDTO?.transportAllowance?.toString() || '',
        mobileAllowance: selectedEmployee.salaryDTO?.mobileAllowance?.toString() || '',
        otherAllowance: selectedEmployee.salaryDTO?.otherAllowance?.toString() || '',
        
        existingImages: selectedEmployee.images || []
      };
      
      setEmployeeData(transformedData);
      setIsLoading(false);
    }
  }, [selectedEmployee, employeeId]);

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
      if (isLoading || employeeLoading) {
          return (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-[#00997B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading employee data...</p>
              </div>
            </div>
          );
      }

      if (employeeError) {
          return (
            <div className="text-center p-10 text-red-500">
              Failed to load employee data. {employeeError}
            </div>
          );
      }

      if (!selectedEmployee) {
          return (
            <div className="text-center p-10 text-orange-500">
              Employee data not found. Please select an employee from the list.
            </div>
          );
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

  const renderContent = () => {
    if (isLoading || employeeLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#00997B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading employee data...</p>
          </div>
        </div>
      );
    }

    if (employeeError) {
      return (
        <div className="text-center p-10 text-red-500">
          Failed to load employee data. {employeeError}
        </div>
      );
    }

    if (!selectedEmployee) {
      return (
        <div className="text-center p-10 text-orange-500">
          Employee data not found. Please select an employee from the list.
        </div>
      );
    }

    return (
      <>
        <div className="flex border-b border-gray-200 mb-6">
          {steps.map((step) => (
            <button
              key={step}
              onClick={() => setActiveStep(step)}
              className={`py-3 px-6 font-medium text-sm transition-colors duration-150 
                ${activeStep === step 
                  ? 'border-b-2 border-[#00997B] text-[#00997B]' 
                  : 'text-gray-500 hover:text-gray-700'}`}
            >
              {step}
            </button>
          ))}
        </div>

        <div>
          {renderStepContent()} 
        </div>
      </>
    );
  };

  return (
    <PageLayout title={`Edit Employee #${employeeId}`}>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <Link href="/employees" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
            <ArrowLeft size={20} />
            <span>Back to Employees</span>
          </Link>
        </div>

        {renderContent()}
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