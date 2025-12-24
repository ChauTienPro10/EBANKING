import React, { useState } from 'react';
import type { TransactionRequest } from '../../types/transactionRequest';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

interface ProcessRequestModalProps {
  request: TransactionRequest;
  isOpen: boolean;
  onClose: () => void;
  onProcess: (action: 'APPROVE' | 'REJECT', adminUsername: string, rejectionReason?: string) => void;
  loading: boolean;
}

export const ProcessRequestModal: React.FC<ProcessRequestModalProps> = ({
  request,
  isOpen,
  onClose,
  onProcess,
  loading
}) => {
  const [action, setAction] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminUsername, setAdminUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!action || !adminUsername.trim()) return;
    
    onProcess(action, adminUsername, action === 'REJECT' ? rejectionReason : undefined);
  };

  const resetForm = () => {
    setAction(null);
    setRejectionReason('');
    setAdminUsername('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Xử lý yêu cầu giao dịch
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Thông tin yêu cầu */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Thông tin yêu cầu</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Mã yêu cầu:</span>
              <span className="ml-2 font-medium">{request.requestNumber}</span>
            </div>
            <div>
              <span className="text-gray-500">Loại:</span>
              <span className="ml-2 font-medium">
                {request.requestType === 'CASH_DEPOSIT' ? 'Nạp tiền' : 'Rút tiền'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Số tiền:</span>
              <span className="ml-2 font-medium text-lg">
                {formatCurrency(request.amount, request.currency)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Ngày tạo:</span>
              <span className="ml-2">{formatDateTime(request.requestedAt)}</span>
            </div>
            <div>
              <span className="text-gray-500">User ID:</span>
              <span className="ml-2">{request.userId}</span>
            </div>
            <div>
              <span className="text-gray-500">Savings Account ID:</span>
              <span className="ml-2">{request.savingsAccountId}</span>
            </div>
            {request.description && (
              <div className="col-span-2">
                <span className="text-gray-500">Mô tả:</span>
                <span className="ml-2">{request.description}</span>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Admin Username */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên admin *
            </label>
            <input
              type="text"
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              required
              placeholder="Nhập tên admin"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Chọn hành động */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chọn hành động
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="action"
                  value="APPROVE"
                  checked={action === 'APPROVE'}
                  onChange={(e) => setAction(e.target.value as 'APPROVE')}
                  className="mr-2"
                />
                <span className="text-green-600 font-medium">Duyệt yêu cầu</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="action"
                  value="REJECT"
                  checked={action === 'REJECT'}
                  onChange={(e) => setAction(e.target.value as 'REJECT')}
                  className="mr-2"
                />
                <span className="text-red-600 font-medium">Từ chối yêu cầu</span>
              </label>
            </div>
          </div>

          {/* Lý do từ chối */}
          {action === 'REJECT' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do từ chối *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập lý do từ chối..."
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!action || !adminUsername.trim() || loading || (action === 'REJECT' && !rejectionReason.trim())}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};