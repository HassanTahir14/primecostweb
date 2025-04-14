'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import StorageLocationCreateModal from '@/components/branches/StorageLocationCreateModal';
import Button from '@/components/ui/button';

// Mock data for storage locations
const mockStorageLocations = [
  { id: 1, name: 'Walking Freezer - Butchery' },
  { id: 2, name: 'Walking Fridge - Butchery' },
  { id: 3, name: 'Dry Stock Room' },
  { id: 4, name: 'Daily Stock Room' },
  { id: 5, name: 'Walking Fridge - Salad Area' },
  { id: 6, name: 'Walking Freezer - Desserts' },
  { id: 7, name: 'Walking Fridge- Desserts' },
  { id: 8, name: 'Walking Freezer - Hot Section Area' },
];

export default function StorageLocationPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  return (
    <PageLayout title="Storage Locations">
      <div className="mb-4">
        <Link href="/branches" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Back</span>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-semibold text-gray-900">Storage Location</h1>
            
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Create New
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="py-4 px-6 font-medium text-gray-600">Storage Location Name</th>
                  <th className="py-4 px-6 font-medium text-gray-600">Storage Location ID</th>
                  <th className="py-4 px-6 font-medium text-gray-600 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockStorageLocations.map((location, index) => (
                  <tr key={location.id} className="border-b border-gray-100">
                    <td className="py-4 px-6">{location.name}</td>
                    <td className="py-4 px-6">{index + 1}</td>
                    <td className="py-4 px-6">
                      <div className="flex justify-end space-x-2">
                        <Button size="sm">
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm">
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
      
      {isCreateModalOpen && (
        <StorageLocationCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </PageLayout>
  );
} 