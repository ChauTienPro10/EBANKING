import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootStackParamList } from '../../navigation/types';
import { RootState } from '../../store';
import { SavingsService } from '../../services/SavingsService';
import { SavingsRequest } from '../../types/SavingsTypes';
import RequestCard from '../../components/savings/RequestCard';
import Header from '../../components/Header';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SavingsRequestListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { userInfoData: userInfo } = useSelector(
    (state: RootState) => state.app,
  );

  const [requests, setRequests] = useState<SavingsRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<
    'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  >('ALL');

  const loadRequests = useCallback(async () => {
    if (!userInfo?.id) return;

    try {
      const requestsData = await SavingsService.getSavingsRequests(
        userInfo.id.toString(),
      );
      setRequests(requestsData);
    } catch (error) {
      console.error('Error loading requests:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách yêu cầu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userInfo?.id]);

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [loadRequests]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const handleRequestPress = (requestId: string) => {
    navigation.navigate('SavingsRequestDetail', {
      requestId: Number(requestId),
    });
  };

  const getFilteredRequests = () => {
    if (filter === 'ALL') return requests;
    return requests.filter(request => request.status === filter);
  };

  const getFilterButtonStyle = (filterType: typeof filter) => {
    return [
      styles.filterButton,
      filter === filterType && styles.activeFilterButton,
    ];
  };

  const getFilterButtonTextStyle = (filterType: typeof filter) => {
    return [
      styles.filterButtonText,
      filter === filterType && styles.activeFilterButtonText,
    ];
  };

  const getStatusCount = (status: string) => {
    if (status === 'ALL') return requests.length;
    return requests.filter(request => request.status === status).length;
  };

  const filteredRequests = getFilteredRequests();

  return (
    <View style={styles.container}>
      <Header title="Danh sách yêu cầu" showBackButton />

      {/* Bộ lọc */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={getFilterButtonStyle('ALL')}
            onPress={() => setFilter('ALL')}
          >
            <Text style={getFilterButtonTextStyle('ALL')}>
              Tất cả ({getStatusCount('ALL')})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={getFilterButtonStyle('PENDING')}
            onPress={() => setFilter('PENDING')}
          >
            <Text style={getFilterButtonTextStyle('PENDING')}>
              Chờ duyệt ({getStatusCount('PENDING')})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={getFilterButtonStyle('APPROVED')}
            onPress={() => setFilter('APPROVED')}
          >
            <Text style={getFilterButtonTextStyle('APPROVED')}>
              Đã duyệt ({getStatusCount('APPROVED')})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={getFilterButtonStyle('REJECTED')}
            onPress={() => setFilter('REJECTED')}
          >
            <Text style={getFilterButtonTextStyle('REJECTED')}>
              Bị từ chối ({getStatusCount('REJECTED')})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Danh sách yêu cầu */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#09a0a5" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : filteredRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>
              {filter === 'ALL'
                ? 'Bạn chưa có yêu cầu nào'
                : `Không có yêu cầu ${
                    filter === 'PENDING'
                      ? 'chờ duyệt'
                      : filter === 'APPROVED'
                      ? 'đã duyệt'
                      : 'bị từ chối'
                  }`}
            </Text>
            <Text style={styles.emptySubText}>
              Các yêu cầu nạp/rút tiền mặt sẽ hiển thị tại đây
            </Text>
          </View>
        ) : (
          <>
            {/* Thống kê nhanh */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {getStatusCount('PENDING')}
                </Text>
                <Text style={styles.statLabel}>Chờ duyệt</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {getStatusCount('APPROVED')}
                </Text>
                <Text style={styles.statLabel}>Đã duyệt</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {getStatusCount('REJECTED')}
                </Text>
                <Text style={styles.statLabel}>Bị từ chối</Text>
              </View>
            </View>

            {/* Danh sách yêu cầu */}
            {filteredRequests.map(request => (
              <RequestCard
                key={request.id}
                request={request}
                onPress={() => handleRequestPress(request.id)}
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* Ghi chú */}
      <View style={styles.noteContainer}>
        <Text style={styles.noteText}>
          💡 Yêu cầu sẽ được xử lý trong vòng 1-2 ngày làm việc
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeFilterButton: {
    backgroundColor: '#09a0a5',
    borderColor: '#09a0a5',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#09a0a5',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  noteContainer: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  noteText: {
    fontSize: 12,
    color: '#09a0a5',
    textAlign: 'center',
  },
});
