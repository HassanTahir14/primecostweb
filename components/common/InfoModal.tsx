'use client';

import React from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error';
  message: string;
  buttonText?: string;
}

const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  type,
  message,
  buttonText = 'OK',
}) => {
  if (!isOpen) return null;

  const Icon = type === 'error' ? AlertTriangle : CheckCircle;
  const iconColor = type === 'error' ? 'text-red-500' : 'text-green-500';
  const buttonBgColor = 'bg-teal-600 hover:bg-teal-700'; // Consistent button color
  const buttonFocusRingColor = 'focus:ring-teal-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
        {/* Optional Header with Close Button (can be removed if not needed) */}
        {/* 
        <div className="flex justify-end p-2">
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
           >
            <X size={20} />
          </button>
        </div>
        */}

        {/* Body with Icon and Message */}
        <div className="p-6 text-center">
          <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${type === 'error' ? 'bg-red-100' : 'bg-green-100'} mb-4`}>
             <Icon className={`${iconColor}`} size={24} aria-hidden="true" />
          </div>
          <p className="text-base font-medium text-gray-700">{message}</p>
        </div>

        {/* Footer with Single Button */}
        <div className="px-6 py-4 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white ${buttonBgColor} focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonFocusRingColor} sm:text-sm`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal; 