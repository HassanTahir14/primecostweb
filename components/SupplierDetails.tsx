'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import { toast } from 'react-hot-toast';

interface SupplierDetailsProps {
  supplierId?: string;
  onClose: () => void;
}

interface SupplierFormData {
  name: string;
  contactNumber: string;
  email: string;
  salesmanName: string;
  salesmanContactNumber: string;
  salesmanEmail: string;
  address: string;
  vatNo: string;
  crNumber: string;
}

export default function SupplierDetails({ supplierId, onClose }: SupplierDetailsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!supplierId;
  
  const [formData, setFormData] = useState<SupplierFormData>({
    name: '',
    contactNumber: '',
    email: '',
    salesmanName: '',
    salesmanContactNumber: '',
    salesmanEmail: '',
    address: '',
    vatNo: '',
    crNumber: ''
  });

  useEffect(() => {
    if (supplierId) {
      // In a real app, fetch supplier data based on ID
      // For this demo, we'll use mock data
      if (supplierId === '1') {
        setFormData({
          name: 'Almarai',
          contactNumber: '543343344',
          email: 'Almarai@gmail.com',
          salesmanName: 'Turki',
          salesmanContactNumber: '555123456',
          salesmanEmail: 'turki@almarai.com',
          address: 'Riyadh, Saudi Arabia',
          vatNo: 'VAT12345',
          crNumber: 'CR98765'
        });
      }
    }
  }, [supplierId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // In a real application, you would submit to an API endpoint
      // await fetch('/api/suppliers', { method: isEditMode ? 'PUT' : 'POST', body: JSON.stringify(formData) });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success(isEditMode ? 'Supplier updated successfully!' : 'Supplier added successfully!');
      router.push('/suppliers');
    } catch (error) {
      console.error('Error saving supplier:', error);
      toast.error('Failed to save supplier');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f1fff7] min-h-screen px-3 py-3 sm:px-4 md:px-8 sm:py-4 md:py-6">
      <div className="flex items-center mb-6">
        <button onClick={() => router.push('/suppliers')} className="text-gray-600 hover:text-gray-800 mr-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold">Supplier Details</h1>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex-1">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Name</label>
              <Input
                type="text"
                name="name"
                placeholder="Enter supplier name"
                value={formData.name}
                onChange={handleChange}
                className="w-full"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Salesman Name</label>
              <Input
                type="text"
                name="salesmanName"
                placeholder="Enter salesman name"
                value={formData.salesmanName}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Contact Number</label>
              <Input
                type="text"
                name="contactNumber"
                placeholder="Enter supplier contact"
                value={formData.contactNumber}
                onChange={handleChange}
                className="w-full"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Salesman Contact Number</label>
              <Input
                type="text"
                name="salesmanContactNumber"
                placeholder="Enter salesman contact"
                value={formData.salesmanContactNumber}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Email</label>
              <Input
                type="email"
                name="email"
                placeholder="Enter supplier email"
                value={formData.email}
                onChange={handleChange}
                className="w-full"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Salesman Email</label>
              <Input
                type="email"
                name="salesmanEmail"
                placeholder="Enter salesman email"
                value={formData.salesmanEmail}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">VAT No.</label>
              <Input
                type="text"
                name="vatNo"
                placeholder="Enter supplier VAT"
                value={formData.vatNo}
                onChange={handleChange}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Supplier Address</label>
              <Input
                type="text"
                name="address"
                placeholder="Enter supplier address"
                value={formData.address}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2 font-medium">CR Number</label>
            <Input
              type="text"
              name="crNumber"
              placeholder="Enter supplier cr number"
              value={formData.crNumber}
              onChange={handleChange}
              className="w-full md:w-1/2"
            />
          </div>
          
          <div className="flex justify-end mt-6">
            <Button
              type="submit"
              className="bg-[#05A49D] text-white hover:bg-[#048c86] px-6 py-2.5 rounded-md"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'SUBMIT'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 