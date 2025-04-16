import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from './store';
import api from './api';
import { LoginRequest, LoginResponse, ForgotPasswordRequest, ForgotPasswordResponse, ResetPasswordRequest, ResetPasswordResponse } from './authApi';

// Define a more specific User type based on the API response
interface User {
  username: string;
  userId: number;
  role: string;
  dashboardMenuList: { menuName: string }[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Function to safely get items from localStorage
const getAuthFromLocalStorage = (): { token: string | null; user: User | null } => {
  let token: string | null = null;
  let user: User | null = null;
  if (typeof window !== 'undefined' && window.localStorage) {
    token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      try {
        user = JSON.parse(storedUser);
      } catch (e) {
        console.error("Failed to parse stored user data:", e);
        localStorage.removeItem('authUser');
      }
    }
  }
  return { token, user };
};

const { token: initialToken, user: initialUser } = getAuthFromLocalStorage();

const initialState: AuthState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: !!initialToken,
  status: 'idle',
  error: null,
};

// Async thunks
export const login = createAsyncThunk<{ token: string; user: User }, LoginRequest>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post<LoginResponse>('/login', credentials);
      const { token, username, userId, role, dashboardMenuList } = response.data;
      
      if (token && username && userId && role && dashboardMenuList) {
        const user = { username, userId, role, dashboardMenuList };
        return { token, user };
      }
      return rejectWithValue('Invalid response data');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const forgotPassword = createAsyncThunk<ForgotPasswordResponse, ForgotPasswordRequest>(
  'auth/forgotPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post<ForgotPasswordResponse>('/password/forgot', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Forgot password request failed');
    }
  }
);

export const resetPassword = createAsyncThunk<ResetPasswordResponse, ResetPasswordRequest>(
  'auth/resetPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post<ResetPasswordResponse>('/password/reset', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Password reset failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('authToken', action.payload.token);
          localStorage.setItem('authUser', JSON.stringify(action.payload.user));
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(resetPassword.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectCurrentToken = (state: RootState) => state.auth.token;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error; 