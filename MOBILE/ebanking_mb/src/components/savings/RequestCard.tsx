import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SavingsRequest } from '../../types/SavingsTypes';

interface RequestCardProps {
  request: SavingsRequest;
  onPress: () => void;
}

export default function RequestCard({ request, onPress }: RequestCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#FF9800';
      case 'APPROVED':
        return '#4CAF50';
      case 'REJECTED':
        return '#F44336';
      case 'CANCELLED':
        return '#9E9E9E';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Đang chờ duyệt';
      case 'APPROVED':
        return 'Đã duyệt';
      case 'REJECTED':
        return 'Bị từ chối';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    return type === 'DEPOSIT' ? 'Nạp tiền mặt' : 'Rút tiền mặt';
  };

  const getTypeIcon = (type: string) => {
    return type === 'DEPOSIT' ? '↓' : '↑';
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          <Text style={[styles.typeIcon, { color: request.type === 'DEPOSIT' ? '#4CAF50' : '#F44336' }]}>
            {getTypeIcon(request.type)}
          </Text>
          <Text style={styles.typeText}>{getTypeText(request.type)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(request.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(request.status)}</Text>
        </View>
      </View>

      <View style={styles.amountContainer}>
        <Text style={styles.amount}>{formatCurrency(request.amount)}</Text>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.requestId}>Mã yêu cầu: {request.requestNumber}</Text>
        <Text style={styles.accountNumber}>STK: {request.savingsAccountNumber}</Text>
        <Text style={styles.requestDate}>
          Ngày tạo: {formatDate(request.requestDate)}
        </Text>
        {request.processedDate && (
          <Text style={styles.processedDate}>
            Ngày xử lý: {formatDate(request.processedDate)}
          </Text>
        )}
        {request.processedBy && (
          <Text style={styles.processedBy}>
            Người xử lý: {request.processedBy}
          </Text>
        )}
      </View>

      {request.note && (
        <View style={styles.noteContainer}>
          <Text style={styles.noteLabel}>Ghi chú:</Text>
          <Text style={styles.noteText}>{request.note}</Text>
        </View>
      )}

      {request.reason && (
        <View style={styles.reasonContainer}>
          <Text style={styles.reasonLabel}>Lý do:</Text>
          <Text style={styles.reasonText}>{request.reason}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  amountContainer: {
    marginBottom: 12,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  detailsContainer: {
    marginBottom: 8,
  },
  requestId: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  processedDate: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  processedBy: {
    fontSize: 14,
    color: '#666666',
  },
  noteContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  noteLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: '#333333',
  },
  reasonContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  reasonLabel: {
    fontSize: 12,
    color: '#D32F2F',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: '#D32F2F',
  },
});