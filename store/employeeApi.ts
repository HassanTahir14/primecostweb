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

// Helper to format time string "HH:MM" to time object
const formatTime = (timeString: string | null | undefined) => {
  if (!timeString || !/^\d{2}:\d{2}$/.test(timeString)) {
    // Return default or handle error if format is incorrect or time is empty
    return { hour: 0, minute: 0, second: 0, nano: 0 }; 
  }
  const [hour, minute] = timeString.split(':').map(Number);
  return { hour, minute, second: 0, nano: 0 };
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

  add: async (employeeData: any, images: File[]) => {
    const formData = new FormData();
    
    const requestDto = {
        employeeDetailsRequestDTO: {
            firstname: employeeData.name || '',
            position: employeeData.position || '',
            mobileNumber: employeeData.mobileNumber || '',
            iqamaExpiryDate: formatDateToYyyyMmDd(employeeData.iqamaIdExpiry),
            familyName: employeeData.familyName || '',
            iqamaCardNumber: employeeData.iqamaId || '', 
            dateOfBirth: formatDateToYyyyMmDd(employeeData.dateOfBirth),
            password: employeeData.password || '',
            nationality: employeeData.nationality || '',
            email: employeeData.email || '',
            healthCardExpiry: formatDateToYyyyMmDd(employeeData.healthCardExpiry),
            healthCardNumber: employeeData.healthCardNumber || ''
        },
        dutySchedules: employeeData.schedule ? Object.keys(employeeData.schedule?.Opening || {}).map(day => ({
            day: day,
            openingShift: formatTime(employeeData.schedule?.Opening?.[day]),
            breakTime: formatTime(employeeData.schedule?.Break?.[day]),
            closingShift: formatTime(employeeData.schedule?.Closing?.[day])
        })) : [],
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

    // Append the JSON DTO as a string value
    formData.append('request', JSON.stringify(requestDto));

    // Append each image with the key 'images'
    if (images && images.length > 0) {
        images.forEach((image) => {
            formData.append('images', image);
        });
    }

    // Get the authentication token from wherever it's stored in your application
    // (localStorage, sessionStorage, Redux store, etc.)
    const token = localStorage.getItem('authToken'); // Adjust according to your auth method

    // Make sure to include authentication headers when sending FormData
    const response = await api.post('/kitchen/employees/add', formData, {
        headers: {
            // Don't set Content-Type when using FormData - browser will set it with boundary
            // 'Content-Type': 'multipart/form-data', 
            
            // Include your auth token
            'Authorization': `Bearer ${token}`, // Adjust format according to your API requirements
            // 'Access-Control-Allow-Origin': 'http://localhost:3000',
            // 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            // 'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            // 'Access-Control-Allow-Credentials': 'true',
            // // 'Access-Control-Max-Age': '86400'
        }
    });
    
    return response.data;
  },

  update: async (employeeId: number, employeeData: any, images: File[], imageIdsToRemove: number[]) => {
    const formData = new FormData();

    const requestDto = {
        employeeId: employeeId,
        employeeDetailsDTO: {
            firstname: employeeData.name || '',
            position: employeeData.position || '',
            mobileNumber: employeeData.mobileNumber || '',
            iqamaExpiryDate: formatDateToYyyyMmDd(employeeData.iqamaIdExpiry),
            familyName: employeeData.familyName || '',
            iqamaCardNumber: employeeData.iqamaId || '',
            dateOfBirth: formatDateToYyyyMmDd(employeeData.dateOfBirth),
            password: employeeData.password || '',
            nationality: employeeData.nationality || '',
            email: employeeData.email || '',
            healthCardExpiry: formatDateToYyyyMmDd(employeeData.healthCardExpiry),
            healthCardNumber: employeeData.healthCardNumber || ''
        },
        dutySchedules: employeeData.schedule ? Object.keys(employeeData.schedule?.Opening || {}).map(day => ({
            day: day,
            openingShift: formatTime(employeeData.schedule?.Opening?.[day]),
            breakTime: formatTime(employeeData.schedule?.Break?.[day]),
            closingShift: formatTime(employeeData.schedule?.Closing?.[day])
        })) : [],
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
    
    formData.append('request', JSON.stringify(requestDto));

    if (images && images.length > 0) {
        images.forEach((image) => {
            formData.append('images', image);
        });
    }

    // Get the authentication token
    const token = localStorage.getItem('authToken'); // Adjust according to your auth method

    const response = await api.put('/kitchen/employees/update', formData, {
        headers: {
            // Include your auth token
            'Authorization': `Bearer ${token}` // Adjust format according to your API requirements
        }
    });
    
    return response.data;
  }
};