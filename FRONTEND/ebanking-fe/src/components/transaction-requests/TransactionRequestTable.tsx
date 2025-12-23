import React from 'react';
import type { TransactionRequest } from '../../types/transactionRequest';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

interface TransactionRequestTableProps {
  requests: TransactionRequest[];
  onViewDetails: (request: TransactionRequest) => void;
  onProcess: (request: TransactionRequest) => void;
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    PENDING: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-800' },
    APPROVED: { label: 'Đã duyệt', className: 'bg-green-100 text-green-800' },
    REJECTED: { label: 'Từ chối', className: 'bg-red-100 text-red-800' },
    COMPLETED: { label: 'Hoàn thành', className: 'bg-blue-100 text-blue-800' }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || 
    { label: status, className: 'bg-gray-100 text-gray-800' };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

const getRequestTypeBadge = (type: string) => {
  const typeConfig = {
    CASH_DEPOSIT: { label: 'Nạp tiền', className: 'bg-green-50 text-green-700' },
    CASH_WITHDRAWAL: { label: 'Rút tiền', className: 'bg-orange-50 text-orange-700' }
  };

  const config = typeConfig[type as keyof typeof typeConfig] || 
    { label: type, className: 'bg-gray-50 text-gray-700' };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

export const TransactionRequestTable: React.FC<TransactionRequestTableProps> = ({
  requests = [], // Default to empty array if undefined
  onViewDetails,
  onProcess
}) => {
  // Early return if requests is not an array
  if (!Array.isArray(requests)) {
    return (
      <div className="text-center py-8 text-gray-500">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mã yêu cầu
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Loại
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Số tiền
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ngày tạo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map((request) => (
            <tr key={request.requestId} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {request.requestNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getRequestTypeBadge(request.requestType)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(request.amount, request.currency)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {request.userId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(request.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDateTime(request.requestedAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  onClick={() => onViewDetails(request)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Chi tiết
                </button>
                {request.status === 'PENDING' && (
                  <button
                    onClick={() => onProcess(request)}
                    className="text-green-600 hover:text-green-900"
                  >
                    Xử lý
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {requests.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Không có yêu cầu nào
        </div>
      )}
    </div>
  );
};