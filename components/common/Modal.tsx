'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md' 
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={`bg-[#f0f8ff] rounded-2xl w-full ${sizeClasses[size]} shadow-xl max-h-[90vh] overflow-auto`}>
        <div className="p-4 sm:p-6">
          {title && (
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold">{title}</h2>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-1"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          )}
          
          <div className="overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 