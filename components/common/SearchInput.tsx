import { InputHTMLAttributes } from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
}

export default function SearchInput({ placeholder = 'Search...', className = '', ...props }: SearchInputProps) {
  return (
    <div className="relative flex-1 max-w-md">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        className={`w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 ${className}`}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
} 