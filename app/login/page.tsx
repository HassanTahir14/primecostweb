'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Globe } from 'lucide-react';

type LoginView = 'login' | 'forgotPasswordEmail' | 'forgotPasswordReset';

export default function LoginPage() {
  const [view, setView] = useState<LoginView>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const router = useRouter();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt with:", email, password);
    // TODO: Add actual login logic
    router.push('/dashboard'); // Redirect to dashboard on successful login
  };

  const handleForgotPasswordEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Forgot password request for:", email);
    // TODO: Add logic to send reset code
    setView('forgotPasswordReset'); // Move to the next step
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Reset password attempt with code:", resetCode, "and new password:", newPassword);
    // TODO: Add logic to verify code and update password
    // Optionally show a success message
    setView('login'); // Go back to login view after reset
  };

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
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#339A89] focus:border-transparent text-sm sm:text-base"
          placeholder="Enter email"
          required
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
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#339A89] focus:border-transparent text-sm sm:text-base"
            placeholder="Enter password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
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
        className="w-full bg-[#339A89] text-white py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base hover:bg-[#2b8274] transition-colors"
      >
        SIGN IN
      </button>

      <div className="text-center pt-1">
        <button 
          type="button" 
          onClick={() => setView('forgotPasswordEmail')} 
          className="text-[#339A89] text-xs sm:text-sm hover:underline hover:text-[#2b8274] transition-colors"
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
          value={email} // Reuse email state
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#339A89] focus:border-transparent text-sm sm:text-base"
          placeholder="example@gmail.com"
          required
        />
      </div>
       <p className="text-center text-xs sm:text-sm text-gray-600 pt-1">You will receive a reset code on your ID</p>
      <button
        type="submit"
        className="w-full bg-[#339A89] text-white py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base hover:bg-[#2b8274] transition-colors"
      >
        Submit
      </button>
       <div className="text-center pt-1">
        <button 
          type="button" 
          onClick={() => setView('login')} // Add a way back to login
          className="text-[#339A89] text-xs sm:text-sm hover:underline hover:text-[#2b8274] transition-colors"
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
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#339A89] focus:border-transparent text-sm sm:text-base"
          placeholder="Enter the code"
          required
        />
      </div>
      <div>
        <label htmlFor="new-password" className="block text-gray-700 text-sm mb-1.5 sm:mb-2">
          Enter the New Password
        </label>
        <input // Simple input for password, consider adding visibility toggle if needed
          type="password" 
          id="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#339A89] focus:border-transparent text-sm sm:text-base"
          placeholder="Enter the new Password"
          required
        />
      </div>
       <p className="text-center text-xs sm:text-sm text-gray-600 pt-1">You will receive a reset code on your ID</p> // Text from image 2
      <button
        type="submit"
        className="w-full bg-[#339A89] text-white py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base hover:bg-[#2b8274] transition-colors"
      >
        Submit
      </button>
       <div className="text-center pt-1">
        <button 
          type="button" 
          onClick={() => setView('login')} // Add a way back to login
          className="text-[#339A89] text-xs sm:text-sm hover:underline hover:text-[#2b8274] transition-colors"
        >
          Back to Login
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen w-full relative bg-[#E8FFFE] flex items-center justify-center p-4 sm:p-6 md:p-8"> {/* Changed bg color to match container */}
      <div className="absolute inset-0 z-0"> {/* Ensure background is behind content */}
        <Image
          src="/assets/images/login-bg.jpeg"
          alt="Login Background"
          fill
          className="object-cover"
          priority
        />
      </div>
      
      {/* Container with light blue background matching screenshots */}
      <div className="relative w-full max-w-[420px] bg-[#DFF7F4] rounded-2xl p-4 sm:p-6 md:p-8 z-10 shadow-lg"> {/* Adjusted background color & added shadow */}
        {/* Language button removed as not present in forgot password screens */}
        {/* <div className="flex justify-end mb-2 sm:mb-4">
          <button className="flex items-center gap-1.5 text-gray-600 text-xs sm:text-sm hover:text-gray-800 transition-colors">
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            English
          </button>
        </div> */} 

        <div className="flex justify-center mb-6 sm:mb-8">
          <Image
            src="/assets/images/logo.png"
            alt="Prime Cost Logo"
            width={140} // Keep logo size consistent
            height={60}
            className="object-contain sm:w-[160px] md:w-[180px]"
          />
        </div>

        {/* Conditional Form Rendering */}
        {view === 'login' && renderLoginForm()}
        {view === 'forgotPasswordEmail' && renderForgotPasswordEmailForm()}
        {view === 'forgotPasswordReset' && renderForgotPasswordResetForm()}
        
      </div>
        {/* Footer Text - Adding based on image */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-xs z-10">
          © 2024 Restaurant Portal
        </div>
    </div>
  );
}