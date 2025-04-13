'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Globe } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen w-full relative bg-[#00B8A9] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="absolute inset-0">
        <Image
          src="/assets/images/login-bg.jpeg"
          alt="Login Background"
          fill
          className="object-cover"
          priority
        />
      </div>
      
      <div className="relative w-full max-w-[420px] bg-[#E8FFFE] rounded-2xl p-4 sm:p-6 md:p-8">
        <div className="flex justify-end mb-2 sm:mb-4">
          <button className="flex items-center gap-1.5 text-gray-600 text-xs sm:text-sm hover:text-gray-800 transition-colors">
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            English
          </button>
        </div>

        <div className="flex justify-center mb-6 sm:mb-8">
          <Image
            src="/assets/images/logo.png"
            alt="Prime Cost Logo"
            width={140}
            height={60}
            className="object-contain sm:w-[160px] md:w-[180px]"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm mb-1.5 sm:mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00B8A9] focus:border-transparent text-sm sm:text-base"
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
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00B8A9] focus:border-transparent text-sm sm:text-base"
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
            className="w-full bg-[#00B8A9] text-white py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base hover:bg-[#00a598] transition-colors"
          >
            SIGN IN
          </button>

          <div className="text-center pt-1">
            <a 
              href="#" 
              className="text-[#00B8A9] text-xs sm:text-sm hover:underline hover:text-[#00a598] transition-colors"
            >
              Forgot Password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}