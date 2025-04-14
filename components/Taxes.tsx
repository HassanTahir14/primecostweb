'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import Modal from './ui/Modal';
import Input from './ui/input';
import { toast } from 'react-hot-toast';

interface Tax {
  id: string;
  code: string;
  name: string;
  rate: number;
  group: string;
}

interface TaxesProps {
  onClose: () => void;
}

export default function Taxes({ onClose }: TaxesProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Form state
  const [taxCode, setTaxCode] = useState('');
  const [taxName, setTaxName] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [taxGroup, setTaxGroup] = useState('');
  
  const [taxes, setTaxes] = useState<Tax[]>([
    {
      id: '1',
      code: 'TX001',
      name: 'VAT',
      rate: 15.0,
      group: 'GST'
    },
    {
      id: '2',
      code: 'EXC001',
      name: 'EXCISE',
      rate: 100.0,
      group: 'EXCICE'
    },
    {
      id: '3',
      code: 'TAX002',
      name: 'VATI',
      rate: 5.0,
      group: 'GST2'
    }
  ]);

  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
  };

  const handleAddTax = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // In a real application, replace with actual API call
      // const response = await fetch('/api/taxes', { method: 'POST', body: JSON.stringify({ ... }) });
      
      // Mock API response
      const newTax = {
        id: (taxes.length + 1).toString(),
        code: taxCode,
        name: taxName,
        rate: parseFloat(taxRate),
        group: taxGroup
      };
      
      setTaxes([...taxes, newTax]);
      setIsCreateModalOpen(false);
      resetForm();
      toast.success('Tax added successfully');
    } catch (error) {
      console.error('Error adding tax:', error);
      toast.error('Failed to add tax');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    // In a real app, you would implement the edit functionality
    toast.success(`Editing tax ${id}`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this tax?')) {
      setTaxes(taxes.filter(tax => tax.id !== id));
      toast.success('Tax deleted successfully');
    }
  };

  const validateForm = () => {
    if (!taxCode) {
      toast.error('Tax code is required');
      return false;
    }
    
    if (!taxName) {
      toast.error('Tax name is required');
      return false;
    }
    
    if (!taxRate) {
      toast.error('Tax rate is required');
      return false;
    }
    
    if (!taxGroup) {
      toast.error('Tax group is required');
      return false;
    }
    
    return true;
  };

  const resetForm = () => {
    setTaxCode('');
    setTaxName('');
    setTaxRate('');
    setTaxGroup('');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f1fff7] min-h-screen px-3 py-3 sm:px-4 md:px-8 sm:py-4 md:py-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">Tax List</h1>
        </div>

        <Button 
          onClick={handleCreateNew}
          className="rounded-full bg-[#05A49D] text-white text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
          disabled={isLoading}
        >
          Create New
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex-1">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">Tax code</th>
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">Tax Name</th>
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">Tax Rate %</th>
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">Tax Group</th>
                <th className="text-right pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {taxes.map((tax) => (
                <tr key={tax.id} className="border-b">
                  <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{tax.code}</td>
                  <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{tax.name}</td>
                  <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{tax.rate.toFixed(1)}</td>
                  <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{tax.group}</td>
                  <td className="py-3 sm:py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="rounded-full bg-[#05A49D] text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                        onClick={() => handleEdit(tax.id)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="rounded-full bg-red-500 text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                        onClick={() => handleDelete(tax.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Tax Modal */}
      <Modal 
        isOpen={isCreateModalOpen}
        onClose={() => !isLoading && setIsCreateModalOpen(false)}
        title="New Tax"
        size="md"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          handleAddTax();
        }} className="w-full">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">TAX Code</label>
              <Input
                type="text"
                value={taxCode}
                onChange={(e) => setTaxCode(e.target.value)}
                placeholder="Enter TAX Code"
                className="w-full bg-white"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">TAX Name</label>
              <Input
                type="text"
                value={taxName}
                onChange={(e) => setTaxName(e.target.value)}
                placeholder="Enter TAX Name"
                className="w-full bg-white"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">TAX Rate %</label>
              <Input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder="Enter TAX Rate %"
                className="w-full bg-white"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">TAX Group</label>
              <Input
                type="text"
                value={taxGroup}
                onChange={(e) => setTaxGroup(e.target.value)}
                placeholder="Enter TAX Group"
                className="w-full bg-white"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="flex justify-between gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!isLoading) {
                  setIsCreateModalOpen(false);
                  resetForm();
                }
              }}
              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 sm:px-6"
              disabled={isLoading}
            >
              Discard
            </Button>
            
            <Button
              type="submit"
              className="bg-[#05A49D] text-white hover:bg-[#048c86] px-4 sm:px-6"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'ADD'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 