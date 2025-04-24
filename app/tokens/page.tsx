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
  approverName: string | null; // Can be null if not yet approved/rejected
  createdAt: string;
  updatedAt: string;
}

type TokenAction = 'APPROVED' | 'REJECTED';

export default function TokensPage() {
  const [isLatestTokens, setIsLatestTokens] = useState(true);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState<number | null>(null); // Store tokenId being acted upon
  
  // For Error modal
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // For Confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalTitle, setConfirmModalTitle] = useState('');
  const [confirmModalMessage, setConfirmModalMessage] = useState('');
  const [tokenIdToAction, setTokenIdToAction] = useState<number | null>(null);
  
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
        let fetchedTokens: Token[] = response.data.tokens;

        // Sort based on isLatestTokens state BEFORE formatting
        fetchedTokens.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return isLatestTokens ? dateB - dateA : dateA - dateB; // Desc for latest, Asc otherwise
        });

        // Format dates immediately after fetching and sorting
        const formattedTokens = fetchedTokens.map((token: Token) => ({
          ...token,
          createdAt: formatDate(token.createdAt),
          updatedAt: formatDate(token.updatedAt),
        }));
        setTokens(formattedTokens);
        
        // Calculate stats using the original data before formatting if necessary
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
  }, [isLatestTokens]);

  const handleRowClick = (tokenId: number) => {
    setTokenIdToAction(tokenId);
    setConfirmModalTitle('Token Action');
    setConfirmModalMessage('Please choose an action for this token (Approve or Reject).');
    setIsConfirmModalOpen(true);
  };

  const performTokenAction = async (action: TokenAction) => {
    if (!tokenIdToAction) return;

    setIsActionLoading(tokenIdToAction); // Indicate loading for this specific token
    setIsConfirmModalOpen(false); // Close confirmation modal immediately

    try {
      await api.post('/tokens/action', {
        tokenId: tokenIdToAction,
        action: action,
      });
      // Refresh tokens after successful action
      await fetchTokens();
    } catch (error) {
      console.error(`Error performing action ${action} on token:`, error);
      setModalMessage(`Failed to perform action ${action}. Please try again.`);
      setIsErrorModalOpen(true);
    } finally {
      // Reset state regardless of success or failure
      setIsActionLoading(null);
      setTokenIdToAction(null);
    }
  };

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
                <div className={`block w-14 h-8 rounded-full ${isLatestTokens ? 'bg-[#00997B]' : 'bg-gray-300'}`}></div>
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
                    <tr 
                      key={token.tokenId} 
                      className={`border-b border-gray-100 ${
                        isActionLoading === token.tokenId ? 'opacity-50' : ''
                      } ${
                        token.tokenStatus === 'PENDING' ? 'cursor-pointer hover:bg-gray-50' : ''
                      }`}
                      onClick={() => token.tokenStatus === 'PENDING' && handleRowClick(token.tokenId)}
                    >
                      <td className="py-4 px-6">{token.tokenType}</td>
                      <td className="py-4 px-6 font-semibold">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          token.tokenStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          token.tokenStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          token.tokenStatus === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {token.tokenStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {token.createdAt}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {token.updatedAt}
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

      {/* Confirmation Modal for Token Actions */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          if (!isActionLoading) {
            setIsConfirmModalOpen(false);
            setTokenIdToAction(null);
          }
        }}
        onConfirm={() => performTokenAction('APPROVED')}
        onReject={() => performTokenAction('REJECTED')}
        title={confirmModalTitle}
        message={confirmModalMessage}
        confirmText="Approve"
        rejectText="Reject"
        cancelText="Cancel"
        isAlert={false}
      />
    </PageLayout>
  );
} 