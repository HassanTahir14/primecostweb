'use client';

import Input from '@/components/ui/input';
import Select from '@/components/ui/select';

interface TransferHeaderFormProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

// Mock branch options - replace with actual data
const branchOptions = [
  { value: 'branch1', label: 'Main Branch' },
  { value: 'branch2', label: 'Downtown Branch' },
  { value: 'branch3', label: 'Westside Branch' },
];

export default function TransferHeaderForm({ formData, handleChange }: TransferHeaderFormProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input 
          label="Transfer Type" 
          name="transferType" 
          value={formData.transferType} 
          readOnly 
          placeholder="Transfer Type" 
        />
        <Input 
          label="Transfer Date" 
          name="transferDate" 
          value={formData.transferDate} 
          onChange={handleChange} 
          placeholder="dd/mm/yyyy" 
          type="date" 
        />
        <Input 
          label="Transfer By" 
          name="transferBy" 
          value={formData.transferBy} 
          readOnly 
          placeholder="User email" 
          className="md:col-span-2" // Span across two columns on medium screens and up
        />
        <Select 
          label="Source Branch" 
          name="sourceBranch" 
          value={formData.sourceBranch} 
          onChange={handleChange} 
          options={branchOptions} 
          placeholder="Select branch" 
        />
        <Select 
          label="Target Branch" 
          name="targetBranch" 
          value={formData.targetBranch} 
          onChange={handleChange} 
          options={branchOptions} 
          placeholder="Select branch" 
        />
      </div>
    </div>
  );
} 