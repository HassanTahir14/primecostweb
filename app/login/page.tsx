'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { login, forgotPassword, resetPassword, selectAuthStatus, selectAuthError } from '@/store/authSlice';
import { AppDispatch } from '@/store/store';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { toast } from 'react-hot-toast';
import Loader from '@/components/common/Loader';

type LoginView = 'login' | 'forgotPasswordEmail' | 'forgotPasswordReset';

export default function LoginPage() {
  const [view, setView] = useState<LoginView>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isAlert: boolean;
    onConfirm?: () => void;
  }>({ isOpen: false, title: '', message: '', isAlert: false });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await dispatch(login({ userName: email, password })).unwrap();
      console.log("Login successful:", result);

      // Determine redirect path based on user role
      let redirectPath = '/dashboard';
      if (result.user.role === 'CHEF' || result.user.role === 'HEAD_CHEF') {
        redirectPath = '/chef-dashboard';
      }

      setModalState({
        isOpen: true,
        title: 'Login Successful',
        message: 'Welcome! You will be redirected to the dashboard.',
        isAlert: true,
        onConfirm: () => {
          setModalState({ isOpen: false, title: '', message: '', isAlert: false });
          router.push(redirectPath);
        }
      });
    } catch (err: any) {
      console.error("Login failed:", err);
      setModalState({
        isOpen: true,
        title: 'Login Failed',
        message: err || 'Login failed. Please check your credentials or try again later.',
        isAlert: true,
      });
    }
  };

  const handleForgotPasswordEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await dispatch(forgotPassword({ userName: email })).unwrap();
      console.log("Forgot password request result:", result);
      setModalState({
        isOpen: true,
        title: 'Reset Code Sent',
        message: result?.message || 'A reset code has been sent to your email (if the email exists in our system). Please check your inbox.',
        isAlert: true,
        onConfirm: () => {
          setModalState({ isOpen: false, title: '', message: '', isAlert: false });
          setView('forgotPasswordReset');
        }
      });
    } catch (err: any) {
      console.error("Forgot password failed:", err);
      setModalState({
        isOpen: true,
        title: 'Request Failed',
        message: err || 'Failed to send reset code. Please check the email and try again.',
        isAlert: true,
      });
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await dispatch(resetPassword({ resetCode, newPassword })).unwrap();
      console.log("Reset password result:", result);
      setModalState({
        isOpen: true,
        title: 'Password Reset Successful',
        message: result?.message || 'Your password has been successfully reset. You can now log in with your new password.',
        isAlert: true,
        onConfirm: () => {
          setModalState({ isOpen: false, title: '', message: '', isAlert: false });
          setView('login');
          setResetCode('');
          setNewPassword('');
          setEmail('');
          setPassword('');
        }
      });
    } catch (err: any) {
      console.error("Reset password failed:", err);
      setModalState({
        isOpen: true,
        title: 'Reset Failed',
        message: err || 'Failed to reset password. Please check the code and try again.',
        isAlert: true,
      });
    }
  };

  const isLoading = status === 'loading';

  const renderLoginForm = () => (
    <form onSubmit={handleLoginSubmit} className="space-y-4 sm:space-y-6">
      <div>
        <label htmlFor="email" className="block text-gray-700 text-sm mb-1.5 sm:mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#339A89] focus:border-transparent text-sm sm:text-base disabled:opacity-50"
          placeholder="Enter email"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-gray-700 text-sm mb-1.5 sm:mb-2">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#339A89] focus:border-transparent text-sm sm:text-base disabled:opacity-50"
            placeholder="Enter password"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-[#339A89] text-white py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base hover:bg-[#2b8274] transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
      </button>

      <div className="text-center pt-1">
        <button 
          type="button" 
          onClick={() => setView('forgotPasswordEmail')} 
          className="text-[#339A89] text-xs sm:text-sm hover:underline hover:text-[#2b8274] transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          Forgot Password?
        </button>
      </div>
    </form>
  );

  const renderForgotPasswordEmailForm = () => (
     <form onSubmit={handleForgotPasswordEmailSubmit} className="space-y-4 sm:space-y-6">
      <div>
        <label htmlFor="forgot-email" className="block text-gray-700 text-sm mb-1.5 sm:mb-2">
          Enter Your Email ID
        </label>
        <input
          type="email"
          id="forgot-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#339A89] focus:border-transparent text-sm sm:text-base disabled:opacity-50"
          placeholder="example@gmail.com"
          required
          disabled={isLoading}
        />
      </div>
       <p className="text-center text-xs sm:text-sm text-gray-600 pt-1">You will receive a reset code on your ID</p>
      <button
        type="submit"
        className="w-full bg-[#339A89] text-white py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base hover:bg-[#2b8274] transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
         {isLoading ? 'SENDING...' : 'Submit'}
      </button>
       <div className="text-center pt-1">
        <button 
          type="button" 
          onClick={() => setView('login')}
          className="text-[#339A89] text-xs sm:text-sm hover:underline hover:text-[#2b8274] transition-colors disabled:opacity-50"
           disabled={isLoading}
        >
          Back to Login
        </button>
      </div>
    </form>
  );

  const renderForgotPasswordResetForm = () => (
    <form onSubmit={handleResetPasswordSubmit} className="space-y-4 sm:space-y-6">
      <div>
        <label htmlFor="reset-code" className="block text-gray-700 text-sm mb-1.5 sm:mb-2">
          Enter the Code
        </label>
        <input
          type="text"
          id="reset-code"
          value={resetCode}
          onChange={(e) => setResetCode(e.target.value)}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#339A89] focus:border-transparent text-sm sm:text-base disabled:opacity-50"
          placeholder="Enter the code"
          required
          disabled={isLoading}
        />
      </div>
      <div>
        <label htmlFor="new-password" className="block text-gray-700 text-sm mb-1.5 sm:mb-2">
          Enter the New Password
        </label>
        <input
          type="password" 
          id="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#339A89] focus:border-transparent text-sm sm:text-base disabled:opacity-50"
          placeholder="Enter the new Password"
          required
          disabled={isLoading}
        />
      </div>
      <button
        type="submit"
        className="w-full bg-[#339A89] text-white py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base hover:bg-[#2b8274] transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
         disabled={isLoading}
      >
        {isLoading ? 'RESETTING...' : 'Submit'}
      </button>
       <div className="text-center pt-1">
        <button 
          type="button" 
          onClick={() => setView('login')}
          className="text-[#339A89] text-xs sm:text-sm hover:underline hover:text-[#2b8274] transition-colors disabled:opacity-50"
           disabled={isLoading}
        >
          Back to Login
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen w-full relative bg-[#E8FFFE] flex items-center justify-center p-4 sm:p-6 md:p-8">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-20">
          <Loader size="large" />
        </div>
      )}

      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/images/login-bg.jpeg"
          alt="Login Background"
          fill
          className="object-cover"
          priority
        />
      </div>
      
      <div className="relative w-full max-w-[420px] bg-[#DFF7F4] rounded-2xl p-4 sm:p-6 md:p-8 z-10 shadow-lg">
        <div className="flex justify-center mb-6 sm:mb-8">
          <Image
            src="/assets/images/logo.png"
            alt="Prime Cost Logo"
            width={140}
            height={60}
            className="object-contain sm:w-[160px] md:w-[180px]"
          />
        </div>

        {view === 'login' && renderLoginForm()}
        {view === 'forgotPasswordEmail' && renderForgotPasswordEmailForm()}
        {view === 'forgotPasswordReset' && renderForgotPasswordResetForm()}
        
      </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-xs z-10">
          © 2024 Restaurant Portal
        </div>

        <ConfirmationModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ isOpen: false, title: '', message: '', isAlert: false })}
          onConfirm={() => {
            if (modalState.onConfirm) {
              modalState.onConfirm();
            } else {
              setModalState({ isOpen: false, title: '', message: '', isAlert: false });
            }
          }}
          title={modalState.title}
          message={modalState.message}
          isAlert={modalState.isAlert}
        />
    </div>
  );
}