import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Header } from '../../components';
import Colors from '../../constants/color';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'PendingTransactionScreen'
>;

const PendingTransactionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { amount, content, date, receiverName, transactionId } =
    route.params || {};
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Pulse animation for loading indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Auto-navigate to Success screen after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace('TransactionSuccess', {
        amount: amount || '0',
        content: content || 'Chuyển tiền',
        date: date || new Date().toISOString(),
        receiver: receiverName || '-',
        transactionId: transactionId || Date.now().toString(), // Use real ID or fallback
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const formatDateTime = (date?: string | Date) => {
    const d = date ? new Date(date) : new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');

    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();

    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };

  const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );

  const Divider = () => <View style={styles.divider} />;

  return (
    <View style={styles.containerMaster}>
      <Header title="" showBackButton={false} />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Animated Loading Indicator */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <View style={styles.loadingCircle}>
            <ActivityIndicator size="large" color={Colors.main_bule} />
          </View>
        </Animated.View>

        {/* Title */}
        <Text style={styles.title}>Đang xử lý giao dịch</Text>
        <Text style={styles.subtitle}>Vui lòng chờ trong giây lát...</Text>

        {/* Transaction Details Card */}
        <View style={styles.card}>
          <DetailRow label="Số tiền" value={amount || '0'} />
          <Divider />
          <DetailRow label="Người nhận" value={receiverName || '-'} />
          <Divider />
          <DetailRow label="Thời gian" value={formatDateTime(date)} />
          <Divider />
          <DetailRow label="Nội dung" value={content || 'Chuyển tiền'} />
        </View>

        {/* Back Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            })
          }
        >
          <Text style={styles.buttonText}>Về trang chủ</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default PendingTransactionScreen;

const styles = StyleSheet.create({
  containerMaster: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  loadingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 40,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  detailLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  detailValue: {
    flex: 2,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  button: {
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  buttonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
});
