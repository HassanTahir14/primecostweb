import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', type, ...props }, ref) => {
    // Special handling for number inputs to ensure proper decimal handling
    const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (type === 'number') {
        // Allow decimal points and numbers
        const value = e.target.value;
        
        // Allow empty value, single decimal point, or valid number format
        // This regex allows: empty string, single decimal point, or numbers with optional decimal
        if (value === '' || value === '.' || /^-?\d*\.?\d*$/.test(value)) {
          // Call the original onChange if provided
          if (props.onChange) {
            props.onChange(e);
          }
        }
      } else if (props.onChange) {
        props.onChange(e);
      }
    };

    // For number inputs, we need to handle the value differently
    // to ensure "0.99" works correctly
    const inputProps = { ...props };
    if (type === 'number' && inputProps.value !== undefined) {
      // Convert to string to ensure proper handling
      inputProps.value = String(inputProps.value);
    }

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm text-gray-700 font-medium">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={`
            px-3 py-2 rounded-lg border border-gray-300 
            focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          onChange={handleNumberInput}
          {...inputProps}
        />
        {error && (
          <span className="text-xs text-red-500">{error}</span>
        )}
        {helperText && !error && (
          <span className="text-xs text-gray-500">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
