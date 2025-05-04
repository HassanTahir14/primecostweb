import api from './api';

const formatDateToYyyyMmDd = (dateString: string | null | undefined): string | null => {
    if (!dateString) return null;
    // Basic check for DD/MM/YYYY format
    const parts = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (parts) {
        // parts[1] is DD, parts[2] is MM, parts[3] is YYYY
        return `${parts[3]}-${parts[2]}-${parts[1]}`;
    }
    // Assume it might already be in YYYY-MM-DD or is invalid, return as is or null if preferred
    // Returning as is for now, but might need stricter validation
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString; 
    }
    // If format is unexpected, return null or throw error
    console.warn(`Unexpected date format received: ${dateString}. Expected DD/MM/YYYY.`);
    return null; 
};

// Helper to format time string "HH:MM" to time object (for potential internal use)
const formatStringToTimeObject = (timeString: string | null | undefined) => {
  if (!timeString || !/^\d{2}:\d{2}$/.test(timeString)) {
    return { hour: 0, minute: 0, second: 0, nano: 0 }; 
  }
  const [hour, minute] = timeString.split(':').map(Number);
  return { hour, minute, second: 0, nano: 0 };
};

// Helper to format time object back to "HH:MM" string for API
const formatTimeObjectToString = (timeObject: any): string | null => {
    if (!timeObject || typeof timeObject.hour !== 'number' || typeof timeObject.minute !== 'number') {
        // Return null or default string if object is invalid
        return null; 
    }
    const hour = String(timeObject.hour).padStart(2, '0');
    const minute = String(timeObject.minute).padStart(2, '0');
    return `${hour}:${minute}`;
};

export const employeeApi = {
  fetchAll: async () => {
    const response = await api.get('/kitchen/employees');
    if (response.data && response.data.responseCode === '0000') {
        return response.data.kitchenEmployeeDTOS || [];
    } else {
        throw new Error(response.data?.description || 'Failed to fetch employees');
    }
  },

  // Fetch Employee by ID
  fetchById: async (employeeId: number) => {
    const response = await api.get(`/kitchen/employees/${employeeId}`);
    if (response.data && response.data.responseCode === '0000') {
      // Assuming the API returns the employee data directly or nested
      // Adjust if the structure is different (e.g., response.data.employee)
      return response.data; 
    } else {
      throw new Error(response.data?.description || `Failed to fetch employee with ID ${employeeId}`);
    }
  },

  add: async (employeeData: any, images: File[]) => {
    console.log('API received images for add:', images);
    // Create the JSON part, formatting times back to strings
    const requestDto = {
        employeeDetailsRequestDTO: {
            firstname: employeeData.firstname || '',
            position: employeeData.position || '',
            mobileNumber: employeeData.mobileNumber || '',
            iqamaExpiryDate: formatDateToYyyyMmDd(employeeData.iqamaExpiryDate),
            familyName: employeeData.familyName || '',
            iqamaId: employeeData.iqamaId || '',
            dateOfBirth: formatDateToYyyyMmDd(employeeData.dateOfBirth),
            nationality: employeeData.nationality || '',
            email: employeeData.email || '',
            healthCardExpiry: formatDateToYyyyMmDd(employeeData.healthCardExpiry),
            healthCardNumber: employeeData.healthCardNumber || '',
            password: employeeData.password || ''
        },
        // Format time objects back to HH:MM strings here
        dutySchedules: (employeeData.dutySchedulesDTO || []).map((schedule: any) => ({
            day: schedule.day,
            openingShift: formatTimeObjectToString(schedule.openingShift),
            breakTime: formatTimeObjectToString(schedule.breakTime),
            closingShift: formatTimeObjectToString(schedule.closingShift)
        })),
        salaryRequestDTO: {
            basicSalary: parseFloat(employeeData.basicSalary) || 0,
            foodAllowance: parseFloat(employeeData.foodAllowance) || 0,
            accommodationAllowance: parseFloat(employeeData.accommodationAllowance) || 0,
            transportAllowance: parseFloat(employeeData.transportAllowance) || 0,
            otherAllowance: parseFloat(employeeData.otherAllowance) || 0,
            totalSalary: parseFloat(employeeData.totalSalary) || 0,
            mobileAllowance: parseFloat(employeeData.telephoneAllowance) || 0
        }
    };

    // Create FormData
    const formData = new FormData();
    
    // Append the JSON part as a Blob named 'request'
    formData.append('request', new Blob([JSON.stringify(requestDto)], { type: 'application/json' }));

    // Append images
    if (images && images.length > 0) {
        images.forEach((image) => {
            formData.append('images', image);
        });
    }
    
    const token = localStorage.getItem('authToken'); 
    const response = await api.post('/kitchen/employees/add', formData, {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });
    return response.data;
  },

  update: async (employeeId: number, employeeData: any, images: File[], imageIdsToRemove: number[]) => {
    console.log('API received images for update:', images);
    // Create the JSON part, formatting times back to strings
    const requestDto = {
        employeeId: employeeId,
        employeeDetailsDTO: {
            firstname: employeeData.name || '',
            position: employeeData.position || '',
            mobileNumber: employeeData.mobileNumber || '',
            iqamaExpiryDate: formatDateToYyyyMmDd(employeeData.iqamaIdExpiry),
            familyName: employeeData.familyName || '',
            iqamaId: employeeData.iqamaId || '',
            dateOfBirth: formatDateToYyyyMmDd(employeeData.dateOfBirth),
            nationality: employeeData.nationality || '',
            email: employeeData.email || '',
            healthCardExpiry: formatDateToYyyyMmDd(employeeData.healthCardExpiry),
            healthCardNumber: employeeData.healthCardNumber || ''
        },
        // Format time objects back to HH:MM strings here
        dutySchedules: (employeeData.dutySchedulesDTO || []).map((schedule: any) => ({
            day: schedule.day,
            openingShift: formatTimeObjectToString(schedule.openingShift),
            breakTime: formatTimeObjectToString(schedule.breakTime),
            closingShift: formatTimeObjectToString(schedule.closingShift)
        })),
        salaryDTO: {
            basicSalary: parseFloat(employeeData.basicSalary) || 0,
            foodAllowance: parseFloat(employeeData.foodAllowance) || 0,
            accommodationAllowance: parseFloat(employeeData.accommodationAllowance) || 0,
            transportAllowance: parseFloat(employeeData.transportAllowance) || 0,
            otherAllowance: parseFloat(employeeData.otherAllowance) || 0,
            totalSalary: parseFloat(employeeData.totalSalary) || 0,
            mobileAllowance: parseFloat(employeeData.telephoneAllowance) || 0
        },
        imageIdsToRemove: imageIdsToRemove || []
    };

    // Create FormData
    const formData = new FormData();

    // Append the JSON part as a Blob named 'request'
    formData.append('request', new Blob([JSON.stringify(requestDto)], { type: 'application/json' }));

    // Append NEW images
    if (images && images.length > 0) {
        images.forEach((image) => {
            // Use the 'images' key for new files being uploaded
            formData.append('images', image);
        });
    }
    
    const token = localStorage.getItem('authToken');
    const response = await api.put('/kitchen/employees/update', formData, { // Send formData
        headers: {
             // Content-Type is set automatically by the browser for FormData
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
  },

  // Delete Employee
  delete: async (employeeId: number) => {
    const token = localStorage.getItem('authToken');
    const response = await api.delete('/kitchen/employees/delete', {
      data: { employeeId }, // Send ID in request body
      headers: {
          'Authorization': `Bearer ${token}`
      }
    });
    return response.data; // Assumes response includes success/error message
  }
};