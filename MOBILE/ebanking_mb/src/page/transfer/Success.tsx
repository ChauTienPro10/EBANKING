import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Header } from '../../components';
import Colors from '../../constants/color';
import { CheckIcon } from '../../components/icon';

type Props = NativeStackScreenProps<RootStackParamList, 'TransactionSuccess'>;

const TransactionSuccessScreen: React.FC<Props> = ({ navigation, route }) => {
  const { amount, transactionId, date, receiver, content } = route.params!;

  // Format amount with VND currency
  const formatAmount = (amt: string) => {
    const numericAmount = amt.replace(/[^\d]/g, '');
    const formatted = parseInt(numericAmount).toLocaleString('vi-VN');
    return `${formatted} ₫`;
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format time
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Mask transaction ID (show last 4 digits)
  const maskTransactionId = (id: string | number) => {
    const idStr = String(id); // Convert to string first
    if (!idStr || idStr.length <= 4) return idStr;
    return `**** **** ${idStr.slice(-4)}`;
  };

  return (
    <View style={styles.containerMaster}>
      <Header title="Giao dịch" showBackButton={false} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Card with Icon, Title, Subtitle, and Details */}
        <View style={styles.mainCard}>
          {/* Success Icon */}
          <View style={styles.iconWrapper}>
            <View style={styles.iconOuterCircle}>
              <View style={styles.iconInnerCircle}>
                <CheckIcon size={36} color={Colors.white} />
              </View>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Giao dịch thành công</Text>

          {/* Details Section */}
          <View style={styles.detailsSection}>
            <Text style={styles.detailsHeader}>CHI TIẾT</Text>
            <DetailRow
              label="Tổng số tiền"
              value={formatAmount(amount || '0')}
              highlight
            />
            <DetailRow
              label="Mã giao dịch"
              value={maskTransactionId(transactionId || '-')}
            />
            <DetailRow
              label="Thời gian"
              value={formatTime(date || new Date().toISOString())}
            />
            <DetailRow
              label="Ngày"
              value={formatDate(date || new Date().toISOString())}
            />
            <DetailRow label="Phương thức" value="Chuyển khoản nội bộ" />
            <DetailRow label="Người nhận" value={receiver || '-'} />
            <DetailRow
              label="Nội dung"
              value={content || 'Chuyển tiền'}
              isLast
            />
          </View>
        </View>

        {/* Done Button - Outside Card */}
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.doneButtonText}>Hoàn tất</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const DetailRow = ({
  label,
  value,
  isLast = false,
  highlight = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
  highlight?: boolean;
}) => (
  <View style={[styles.detailRow, isLast && styles.detailRowLast]}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text
      style={[styles.detailValue, highlight && styles.detailValueHighlight]}
    >
      {value}
    </Text>
  </View>
);

export default TransactionSuccessScreen;

const styles = StyleSheet.create({
  containerMaster: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  mainCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconOuterCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: Colors.success + '20', // 20% opacity
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInnerCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  detailsSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 20,
  },
  detailsHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'right',
    flex: 1,
  },
  detailValueHighlight: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.main_bule,
  },
  doneButton: {
    backgroundColor: Colors.main_bule,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.main_bule,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  doneButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
});
