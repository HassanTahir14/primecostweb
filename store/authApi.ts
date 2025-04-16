import { apiSlice } from './api';
import { setCredentials } from './authSlice';

// Define the expected types for request/response based on your API docs
interface LoginRequest {
  userName: string;
  password: string;
  deviceId?: string; // Assuming deviceId is optional or handled elsewhere if needed
}

// interface LoginResponse { ... } // Using any

interface ForgotPasswordRequest {
  userName: string; // Assuming it's the email
}

// interface ForgotPasswordResponse { ... } // Using any

interface ResetPasswordRequest {
  resetCode: string;
  newPassword: string;
}

// interface ResetPasswordResponse { ... } // Using any

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<any, LoginRequest>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Ensure data has the expected structure from your successful response
          if (data?.token && data?.username && data?.userId && data?.role && data?.dashboardMenuList) {
             // Construct the user object from the response data
             const user = {
                username: data.username,
                userId: data.userId,
                role: data.role,
                dashboardMenuList: data.dashboardMenuList,
             };
             // Dispatch with the correct payload structure: { token, user }
             dispatch(setCredentials({ token: data.token, user: user }));
          } else {
            console.warn('Login response did not contain all expected fields (token, user details).');
            // Potentially dispatch an error or handle incomplete data
            // For now, we throw an error to be caught by the component
            throw new Error('Incomplete login response data');
          }
        } catch (error: any) {
          console.error('Login onQueryStarted failed:', error);
          // Don't dispatch credentials on error
          // Error will propagate to the component's catch block
          // Re-throw if you want the component's catch block to handle it
          // throw error; // Or handle specific error display here
        }
      },
      invalidatesTags: ['Auth'], 
    }),
    forgotPassword: builder.mutation<any, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/password/forgot',
        method: 'POST',
        body: data, 
      }),
    }),
    resetPassword: builder.mutation<any, ResetPasswordRequest>({
      query: (data) => ({
        url: '/password/reset',
        method: 'POST',
        body: data, 
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApiSlice; 