'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/button';
import { toast } from 'react-hot-toast';

interface Supplier {
  id: string;
  name: string;
  email: string;
  contact: string;
  salesMan: string;
}

interface SuppliersProps {
  onClose: () => void;
}

export default function Suppliers({ onClose }: SuppliersProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: '1',
      name: 'Almarai',
      email: 'Almarai@gmail.com',
      contact: '543343344',
      salesMan: 'Turki'
    },
    {
      id: '2',
      name: 'International Food Resources',
      email: 'info@ifr.com',
      contact: '054500607',
      salesMan: 'Mustafa Ali'
    },
    {
      id: '3',
      name: 'Al Kabbaz',
      email: 'sulieman.walid@hotmail.com',
      contact: '054654658',
      salesMan: 'Wassim'
    }
  ]);

  const handleAddSupplier = () => {
    router.push('/suppliers/add');
  };

  const handleEditSupplier = (id: string) => {
    router.push(`/suppliers/${id}`);
  };

  const handleDeleteSupplier = (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      setSuppliers(suppliers.filter(supplier => supplier.id !== id));
      toast.success('Supplier deleted successfully');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f1fff7] min-h-screen px-3 py-3 sm:px-4 md:px-8 sm:py-4 md:py-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">Suppliers</h1>
        </div>

        <Button 
          onClick={handleAddSupplier}
          className="rounded-full bg-[#05A49D] text-white text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
          disabled={isLoading}
        >
          Add New
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex-1">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">Supplier Name</th>
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">Supplier Email</th>
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">Supplier Contact</th>
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">Supplier SalesMan</th>
                <th className="text-left pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">ID</th>
                <th className="text-right pb-3 sm:pb-4 text-gray-500 text-xs sm:text-sm font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="border-b">
                  <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{supplier.name}</td>
                  <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{supplier.email}</td>
                  <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{supplier.contact}</td>
                  <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{supplier.salesMan}</td>
                  <td className="py-3 sm:py-4 text-gray-800 text-sm sm:text-base pr-2">{supplier.id}</td>
                  <td className="py-3 sm:py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="rounded-full bg-[#05A49D] text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                        onClick={() => handleEditSupplier(supplier.id)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="rounded-full bg-red-500 text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                        onClick={() => handleDeleteSupplier(supplier.id)}
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
    </div>
  );
} 