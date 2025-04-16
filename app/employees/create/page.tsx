'use client';

import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Import form components (assuming they will be created)
import EmployeeDetailsForm from '@/components/employees/EmployeeDetailsForm';
import EmployeeDutyScheduleForm from '@/components/employees/EmployeeDutyScheduleForm';
import EmployeeSalaryForm from '@/components/employees/EmployeeSalaryForm';

type Step = 'Details' | 'Duty Schedule' | 'Salary';

const steps: Step[] = ['Details', 'Duty Schedule', 'Salary'];

export default function CreateEmployeePage() {
  const [activeStep, setActiveStep] = useState<Step>('Details');
  const [employeeData, setEmployeeData] = useState({}); // To store data across steps

  const handleNext = (data: any) => {
    setEmployeeData({ ...employeeData, ...data });
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
  
  const handleSubmit = (finalData: any) => {
    const completeData = { ...employeeData, ...finalData };
    console.log("Submitting Employee Data:", completeData);
    // TODO: Add actual submission logic (e.g., API call)
    // Redirect or show success message
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 'Details':
        return <EmployeeDetailsForm onNext={handleNext} initialData={employeeData} />;
      case 'Duty Schedule':
        return <EmployeeDutyScheduleForm onNext={handleNext} onPrevious={handlePrevious} initialData={employeeData} />;
      case 'Salary':
        return <EmployeeSalaryForm onSubmit={handleSubmit} onPrevious={handlePrevious} initialData={employeeData} />;
      default:
        return null;
    }
  };

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
              onClick={() => setActiveStep(step)} // Allow clicking tabs to navigate (optional)
              className={`py-3 px-6 font-medium text-sm transition-colors duration-150 
                ${activeStep === step 
                  ? 'border-b-2 border-[#00997B] text-[#00997B]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {step}
            </button>
          ))}
        </div>

        {/* Form Content Area */}
        <div>
          {renderStepContent()}
        </div>
      </div>
    </PageLayout>
  );
} 