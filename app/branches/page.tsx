'use client';

import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BranchCreateModal from '@/components/branches/BranchCreateModal';
import Button from '@/components/ui/button';

// Mock data for branches
const mockBranches = [
  { 
    id: 1, 
    name: 'Main Brnach',
    branchId: 'Walking Freezer - Butchery, Walking Fridge - Butchery, Dry Stock Room, Walking Fridge - Salad Area, Daily Stock Room, Walking Freezer - Desserts, Walking Fridge-Desserts',
    manager: 'Walid Sulaiman',
    location: 'Walid.sulieman@primecost.com'
  }
];

export default function BranchesPage() {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  return (
    <PageLayout title="Branches">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-semibold text-gray-900">Branches</h1>
            
            <div className="flex space-x-4">
              <Button onClick={() => setIsCreateModalOpen(true)}>
                Create New
              </Button>
              <Link href="/branches/storage-location">
                <Button>
                  Storage Location
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="py-4 px-6 font-medium text-gray-600">Branch Name</th>
                  <th className="py-4 px-6 font-medium text-gray-600">Branch Id</th>
                  <th className="py-4 px-6 font-medium text-gray-600">Branch Manager</th>
                  <th className="py-4 px-6 font-medium text-gray-600">Branch Location</th>
                  <th className="py-4 px-6 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockBranches.map((branch) => (
                  <tr key={branch.id} className="border-b border-gray-100">
                    <td className="py-4 px-6">{branch.name}</td>
                    <td className="py-4 px-6">{branch.branchId}</td>
                    <td className="py-4 px-6">{branch.manager}</td>
                    <td className="py-4 px-6">{branch.location}</td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
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
        <BranchCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </PageLayout>
  );
} 