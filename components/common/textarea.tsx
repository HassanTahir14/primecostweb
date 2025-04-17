'use client';

import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  // Inherits standard textarea attributes like name, value, onChange, placeholder, rows, disabled, etc.
}

const Textarea: React.FC<TextareaProps> = ({ 
  label, 
  name,
  id, // Use id for label association
  className = '', 
  ...props // Pass remaining props to the textarea element
}) => {
  const textareaId = id || name; // Use provided id or fallback to name for the label

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
        className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B] focus:border-transparent resize-vertical text-sm disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`} 
        {...props}
      />
    </div>
  );
};

export default Textarea; 