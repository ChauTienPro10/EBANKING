import React from 'react';
import type { TransactionRequestFilter } from '../../types/transactionRequest';

interface TransactionRequestFiltersProps {
  filter: TransactionRequestFilter;
  onFilterChange: (filter: Partial<TransactionRequestFilter>) => void;
  onReset: () => void;
}

export const TransactionRequestFilters: React.FC<TransactionRequestFiltersProps> = ({
  filter,
  onFilterChange,
  onReset
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Trạng thái */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trạng thái
          </label>
          <select
            value={filter.status || ''}
            onChange={(e) => onFilterChange({ status: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
            <option value="COMPLETED">Hoàn thành</option>
          </select>
        </div>

        {/* Loại yêu cầu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Loại yêu cầu
          </label>
          <select
            value={filter.requestType || ''}
            onChange={(e) => onFilterChange({ requestType: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả</option>
            <option value="CASH_DEPOSIT">Nạp tiền</option>
            <option value="CASH_WITHDRAWAL">Rút tiền</option>
          </select>
        </div>

        {/* Từ ngày */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Từ ngày
          </label>
          <input
            type="date"
            value={filter.fromDate || ''}
            onChange={(e) => onFilterChange({ fromDate: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Đến ngày */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Đến ngày
          </label>
          <input
            type="date"
            value={filter.toDate || ''}
            onChange={(e) => onFilterChange({ toDate: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mã yêu cầu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mã yêu cầu
          </label>
          <input
            type="text"
            value={filter.requestNumber || ''}
            onChange={(e) => onFilterChange({ requestNumber: e.target.value || undefined })}
            placeholder="Nhập mã yêu cầu"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* User ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID người dùng
          </label>
          <input
            type="number"
            value={filter.userId || ''}
            onChange={(e) => onFilterChange({ userId: e.target.value ? parseInt(e.target.value) : undefined })}
            placeholder="Nhập ID người dùng"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Số tiền tối thiểu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số tiền tối thiểu
          </label>
          <input
            type="number"
            value={filter.minAmount || ''}
            onChange={(e) => onFilterChange({ minAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Số tiền tối đa */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số tiền tối đa
          </label>
          <input
            type="number"
            value={filter.maxAmount || ''}
            onChange={(e) => onFilterChange({ maxAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
            placeholder="Không giới hạn"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={onReset}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Đặt lại
        </button>
      </div>
    </div>
  );
};