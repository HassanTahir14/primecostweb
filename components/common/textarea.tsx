'use client';

import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  // Inherits standard textarea attributes like name, value, onChange, placeholder, rows, disabled, etc.
}

const Textarea: React.FC<TextareaProps> = ({ 
  label, 
  name,
  id, // Use id for label association
  error, // Destructure error prop
  className = '', 
  ...props // Pass remaining props to the textarea element
}) => {
  const textareaId = id || name; // Use provided id or fallback to name for the label
  const errorId = `${textareaId}-error`;

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={textareaId} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        name={name}
        className={`w-full p-3 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-[#00997B]'} focus:border-transparent resize-vertical text-sm disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Textarea; 