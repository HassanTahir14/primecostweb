'use client';

import { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import api from '@/store/api';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import Modal from '@/components/common/Modal';
import { useTranslation } from '@/context/TranslationContext';

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
  const { t } = useTranslation();
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

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [filter, setFilter] = useState({
    fromDate: '',
    toDate: '',
    noOfRecords: 50,
    sortBy: 'asc',
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
      const response = await api.post('/tokens/get', {
        page: 0, // not 1
        size: 100000,
        sortBy: 'createdAt',
        direction: 'asc',
        startDate: '2020-04-27', // 'YYYY-MM-DD'
        endDate: new Date().toISOString().split('T')[0],   // 'YYYY-MM-DD'
      });
      
      
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

  const fetchTokensWithFilter = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/tokens/get', {
        page: 0,
        size: filter.noOfRecords,
        sortBy: 'createdAt',
        direction: filter.sortBy,
        startDate: filter.fromDate || '2020-04-27',
        endDate: filter.toDate || today,
      });
      if (response.data && response.data.tokens) {
        let fetchedTokens: Token[] = response.data.tokens;
        fetchedTokens.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return isLatestTokens ? dateB - dateA : dateA - dateB;
        });
        const formattedTokens = fetchedTokens.map((token: Token) => ({
          ...token,
          createdAt: formatDate(token.createdAt),
          updatedAt: formatDate(token.updatedAt),
        }));
        setTokens(formattedTokens);
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
    <PageLayout title={t('tokens.title')}>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h1 className="text-3xl font-semibold text-gray-900">{t('tokens.heading')}</h1>
            <div className="flex space-x-4">
              <button
                className="bg-[#00997B] text-white rounded-lg py-3 px-6 font-semibold shadow"
                onClick={() => setIsFilterModalOpen(true)}
                style={{ minWidth: '140px' }}
              >
                {t('tokens.applyFilter')}
              </button>
              <div className="bg-[#00997B] text-white rounded-lg py-3 px-5 text-center font-medium">
                <p className="font-medium">{t('tokens.pending')}: {stats.pending}</p>
              </div>
              <div className="bg-[#00997B] text-white rounded-lg py-3 px-5 text-center font-medium">
                <p className="font-medium">{t('tokens.rejected')}: {stats.rejected}</p>
              </div>
              <div className="bg-[#00997B] text-white rounded-lg py-3 px-5 text-center font-medium">
                <p className="font-medium">{t('tokens.approved')}: {stats.approved}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 px-2 py-2 border-b border-gray-200">
            <div className="text-lg font-semibold text-gray-400">{t('tokens.tokenType')}</div>
            <div className="text-lg font-semibold text-gray-400 text-center">{t('tokens.status')}</div>
            <div className="text-lg font-semibold text-gray-400 text-right">{t('tokens.requestedBy')}</div>
          </div>
          <div className="flex flex-col gap-3">
            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              tokens.map((token) => (
                <div
                  key={token.tokenId}
                  className={`grid grid-cols-3 items-center bg-white rounded-lg px-2 py-4 shadow-sm border border-gray-100 ${
                    isActionLoading === token.tokenId ? 'opacity-50' : ''
                  } ${
                    token.tokenStatus === 'PENDING' ? 'cursor-pointer hover:bg-gray-50' : ''
                  }`}
                  onClick={() => token.tokenStatus === 'PENDING' && handleRowClick(token.tokenId)}
                >
                  <div className="flex flex-col min-w-0">
                    <div className="text-base font-semibold text-gray-900">{token.tokenType.split('@')[0]}</div>
                    <div className="text-sm text-gray-400 mt-1">{t('tokens.createdAt')}:{token.createdAt}</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`text-base font-bold ${
                      token.tokenStatus === 'PENDING' ? 'text-red-500' :
                      token.tokenStatus === 'APPROVED' ? 'text-black' :
                      token.tokenStatus === 'REJECTED' ? 'text-gray-500' : 'text-gray-800'
                    }`}>
                      {token.tokenStatus}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">{t('tokens.updatedAt')}:{token.updatedAt}</span>
                  </div>
                  <div className="text-[#00997B] font-semibold text-base text-right">{token.requestorName}</div>
                </div>
              ))
            )}
            {tokens.length === 0 && !isLoading && (
              <div className="text-center py-6 text-gray-500">
                {t('tokens.noTokensFound')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Modal */}
      <ConfirmationModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title={t('common.error')}
        message={modalMessage}
        okText={t('common.ok')}
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
        confirmText={t('tokens.approve')}
        rejectText={t('tokens.reject')}
        cancelText={t('common.cancel')}
        isAlert={false}
      />

      {/* Filter Modal */}
      <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} size="md">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 font-medium">{t('tokens.fromDate')}</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={filter.fromDate}
              onChange={e => setFilter(f => ({ ...f, fromDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">{t('tokens.toDate')}</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={filter.toDate}
              onChange={e => setFilter(f => ({ ...f, toDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">{t('tokens.noOfRecords')}</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={filter.noOfRecords}
              onChange={e => setFilter(f => ({ ...f, noOfRecords: parseInt(e.target.value, 10) || 0 }))}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">{t('tokens.sortBy')}</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={filter.sortBy}
              onChange={e => setFilter(f => ({ ...f, sortBy: e.target.value }))}
            >
              <option value="asc">{t('tokens.ascending')}</option>
              <option value="desc">{t('tokens.descending')}</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              className="bg-gray-200 text-gray-700 rounded px-4 py-2"
              onClick={() => setIsFilterModalOpen(false)}
            >
              {t('common.cancel')}
            </button>
            <button
              className="bg-[#00997B] text-white rounded px-4 py-2"
              onClick={() => {
                setIsFilterModalOpen(false);
                fetchTokensWithFilter();
              }}
            >
              {t('tokens.apply')}
            </button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}