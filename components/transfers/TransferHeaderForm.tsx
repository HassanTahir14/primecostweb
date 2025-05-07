'use client';

import Input from '@/components/common/input';
import Select from '@/components/common/select';

interface TransferHeaderFormProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  branchOptions: { value: string; label: string; }[];
}

export default function TransferHeaderForm({ formData, handleChange, branchOptions }: TransferHeaderFormProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input 
          label="Transfer Type" 
          name="transferType" 
          value={formData.transferType}
          onChange={handleChange}
          placeholder="Enter transfer type" 
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
          className="md:col-span-2"
        />
        <Select 
          label="Source Branch" 
          name="sourceBranchId"
          value={formData.sourceBranchId} 
          onChange={handleChange} 
          options={branchOptions}
        />
        <Select 
          label="Target Branch" 
          name="targetBranchId"
          value={formData.targetBranchId} 
          onChange={handleChange} 
          options={branchOptions}
        />
      </div>
    </div>
  );
} 