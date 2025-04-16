// Define the expected types for request/response based on your API docs
export interface LoginRequest {
  userName: string;
  password: string;
  deviceId?: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  userId: number;
  role: string;
  dashboardMenuList: { menuName: string }[];
}

export interface ForgotPasswordRequest {
  userName: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  resetCode: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
} 