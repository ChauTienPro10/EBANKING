import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp as NavigationRouteProp } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootStackParamList } from '../../navigation/types';
import { RootState } from '../../store';
import { SavingsService } from '../../services/SavingsService';
import { SavingsRequest } from '../../types/SavingsTypes';
import Header from '../../components/Header';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProp = NavigationRouteProp<RootStackParamList, 'SavingsRequestDetail'>;

export default function SavingsRequestDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const { requestId } = route.params;
  
  const [request, setRequest] = useState<SavingsRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const loadRequestDetail = async () => {
    try {
      const requestData = await SavingsService.getSavingsRequestDetail(requestId);
      setRequest(requestData);
    } catch (error) {
      console.error('Error loading request detail:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin yêu cầu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRequestDetail();
    }, [requestId])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadRequestDetail();
  };

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
    return type === 'DEPOSIT' ? '💰' : '💸';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '⏳';
      case 'APPROVED':
        return '✅';
      case 'REJECTED':
        return '❌';
      case 'CANCELLED':
        return '🚫';
      default:
        return '❓';
    }
  };

  const handleCancelRequest = () => {
    if (!request || request.status !== 'PENDING') return;

    Alert.alert(
      'Xác nhận hủy',
      'Bạn có chắc chắn muốn hủy yêu cầu này?',
      [
        { text: 'Không', style: 'cancel' },
        { text: 'Hủy yêu cầu', style: 'destructive', onPress: performCancel },
      ]
    );
  };

  const performCancel = async () => {
    setCancelling(true);
    try {
      await SavingsService.cancelSavingsRequest(requestId);
      
      Alert.alert(
        'Thành công',
        'Yêu cầu đã được hủy thành công',
        [
          {
            text: 'OK',
            onPress: () => {
              loadRequestDetail(); // Reload để cập nhật trạng thái
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error cancelling request:', error);
      Alert.alert('Lỗi', 'Không thể hủy yêu cầu');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Chi tiết yêu cầu" showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.container}>
        <Header title="Chi tiết yêu cầu" showBackButton />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy thông tin yêu cầu</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Chi tiết yêu cầu" showBackButton />
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header thông tin */}
        <View style={styles.headerCard}>
          <View style={styles.typeContainer}>
            <Text style={styles.typeIcon}>{getTypeIcon(request.type)}</Text>
            <Text style={styles.typeText}>{getTypeText(request.type)}</Text>
          </View>
          
          <View style={styles.amountContainer}>
            <Text style={styles.amount}>{formatCurrency(request.amount)}</Text>
          </View>
          
          <View style={styles.statusContainer}>
            <Text style={styles.statusIcon}>{getStatusIcon(request.status)}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(request.status) },
              ]}
            >
              <Text style={styles.statusText}>{getStatusText(request.status)}</Text>
            </View>
          </View>
        </View>

        {/* Thông tin chi tiết */}
        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>Thông tin yêu cầu</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mã yêu cầu:</Text>
            <Text style={styles.detailValue}>{request.id}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tài khoản tiết kiệm:</Text>
            <Text style={styles.detailValue}>{request.savingsAccountId}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Loại yêu cầu:</Text>
            <Text style={styles.detailValue}>{getTypeText(request.type)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Số tiền:</Text>
            <Text style={[styles.detailValue, styles.amountValue]}>
              {formatCurrency(request.amount)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ngày tạo:</Text>
            <Text style={styles.detailValue}>{formatDate(request.requestDate)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Trạng thái:</Text>
            <Text style={[styles.detailValue, { color: getStatusColor(request.status) }]}>
              {getStatusText(request.status)}
            </Text>
          </View>
        </View>

        {/* Thông tin xử lý */}
        {(request.processedDate || request.processedBy) && (
          <View style={styles.detailCard}>
            <Text style={styles.cardTitle}>Thông tin xử lý</Text>
            
            {request.processedDate && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Ngày xử lý:</Text>
                <Text style={styles.detailValue}>{formatDate(request.processedDate)}</Text>
              </View>
            )}
            
            {request.processedBy && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Người xử lý:</Text>
                <Text style={styles.detailValue}>{request.processedBy}</Text>
              </View>
            )}
          </View>
        )}

        {/* Ghi chú */}
        {request.note && (
          <View style={styles.detailCard}>
            <Text style={styles.cardTitle}>Ghi chú</Text>
            <Text style={styles.noteText}>{request.note}</Text>
          </View>
        )}

        {/* Lý do từ chối */}
        {request.reason && (
          <View style={styles.reasonCard}>
            <Text style={styles.cardTitle}>Lý do từ chối</Text>
            <Text style={styles.reasonText}>{request.reason}</Text>
          </View>
        )}

        {/* Hướng dẫn */}
        <View style={styles.guideCard}>
          <Text style={styles.cardTitle}>Hướng dẫn</Text>
          
          {request.status === 'PENDING' && (
            <View style={styles.guideItem}>
              <Text style={styles.guideIcon}>⏳</Text>
              <Text style={styles.guideText}>
                Yêu cầu đang được xử lý. Thời gian xử lý dự kiến: 1-2 ngày làm việc.
              </Text>
            </View>
          )}
          
          {request.status === 'APPROVED' && request.type === 'DEPOSIT' && (
            <View style={styles.guideItem}>
              <Text style={styles.guideIcon}>✅</Text>
              <Text style={styles.guideText}>
                Yêu cầu đã được duyệt. Vui lòng đến ngân hàng để nạp tiền mặt vào tài khoản.
              </Text>
            </View>
          )}
          
          {request.status === 'APPROVED' && request.type === 'WITHDRAW' && (
            <View style={styles.guideItem}>
              <Text style={styles.guideIcon}>✅</Text>
              <Text style={styles.guideText}>
                Yêu cầu đã được duyệt. Vui lòng đến ngân hàng để nhận tiền mặt.
              </Text>
            </View>
          )}
          
          {request.status === 'REJECTED' && (
            <View style={styles.guideItem}>
              <Text style={styles.guideIcon}>❌</Text>
              <Text style={styles.guideText}>
                Yêu cầu bị từ chối. Bạn có thể tạo yêu cầu mới sau khi khắc phục lý do từ chối.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Nút hủy yêu cầu */}
      {request.status === 'PENDING' && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.cancelButton, cancelling && styles.disabledButton]}
            onPress={handleCancelRequest}
            disabled={cancelling}
          >
            {cancelling ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.cancelButtonText}>Hủy yêu cầu</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  typeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  amountContainer: {
    marginBottom: 16,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    textAlign: 'right',
  },
  amountValue: {
    color: '#1976D2',
    fontSize: 16,
  },
  noteText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  reasonCard: {
    backgroundColor: '#FFEBEE',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  reasonText: {
    fontSize: 14,
    color: '#D32F2F',
    lineHeight: 20,
  },
  guideCard: {
    backgroundColor: '#E8F5E8',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  guideIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  guideText: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
    flex: 1,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});