import api from './api';

// --- Common Payload ---
interface DateRangePayload {
    startDate: string; // "YYYY-MM-DD"
    endDate: string; // "YYYY-MM-DD"
}

// --- Record Interfaces (Based on actual API responses) ---

export interface SalaryBreakdownRecord {
  employeeName: string;
  position: string;
  iqamaId: string;
  iqamaExpiry: string;
  healthCardId: string;
  healthCardExpiry: string;
  totalPayroll: string;
}

export interface PerformanceRecord {
  employeeName: string;
  id: number;
  orders: number;
  incidentReport: string;
}

export interface IqamaExpiryRecord {
  employeeName: string;
  iqamaId: string;
  iqamaExpiry: string;
  status: string;
}

export interface HealthCardExpiryRecord {
  employeeName: string;
  healthCardId: string;
  cardExpiry: string;
  status: string;
}

export interface GeneralEmployeeImage {
  imageId: number;
  path: string;
}

export interface GeneralEmployeeRecord {
  employeeName: string;
  dob: string;
  iqamaId: string;
  healthCardNumber: string;
  iqamaExpiry: string;
  healthCardExpiry: string;
  basicSalary: number;
  otherAllowances: number;
  totalItemsPrepared: number;
  images?: GeneralEmployeeImage[];
}

// --- Response Interfaces (Specific for each report) ---

interface BaseReportResponse {
    responseCode?: string;
    description?: string;
}

export interface SalaryBreakdownResponse extends BaseReportResponse {
    salaryDetails: SalaryBreakdownRecord[];
}

export interface PerformanceReportResponse extends BaseReportResponse {
    performanceDetails: PerformanceRecord[];
}

export interface IqamaExpiryResponse extends BaseReportResponse {
    iqamaExpiryDetails: IqamaExpiryRecord[];
}

export interface HealthCardExpiryResponse extends BaseReportResponse {
    healthCardExpiryDetails: HealthCardExpiryRecord[];
}

export interface GeneralEmployeeReportResponse extends BaseReportResponse {
    employees: GeneralEmployeeRecord[];
}

// Default response structure for error cases
const defaultErrorResponse = {
    responseCode: 'ERROR',
    description: 'Failed to fetch report or invalid response structure.',
};

// --- API Functions --- Casing aligned with endpoint paths
export const employeeReportsApi = {
    fetchSalaryBreakdown: async (payload: DateRangePayload): Promise<SalaryBreakdownResponse> => {
        console.log('Fetching Salary Breakdown Report:', payload);
        try {
            const response = await api.post('/employee/reports/salary-breakdown', payload);
            // Validate basic structure - adjust validation as needed
            if (!response.data || !Array.isArray(response.data.salaryDetails)) {
                console.error("API Error: Invalid response structure from /employee/reports/salary-breakdown", response.data);
                return { ...defaultErrorResponse, salaryDetails: [] };
            }
            return response.data as SalaryBreakdownResponse;
        } catch (error) {
            console.error("API Call Failed: /employee/reports/salary-breakdown", error);
            return { ...defaultErrorResponse, salaryDetails: [] };
        }
    },

    fetchPerformanceReport: async (payload: DateRangePayload): Promise<PerformanceReportResponse> => {
        console.log('Fetching Performance Report:', payload);
         try {
            const response = await api.post('/employee/reports/performance-report', payload);
             if (!response.data || !Array.isArray(response.data.performanceDetails)) {
                console.error("API Error: Invalid response structure from /employee/reports/performance-report", response.data);
                return { ...defaultErrorResponse, performanceDetails: [] };
            }
            return response.data as PerformanceReportResponse;
        } catch (error) {
            console.error("API Call Failed: /employee/reports/performance-report", error);
            return { ...defaultErrorResponse, performanceDetails: [] };
        }
    },

    fetchIqamaExpiry: async (payload: DateRangePayload): Promise<IqamaExpiryResponse> => {
        console.log('Fetching Iqama Expiry Report:', payload);
        try {
            const response = await api.post('/employee/reports/iqama-expiry', payload);
             if (!response.data || !Array.isArray(response.data.iqamaExpiryDetails)) {
                console.error("API Error: Invalid response structure from /employee/reports/iqama-expiry", response.data);
                return { ...defaultErrorResponse, iqamaExpiryDetails: [] };
            }
            return response.data as IqamaExpiryResponse;
        } catch (error) {
            console.error("API Call Failed: /employee/reports/iqama-expiry", error);
            return { ...defaultErrorResponse, iqamaExpiryDetails: [] };
        }
    },

    fetchHealthCardExpiry: async (payload: DateRangePayload): Promise<HealthCardExpiryResponse> => {
        console.log('Fetching Health Card Expiry Report:', payload);
        try {
            const response = await api.post('/employee/reports/health-card-expiry', payload);
             if (!response.data || !Array.isArray(response.data.healthCardExpiryDetails)) {
                console.error("API Error: Invalid response structure from /employee/reports/health-card-expiry", response.data);
                return { ...defaultErrorResponse, healthCardExpiryDetails: [] };
            }
            return response.data as HealthCardExpiryResponse;
        } catch (error) {
            console.error("API Call Failed: /employee/reports/health-card-expiry", error);
            return { ...defaultErrorResponse, healthCardExpiryDetails: [] };
        }
    },

    fetchGeneralEmployeeReport: async (payload: DateRangePayload): Promise<GeneralEmployeeReportResponse> => {
        console.log('Fetching General Employee Report:', payload);
         try {
            const response = await api.post('/employee/reports/general', payload);
             if (!response.data || !Array.isArray(response.data.employees)) {
                console.error("API Error: Invalid response structure from /employee/reports/general", response.data);
                return { ...defaultErrorResponse, employees: [] };
            }
            return response.data as GeneralEmployeeReportResponse;
        } catch (error) {
            console.error("API Call Failed: /employee/reports/general", error);
            return { ...defaultErrorResponse, employees: [] };
        }
    },
}; 