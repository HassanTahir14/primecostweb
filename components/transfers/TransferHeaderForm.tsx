'use client';

import Input from '@/components/common/input';
import Select from '@/components/common/select';
import { useTranslation } from '@/context/TranslationContext';

interface TransferHeaderFormProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  branchOptions: { value: string; label: string; }[];
}

export default function TransferHeaderForm({ formData, handleChange, branchOptions }: TransferHeaderFormProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input 
          label={t('transfers.transferType')} 
          name="transferType" 
          value={formData.transferType}
          onChange={handleChange}
          placeholder={t('transfers.transferTypePlaceholder')} 
        />
        <Input 
          label={t('transfers.transferDate')} 
          name="transferDate" 
          value={formData.transferDate} 
          onChange={handleChange} 
          placeholder={t('transfers.transferDatePlaceholder')} 
          type="date" 
        />
        <Input 
          label={t('transfers.transferBy')} 
          name="transferBy" 
          value={formData.transferBy} 
          readOnly 
          placeholder={t('transfers.transferByPlaceholder')} 
          className="md:col-span-2"
        />
        <Select 
          label={t('transfers.sourceBranch')} 
          name="sourceBranchId"
          value={formData.sourceBranchId} 
          onChange={handleChange} 
          options={branchOptions}
        />
        <Select 
          label={t('transfers.targetBranch')} 
          name="targetBranchId"
          value={formData.targetBranchId} 
          onChange={handleChange} 
          options={branchOptions}
        />
      </div>
    </div>
  );
}