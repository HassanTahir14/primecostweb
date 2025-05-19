'use client';

import { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import api from '@/store/api'; // Import the api instance
import ConfirmationModal from '@/components/common/ConfirmationModal'; // Import the modal

// Remove mock data
// const mockSlaData = [...];

export default function SlaReportPage() {
  // Add state for data, loading, modal, and summary counts
  const [slaData, setSlaData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalMessage, setModalMessage] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isModalAlert, setIsModalAlert] = useState<boolean>(false);
  
  // State for summary counts
  const [totalRequests, setTotalRequests] = useState<number>(0);
  const [approvedCount, setApprovedCount] = useState<number>(0);
  const [rejectedCount, setRejectedCount] = useState<number>(0);
  const [pendingCount, setPendingCount] = useState<number>(0);

  // Fetch data on component mount
  useEffect(() => {
    const fetchSlaData = async () => {
      setLoading(true);
      setModalMessage('');
      setIsModalOpen(false);
      // Reset counts
      setTotalRequests(0);
      setApprovedCount(0);
      setRejectedCount(0);
      setPendingCount(0);

      try {
        const response = await api.post('/sla/view', {});
        
        if (response.data && response.data.responseCode === '0000') {
          // Use slaDtoList and update counts
          setSlaData(response.data.slaDtoList || []); 
          setTotalRequests(response.data.totalRequests || 0);
          setApprovedCount(response.data.approved || 0);
          setRejectedCount(response.data.rejected || 0);
          setPendingCount(response.data.pending || 0);
        } else {
          const errorDesc = response.data?.description || 'Failed to fetch SLA data.';
          setModalMessage(errorDesc);
          setIsModalAlert(true);
          setIsModalOpen(true);
          setSlaData([]);
        }
      } catch (error: any) {
        console.error('Error fetching SLA data:', error);
        setModalMessage(error.message || 'An unexpected error occurred.');
        setIsModalAlert(true);
        setIsModalOpen(true);
        setSlaData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlaData();
  }, []);

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setModalMessage('');
  };

  return (
    <PageLayout title="SLA Report">
      <div className="space-y-6">
        {/* Status Cards - Updated with dynamic data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#00997B] text-white rounded-lg p-4 flex justify-between items-center">
            <span className="font-medium">Total Request</span>
            <span className="bg-white text-[#00997B] rounded-full px-2 py-0.5 text-sm font-semibold">
              {loading ? '-' : totalRequests}
            </span>
          </div>
          <div className="bg-[#00997B] text-white rounded-lg p-4 flex justify-between items-center">
            <span className="font-medium">Approved</span>
            <span className="bg-white text-[#00997B] rounded-full px-2 py-0.5 text-sm font-semibold">
              {loading ? '-' : approvedCount}
            </span>
          </div>
          <div className="bg-[#00997B] text-white rounded-lg p-4 flex justify-between items-center">
            <span className="font-medium">Rejected</span>
            <span className="bg-white text-[#00997B] rounded-full px-2 py-0.5 text-sm font-semibold">
              {loading ? '-' : rejectedCount}
            </span>
          </div>
          <div className="bg-[#00997B] text-white rounded-lg p-4 flex justify-between items-center">
            <span className="font-medium">Pending</span>
            <span className="bg-white text-[#00997B] rounded-full px-2 py-0.5 text-sm font-semibold">
              {loading ? '-' : pendingCount}
            </span>
          </div>
        </div>

        {/* SLA Report Table */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">SLA Report</h2>
            {/* <Button>
              Export Data
            </Button> */}
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading SLA data...</div>
            ) : slaData.length === 0 && !modalMessage ? (
              <div className="text-center py-4 text-gray-500">No SLA data available.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="py-3 px-4 font-medium text-gray-600">Type</th>
                    <th className="py-3 px-4 font-medium text-gray-600">ID</th>
                    <th className="py-3 px-4 font-medium text-gray-600">From</th>
                    <th className="py-3 px-4 font-medium text-gray-600">Dated</th>
                    <th className="py-3 px-4 font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {slaData.map((item, index) => (
                    <tr key={item.id || index}>
                      <td className="py-3 px-4">{item.type ? item.type.split('@')[0] : ''}</td>
                      <td className="py-3 px-4">{item.id}</td>
                      <td className="py-3 px-4">{item.from}</td>
                      <td className="py-3 px-4">{item.date}</td>
                      <td
                        className={`py-3 px-4 font-semibold ${
                          item.status === 'APPROVED'
                            ? 'text-green-600'
                            : item.status === 'REJECTED'
                            ? 'text-red-600'
                            : item.status === 'PENDING'
                            ? 'text-yellow-600'
                            : ''
                        }`}
                      >
                        {item.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation/Error Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isModalAlert ? 'Error' : 'Information'}
        message={modalMessage}
        isAlert={isModalAlert}
        okText="OK"
      />
    </PageLayout>
  );
} 