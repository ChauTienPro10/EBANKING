import React from 'react';
import type { TransactionRequest } from '../../types/transactionRequest';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

interface RequestDetailModalProps {
  request: TransactionRequest;
  isOpen: boolean;
  onClose: () => void;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  request,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'APPROVED': return 'text-green-600 bg-green-100';
      case 'REJECTED': return 'text-red-600 bg-red-100';
      case 'COMPLETED': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Chờ duyệt';
      case 'APPROVED': return 'Đã duyệt';
      case 'REJECTED': return 'Từ chối';
      case 'COMPLETED': return 'Hoàn thành';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Chi tiết yêu cầu giao dịch
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Thông tin cơ bản */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Thông tin cơ bản</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Mã yêu cầu:</span>
                <span className="ml-2 font-medium">{request.requestNumber}</span>
              </div>
              <div>
                <span className="text-gray-500">Trạng thái:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                  {getStatusText(request.status)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Loại giao dịch:</span>
                <span className="ml-2 font-medium">
                  {request.requestType === 'CASH_DEPOSIT' ? 'Nạp tiền mặt' : 'Rút tiền mặt'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Số tiền:</span>
                <span className="ml-2 font-medium text-lg text-blue-600">
                  {formatCurrency(request.amount, request.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Thông tin tài khoản */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Thông tin tài khoản</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">ID người dùng:</span>
                <span className="ml-2 font-medium">{request.userId}</span>
              </div>
              <div>
                <span className="text-gray-500">ID tài khoản tiết kiệm:</span>
                <span className="ml-2 font-medium">{request.savingsAccountId}</span>
              </div>
            </div>
          </div>

          {/* Mô tả */}
          {request.description && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Mô tả</h3>
              <p className="text-sm text-gray-700">{request.description}</p>
            </div>
          )}

          {/* Lý do từ chối */}
          {request.status === 'REJECTED' && request.rejectionReason && (
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="font-medium text-red-900 mb-3">Lý do từ chối</h3>
              <p className="text-sm text-red-700">{request.rejectionReason}</p>
            </div>
          )}

          {/* Thông tin xử lý */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Thông tin xử lý</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Ngày tạo:</span>
                <span className="ml-2">{formatDateTime(request.requestedAt)}</span>
              </div>
              <div>
                <span className="text-gray-500">Ngày cập nhật:</span>
                <span className="ml-2">{formatDateTime(request.updatedAt)}</span>
              </div>
              {request.processedAt && (
                <div>
                  <span className="text-gray-500">Ngày xử lý:</span>
                  <span className="ml-2">{formatDateTime(request.processedAt)}</span>
                </div>
              )}
              {request.processedBy && (
                <div>
                  <span className="text-gray-500">Người xử lý:</span>
                  <span className="ml-2 font-medium">{request.processedBy}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};