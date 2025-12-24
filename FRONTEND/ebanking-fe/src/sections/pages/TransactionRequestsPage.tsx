import React, { useEffect, useState } from 'react';
import { useTransactionRequestStore } from '../../stores/useTransactionRequestStore';
import { TransactionRequestTable } from '../../components/transaction-requests/TransactionRequestTable';
import { TransactionRequestFilters } from '../../components/transaction-requests/TransactionRequestFilters';
import { ProcessRequestModal } from '../../components/transaction-requests/ProcessRequestModal';
import { RequestDetailModal } from '../../components/transaction-requests/RequestDetailModal';
import { RequestStatsCards } from '../../components/transaction-requests/RequestStatsCards';
import type { TransactionRequest } from '../../types/transactionRequest';

export const TransactionRequestsPage: React.FC = () => {
  const {
    requests,
    loading,
    error,
    filter,
    pagination,
    stats,
    fetchRequests,
    fetchStats,
    processRequest,
    setFilter,
    setPage,
    clearError
  } = useTransactionRequestStore();

  const [selectedRequest, setSelectedRequest] = useState<TransactionRequest | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [filter]);

  const handleFilterChange = (newFilter: any) => {
    setFilter(newFilter);
  };

  const handleResetFilter = () => {
    setFilter({
      page: 0,
      size: 20
    });
  };

  const handleViewDetails = (request: TransactionRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleProcessRequest = (request: TransactionRequest) => {
    setSelectedRequest(request);
    setShowProcessModal(true);
  };

  const handleProcess = async (action: 'APPROVE' | 'REJECT', adminUsername: string, rejectionReason?: string) => {
    if (!selectedRequest) return;
    
    try {
      await processRequest(selectedRequest.requestId, action, adminUsername, rejectionReason);
      setShowProcessModal(false);
      setSelectedRequest(null);
      
      // Show success message
      // You can add a toast notification here if needed
    } catch (error) {
      // Error handled by store
      console.error('Process error:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý yêu cầu giao dịch
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý các yêu cầu nạp/rút tiền mặt từ tài khoản tiết kiệm
          </p>
        </div>
        
        <button
          onClick={() => {
            fetchRequests();
            fetchStats();
          }}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex justify-between items-center">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <RequestStatsCards stats={stats} />

      {/* Filters */}
      <TransactionRequestFilters
        filter={filter}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilter}
      />

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Danh sách yêu cầu ({pagination.totalElements})
          </h2>
        </div>
        
        <TransactionRequestTable
          requests={requests}
          onViewDetails={handleViewDetails}
          onProcess={handleProcessRequest}
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị {pagination.page * pagination.size + 1} - {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} 
              trong tổng số {pagination.totalElements} kết quả
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 0}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = pagination.page < 3 ? i : pagination.page - 2 + i;
                if (pageNum >= pagination.totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 text-sm border rounded-md ${
                      pageNum === pagination.page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages - 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedRequest && (
        <>
          <ProcessRequestModal
            request={selectedRequest}
            isOpen={showProcessModal}
            onClose={() => {
              setShowProcessModal(false);
              setSelectedRequest(null);
            }}
            onProcess={handleProcess}
            loading={loading}
          />
          
          <RequestDetailModal
            request={selectedRequest}
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedRequest(null);
            }}
          />
        </>
      )}
    </div>
  );
};