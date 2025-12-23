import React from 'react';
import { formatCurrency } from '../../utils/formatters';

interface RequestStatsCardsProps {
  stats: {
    pending: number;
    approved: number;
    rejected: number;
    completed: number;
    totalAmount: number;
  } | null;
}

export const RequestStatsCards: React.FC<RequestStatsCardsProps> = ({ stats }) => {
  if (!stats) return null;

  // Ensure all values are numbers with fallback to 0
  const safeStats = {
    pending: typeof stats.pending === 'number' ? stats.pending : 0,
    approved: typeof stats.approved === 'number' ? stats.approved : 0,
    rejected: typeof stats.rejected === 'number' ? stats.rejected : 0,
    completed: typeof stats.completed === 'number' ? stats.completed : 0,
    totalAmount: typeof stats.totalAmount === 'number' ? stats.totalAmount : 0
  };

  const cards = [
    {
      title: 'Chờ duyệt',
      value: safeStats.pending,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700'
    },
    {
      title: 'Đã duyệt',
      value: safeStats.approved,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: 'Từ chối',
      value: safeStats.rejected,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    },
    {
      title: 'Hoàn thành',
      value: safeStats.completed,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card, index) => (
        <div key={index} className={`${card.bgColor} rounded-lg p-4`}>
          <div className="flex items-center">
            <div className={`w-3 h-3 ${card.color} rounded-full mr-3`}></div>
            <div>
              <p className="text-sm text-gray-600">{card.title}</p>
              <p className={`text-2xl font-bold ${card.textColor}`}>
                {card.value.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ))}
      
      {/* Tổng số tiền */}
      <div className="bg-purple-50 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
          <div>
            <p className="text-sm text-gray-600">Tổng số tiền</p>
            <p className="text-2xl font-bold text-purple-700">
              {formatCurrency(safeStats.totalAmount, 'VND')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};