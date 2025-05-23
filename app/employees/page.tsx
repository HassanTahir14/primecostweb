'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation'; // Import useRouter
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import Link from 'next/link';
import { Edit, Trash2 } from 'lucide-react'; // Import icons for actions and remove Plus icon
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { formatPositionName } from '@/utils/formatters';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrencyValue } from '@/utils/currencyUtils';
import { useTranslation } from '@/context/TranslationContext';

// Import Redux stuff
import { AppDispatch, RootState } from '@/store/store';
import { fetchAllEmployees, clearError as clearEmployeeError, deleteEmployee, setSelectedEmployeeForEdit, Employee } from '@/store/employeeSlice'; // Import deleteEmployee and setSelectedEmployeeForEdit

// Remove mock data
// const totalEmployeesCount = ...;
// const totalPayrollSum = ...;

export default function EmployeesPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter(); // Initialize router
  const { 
    employees, 
    loading: employeesLoading, 
    error: employeesError 
  } = useSelector((state: RootState) => state.employee);
  const { currency } = useCurrency();

  // Modal state
  const [employeeModalMessage, setEmployeeModalMessage] = useState<string>('');
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState<boolean>(false);
  const [isConfirmModal, setIsConfirmModal] = useState<boolean>(false); // Differentiate confirm vs alert
  const [actionEmployeeId, setActionEmployeeId] = useState<number | null>(null);
  const [isDeleteSuccess, setIsDeleteSuccess] = useState<boolean>(false); // Track delete success

  const [formattedSalaries, setFormattedSalaries] = useState<any>({});

  // Fetch employees on mount with retry
  useEffect(() => {
    const fetchData = async () => {
      await dispatch(fetchAllEmployees());
      // Second fetch after a short delay
      setTimeout(async () => {
        await dispatch(fetchAllEmployees());
      }, 1000);
    };

    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (employees && currency) {
      const formatSalaries = async () => {
        try {
          const salaries: {[key: string]: string} = {};
          let totalSum = 0;
          
          // Format individual salaries and calculate total
          for (const emp of employees) {
            const salary = emp.salaryDTO?.totalSalary || 0;
            salaries[emp.employeeId] = await formatCurrencyValue(salary, currency);
            totalSum += salary;
          }
          
          // Format and store the total sum
          salaries['total'] = await formatCurrencyValue(totalSum, currency);
          setFormattedSalaries(salaries);
        } catch (error) {
          console.error('Error formatting salaries:', error);
          setFormattedSalaries({});
        }
      };
      formatSalaries();
    }
  }, [employees, currency]);

  // Show employee error modal if fetch fails
  useEffect(() => {
    if (employeesError && !isEmployeeModalOpen) { // Only show if modal isn't already open for confirm/result
        const errorMsg = typeof employeesError === 'string' ? employeesError : 
                        (employeesError as any)?.description || (employeesError as any)?.message || 'An error occurred with employees.';
        setEmployeeModalMessage(errorMsg);
        setIsConfirmModal(false); // Use alert style for fetch error
        setIsEmployeeModalOpen(true);
        setIsDeleteSuccess(false); // Ensure delete success flag is reset
    }
  }, [employeesError, isEmployeeModalOpen]);

  const handleEmployeeModalClose = () => {
      setIsEmployeeModalOpen(false);
      setEmployeeModalMessage('');
      setActionEmployeeId(null);
      // Clear Redux error state when closing an error modal that wasn't a delete confirmation
      if (employeesError && !isDeleteSuccess) {
         dispatch(clearEmployeeError());
      }
      setIsDeleteSuccess(false); // Reset delete success flag
  };
  
  // Placeholder Handlers for Edit/Delete
  const handleEdit = (id: number) => {
    // Find the employee data from the current state
    const employeeToEdit = employees.find(emp => emp.employeeId === id);

    if (employeeToEdit) {
      console.log("Setting employee for edit:", employeeToEdit);
      // Dispatch action to set this employee in the Redux store
      dispatch(setSelectedEmployeeForEdit(employeeToEdit));
      // Navigate to the edit page
      router.push(`/employees/edit/${id}`); 
    } else {
      // Handle case where employee is not found (shouldn't happen ideally)
      console.error(`Employee with ID ${id} not found in state.`);
      setEmployeeModalMessage(`Could not find details for employee ${id}. Please refresh the list.`);
      setIsConfirmModal(false);
      setIsEmployeeModalOpen(true);
    }
  };

  const handleDeleteClick = (id: number) => {
    console.log("Attempt delete employee:", id);
    setActionEmployeeId(id);
    setEmployeeModalMessage(`Are you sure you want to delete employee ${id}? This action cannot be undone.`);
    setIsConfirmModal(true); // Use confirm style
    setIsEmployeeModalOpen(true);
    setIsDeleteSuccess(false);
  };

  const confirmDelete = async () => {
      if (actionEmployeeId !== null) {
        console.log("Confirm delete employee:", actionEmployeeId);
        setIsConfirmModal(false); // Switch to alert style for result message
        setEmployeeModalMessage('Deleting employee...'); // Indicate processing
        setIsEmployeeModalOpen(true); // Keep modal open

        try {
            const resultAction = await dispatch(deleteEmployee(actionEmployeeId)).unwrap();
            // unwrap() will throw error on rejection
            
            setEmployeeModalMessage(resultAction.description || 'Employee deleted successfully!');
            setIsDeleteSuccess(true);
            setActionEmployeeId(null); // Clear ID after success
            // No need to manually close modal here, user clicks OK

        } catch (rejectedValue) {
            console.error("Delete failed:", rejectedValue);
            const errorMsg = (rejectedValue as any)?.description || (rejectedValue as any)?.message || 'Failed to delete employee.';
            setEmployeeModalMessage(errorMsg);
            setIsDeleteSuccess(false);
             // Keep modal open to show error
        }

      } else {
          // Should not happen if button is clicked correctly
          handleEmployeeModalClose();
      }
  };

  // Calculate totals based on fetched data
  const totalEmployeesCount = employees.length;
  // Calculate total payroll using totalSalary instead of basicSalary
  const totalPayrollSum = employees.reduce((sum, emp) => {
    // Access nested salary details safely
    const salary = emp.salaryDTO?.totalSalary || 0;
    return sum + salary;
  }, 0);

  return (
    <PageLayout title={t('employees.title')}>
      {/* Summary Cards - Updated with Redux data */} 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#00997B] text-white p-5 rounded-lg shadow flex justify-between items-center">
          <span className="font-medium">{t('employees.totalEmployees')}</span>
          <span className="text-3xl font-semibold">{employeesLoading ? '...' : totalEmployeesCount}</span>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-lg shadow flex justify-between items-center">
          <span className="font-medium text-gray-700">{t('employees.totalPayroll')}</span>
          <span className="text-xl font-semibold text-[#00997B]">
            {employeesLoading ? '...' : formattedSalaries['total'] || 'N/A'}
          </span>
        </div>
      </div>

      {/* Main Content Area */} 
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-end items-center gap-4">
          <div className="flex gap-2 flex-shrink-0">
            {/* Other Payroll Button */} 
            <Link href="/employees/other-payroll">
              <Button variant="secondary">{t('employees.otherPayrollTitle')}</Button>
            </Link>
            {/* Create Employee Button */}
            <Link href="/employees/create">
              <Button>{t('employees.createNew')}</Button>
            </Link>
          </div>
        </div>

        {/* Employees Table - Updated with Redux data and actions */} 
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
          {employeesLoading && employees.length === 0 ? ( // Show loading only if list is empty initially
            <div className="text-center py-10 text-gray-500">{t('common.loading')}</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-4 px-6 font-medium text-sm text-gray-500">{t('employees.employeeName')}</th>
                  <th className="py-4 px-6 font-medium text-sm text-gray-500">{t('employees.position')}</th>
                  <th className="py-4 px-6 font-medium text-sm text-gray-500">{t('employees.iqamaId')}</th>
                  <th className="py-4 px-6 font-medium text-sm text-gray-500">{t('employees.iqamaExpiryDate')}</th>
                  <th className="py-4 px-6 font-medium text-sm text-gray-500">{t('employees.salary.totalSalary')}</th>
                  <th className="py-4 px-6 font-medium text-sm text-gray-500">{t('employees.status.title')}</th>
                  {/* <th className="py-4 px-6 font-medium text-sm text-gray-500 text-center">Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {employees && employees.length > 0 ? (
                  employees.map((employee: Employee) => (
                    <tr 
                      key={employee.employeeId} 
                      className="hover:bg-gray-50 border-b border-gray-200 last:border-b-0 cursor-pointer"
                      onClick={(e) => {
                        // Prevent navigation if clicking on action buttons
                        if ((e.target as HTMLElement).closest('.action-buttons')) {
                          return;
                        }
                        router.push(`/employees/${employee.employeeId}`);
                      }}
                    >
                      <td className="py-4 px-6 text-sm">{employee.employeeDetailsDTO?.firstname || 'N/A'}</td>
                      <td className="py-4 px-6 text-sm">{formatPositionName(employee.employeeDetailsDTO?.position) || 'N/A'}</td>
                      <td className="py-4 px-6 text-sm">{employee.employeeDetailsDTO?.iqamaId || 'N/A'}</td>
                      <td className="py-4 px-6 text-sm">{employee.employeeDetailsDTO?.iqamaExpiryDate || 'N/A'}</td>
                      <td className="py-4 px-6 text-sm">
                        {formattedSalaries[employee.employeeId] || 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          employee.employeeDetailsDTO?.active === true 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.employeeDetailsDTO?.active === true ? t('employees.status.current') : t('employees.status.ex')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center space-x-2 action-buttons">
                          {/* <Button 
                            variant="default" 
                             size="sm" 
                            className="rounded-full bg-[#339A89] text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                            disabled={employeesLoading}
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                // First ensure we have fresh data
                                await dispatch(fetchAllEmployees());
                                const employeeToEdit = employees.find(emp => emp.employeeId === employee.employeeId);
                                if (employeeToEdit) {
                                  console.log("Found employee to edit:", employeeToEdit);
                                  // Set the employee in Redux store and wait for it to complete
                                  await dispatch(setSelectedEmployeeForEdit(employeeToEdit));
                                  // Add a small delay to ensure Redux state is updated
                                  await new Promise(resolve => setTimeout(resolve, 100));
                                  // Navigate after we're sure the data is in the store
                                  router.push(`/employees/edit/${employee.employeeId}`);
                                } else {
                                  console.error("Employee not found after fetch");
                                  setEmployeeModalMessage("Could not find employee details. Please try again.");
                                  setIsEmployeeModalOpen(true);
                                }
                              } catch (error) {
                                console.error("Error preparing to edit employee:", error);
                                setEmployeeModalMessage("An error occurred while preparing to edit the employee. Please try again.");
                                setIsEmployeeModalOpen(true);
                              }
                            }}
                          >
                            Edit
                          </Button> */}
                          {/* <Button 
                            variant="destructive" 
                             size="sm" 
                            className="rounded-full bg-red-500 text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(employee.employeeId);
                            }}
                            disabled={employeesLoading}
                          >
                            Delete
                          </Button> */}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500">
                     {employeesError ? t('employees.errorLoading') : t('employees.noEmployees')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Employee Confirmation/Error Modal */}
      <ConfirmationModal
        isOpen={isEmployeeModalOpen}
        onClose={handleEmployeeModalClose}
        onConfirm={isConfirmModal ? confirmDelete : undefined}
        title={isConfirmModal ? t('common.confirmDeletion') : (isDeleteSuccess ? t('common.success') : t('common.error'))}
        message={employeeModalMessage}
        isAlert={!isConfirmModal}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        okText={t('common.ok')}
      />
    </PageLayout>
  );
}