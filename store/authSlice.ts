import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

// Define a more specific User type based on the API response
interface User {
  username: string;
  userId: number;
  role: string;
  dashboardMenuList: { menuName: string }[];
}

interface AuthState {
  user: User | null; // Use the specific User type
  token: string | null;
  isAuthenticated: boolean;
}

// Function to safely get items from localStorage
const getAuthFromLocalStorage = (): { token: string | null; user: User | null } => {
  let token: string | null = null;
  let user: User | null = null;
  if (typeof window !== 'undefined' && window.localStorage) {
    token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser'); // Attempt to get stored user
    if (storedUser) {
      try {
        user = JSON.parse(storedUser); // Parse the stored user JSON
      } catch (e) {
        console.error("Failed to parse stored user data:", e);
        localStorage.removeItem('authUser'); // Clear invalid data
      }
    }
  }
  return { token, user };
};

// Initialize state based on localStorage token AND user
const { token: initialToken, user: initialUser } = getAuthFromLocalStorage();

const initialState: AuthState = {
  user: initialUser, // Initialize user from localStorage if available
  token: initialToken,
  isAuthenticated: !!initialToken, // Base authentication on token presence
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      // Expect payload with token and user object matching the API response
      { payload: { token, user } }: PayloadAction<{ token: string; user: User }>
    ) => {
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('authToken', token);
        // Optional: Store user details too, but be mindful of sensitive data
        localStorage.setItem('authUser', JSON.stringify(user)); 
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser'); // Remove user details too
      }
    },
    // loadUser action might not be needed if setCredentials handles user data
    // loadUser: (state, action: PayloadAction<User>) => {
    //     state.user = action.payload;
    // }
  },
});

// Remove loadUser from export if not used
export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: RootState) => (state.auth as AuthState).user;
export const selectIsAuthenticated = (state: RootState) => (state.auth as AuthState).isAuthenticated;
export const selectCurrentToken = (state: RootState) => (state.auth as AuthState).token; 