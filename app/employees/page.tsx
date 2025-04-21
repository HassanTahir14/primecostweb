'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation'; // Import useRouter
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import Link from 'next/link';
import { Edit, Trash2 } from 'lucide-react'; // Import icons for actions and remove Plus icon
import ConfirmationModal from '@/components/common/ConfirmationModal';

// Import Redux stuff
import { AppDispatch, RootState } from '@/store/store';
import { fetchAllEmployees, clearError as clearEmployeeError, deleteEmployee, setSelectedEmployeeForEdit, Employee } from '@/store/employeeSlice'; // Import deleteEmployee and setSelectedEmployeeForEdit

// Remove mock data
// const mockEmployees = [...];
// const totalEmployeesCount = ...;
// const totalPayrollSum = ...;

export default function EmployeesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter(); // Initialize router
  const { 
    employees, 
    loading: employeesLoading, 
    error: employeesError 
  } = useSelector((state: RootState) => state.employee);

  // Modal state
  const [employeeModalMessage, setEmployeeModalMessage] = useState<string>('');
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState<boolean>(false);
  const [isConfirmModal, setIsConfirmModal] = useState<boolean>(false); // Differentiate confirm vs alert
  const [actionEmployeeId, setActionEmployeeId] = useState<number | null>(null);
  const [isDeleteSuccess, setIsDeleteSuccess] = useState<boolean>(false); // Track delete success

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
  // Assuming salaryDTO structure and basicSalary exist, adjust if needed
  const totalPayrollSum = employees.reduce((sum, emp) => {
    // Access nested salary details safely
    const salary = emp.salaryDTO?.basicSalary || 0;
    return sum + salary;
  }, 0);

  return (
    <PageLayout title="Kitchen Employees">
      {/* Summary Cards - Updated with Redux data */} 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#00997B] text-white p-5 rounded-lg shadow flex justify-between items-center">
          <span className="font-medium">Total Employees</span>
          <span className="text-3xl font-semibold">{employeesLoading ? '...' : totalEmployeesCount}</span>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-lg shadow flex justify-between items-center">
          <span className="font-medium text-gray-700">Total Payroll</span>
          <span className="text-xl font-semibold text-[#00997B]">
            {employeesLoading ? '...' : `USD ${totalPayrollSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </span>
        </div>
      </div>

      {/* Main Content Area */} 
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-end items-center gap-4">
          <div className="flex gap-2 flex-shrink-0">
            {/* Other Payroll Button */} 
            <Link href="/employees/other-payroll">
              <Button variant="secondary">Other payroll</Button>
            </Link>
            {/* Create Employee Button */}
            <Link href="/employees/create">
              <Button>Create new employee</Button>
            </Link>
          </div>
        </div>

        {/* Employees Table - Updated with Redux data and actions */} 
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
          {employeesLoading && employees.length === 0 ? ( // Show loading only if list is empty initially
            <div className="text-center py-10 text-gray-500">Loading employees...</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-4 px-6 font-medium text-sm text-gray-500">Employee Name</th>
                  <th className="py-4 px-6 font-medium text-sm text-gray-500">Position</th>
                  <th className="py-4 px-6 font-medium text-sm text-gray-500">Iqama ID</th>
                  <th className="py-4 px-6 font-medium text-sm text-gray-500">Iqama Expiry</th>
                  <th className="py-4 px-6 font-medium text-sm text-gray-500">Basic Salary</th>
                  <th className="py-4 px-6 font-medium text-sm text-gray-500 text-center">Actions</th>
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
                      <td className="py-4 px-6 text-sm">{employee.employeeDetailsDTO?.position || 'N/A'}</td>
                      <td className="py-4 px-6 text-sm">{employee.employeeDetailsDTO?.iqamaId || 'N/A'}</td>
                      <td className="py-4 px-6 text-sm">{employee.employeeDetailsDTO?.iqamaExpiryDate || 'N/A'}</td>
                      <td className="py-4 px-6 text-sm">
                        USD {employee.salaryDTO?.basicSalary?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center space-x-2 action-buttons">
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="rounded-full bg-[#339A89] text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                            disabled={employeesLoading}
                            onClick={async (e) => {
                              e.stopPropagation();
                              // First ensure we have fresh data
                              await dispatch(fetchAllEmployees());
                              const employeeToEdit = employees.find(emp => emp.employeeId === employee.employeeId);
                              if (employeeToEdit) {
                                console.log("Found employee to edit:", employeeToEdit);
                                // Set the employee in Redux store
                                await dispatch(setSelectedEmployeeForEdit(employeeToEdit));
                                // Navigate after we're sure the data is in the store
                                router.push(`/employees/edit/${employee.employeeId}`);
                              }
                            }}
                          >
                            Edit
                          </Button>
                          <Button 
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
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500">
                     {employeesError ? 'Error loading data.' : 'No employees found.'}
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
        onConfirm={isConfirmModal ? confirmDelete : undefined} // Only pass confirm handler for confirm modals
        title={isConfirmModal ? 'Confirm Deletion' : (isDeleteSuccess ? 'Success' : 'Error')}
        message={employeeModalMessage}
        isAlert={!isConfirmModal} // Use alert if not confirm
        confirmText="Delete"
        cancelText="Cancel"
        okText="OK"
      />
    </PageLayout>
  );
} 