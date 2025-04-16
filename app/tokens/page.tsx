'use client';

import { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import api from '@/store/api';
import ConfirmationModal from '@/components/common/ConfirmationModal';

interface Token {
  tokenId: number;
  tokenType: string;
  tokenStatus: string;
  requestorName: string;
  approverName: string;
  createdAt: string;
  updatedAt: string;
}

export default function TokensPage() {
  const [isLatestTokens, setIsLatestTokens] = useState(true);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // For modals
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  
  // Stats
  const [stats, setStats] = useState({
    pending: 0,
    rejected: 0,
    approved: 0
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours.toString().padStart(2, '0')}:${minutes} ${hours >= 12 ? 'PM' : 'AM'}`;
  };

  const fetchTokens = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/tokens');
      if (response.data && response.data.tokens) {
        setTokens(response.data.tokens);
        
        // Calculate stats
        const pendingCount = response.data.tokens.filter((token: Token) => token.tokenStatus === 'PENDING').length;
        const rejectedCount = response.data.tokens.filter((token: Token) => token.tokenStatus === 'REJECTED').length;
        const approvedCount = response.data.tokens.filter((token: Token) => token.tokenStatus === 'APPROVED').length;
        
        setStats({
          pending: pendingCount,
          rejected: rejectedCount,
          approved: approvedCount
        });
      }
    } catch (error) {
      console.error('Error fetching tokens:', error);
      setModalMessage('Failed to load tokens. Please try again later.');
      setIsErrorModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  return (
    <PageLayout title="Tokens">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h1 className="text-3xl font-semibold text-gray-900">Token</h1>
            
            <div className="flex space-x-4">
              <div className="bg-[#00997B] text-white rounded-lg py-3 px-5 text-center">
                <p className="font-medium">Pending: {stats.pending}</p>
              </div>
              <div className="bg-[#00997B] text-white rounded-lg py-3 px-5 text-center">
                <p className="font-medium">Rejected: {stats.rejected}</p>
              </div>
              <div className="bg-[#00997B] text-white rounded-lg py-3 px-5 text-center">
                <p className="font-medium">Approved: {stats.approved}</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end items-center">
            <label className="flex items-center cursor-pointer">
              <span className="mr-3 text-gray-700 font-medium">Latest Tokens</span>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={isLatestTokens}
                  onChange={() => setIsLatestTokens(!isLatestTokens)} 
                />
                <div className={`block w-14 h-8 rounded-full ${isLatestTokens ? 'bg-gray-400' : 'bg-gray-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ${isLatestTokens ? 'transform translate-x-6' : ''}`}></div>
              </div>
            </label>
          </div>
          
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="py-4 px-6 font-medium text-gray-600 w-1/5">Token Type</th>
                    <th className="py-4 px-6 font-medium text-gray-600 w-1/6">Status</th>
                    <th className="py-4 px-6 font-medium text-gray-600 w-1/4">
                      <div>Created at:</div>
                    </th>
                    <th className="py-4 px-6 font-medium text-gray-600 w-1/4">
                      <div>Updated at:</div>
                    </th>
                    <th className="py-4 px-6 font-medium text-gray-600 w-1/6">Requested By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tokens.map((token) => (
                    <tr key={token.tokenId} className="border-b border-gray-100">
                      <td className="py-4 px-6">{token.tokenType}</td>
                      <td className="py-4 px-6 font-semibold">{token.tokenStatus}</td>
                      <td className="py-4 px-6 text-gray-600">
                        Created at: {token.createdAt}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        Updated at: {token.updatedAt}
                      </td>
                      <td className="py-4 px-6 text-[#00997B] font-semibold">{token.requestorName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tokens.length === 0 && !isLoading && (
              <div className="text-center py-6 text-gray-500">
                No tokens found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Modal */}
      <ConfirmationModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title="Error"
        message={modalMessage}
        isAlert={true}
        okText="OK"
      />
    </PageLayout>
  );
} 