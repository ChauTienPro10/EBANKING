import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TransactionSuccess'>;


const TransactionSuccessScreen: React.FC<Props> = ({ navigation, route }) => {
  const { amount, transactionId, date } = route.params || {};

  return (
    <View style={styles.container}>
      {/* Icon thành công */}
      {/* <Image
        source={require('../assets/success.png')} // ảnh trong thư mục assets
        style={styles.image}
      /> */}

      {/* Tiêu đề */}
      <Text style={styles.title}>Giao dịch thành công!</Text>

      {/* Thông tin giao dịch */}
      <View style={styles.infoBox}>
        <Text style={styles.label}>Số tiền:</Text>
        <Text style={styles.value}>{amount || '₫500.000'}</Text>

        <Text style={styles.label}>Mã giao dịch:</Text>
        <Text style={styles.value}>{transactionId || 'TXN123456789'}</Text>

        <Text style={styles.label}>Thời gian:</Text>
        <Text style={styles.value}>
          {date || new Date().toLocaleString('vi-VN')}
        </Text>
      </View>

      {/* Nút quay lại hoặc về trang chủ */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.buttonText}>Về trang chủ</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TransactionSuccessScreen;

// 🎨 StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2ecc71',
    marginBottom: 20,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginTop: 6,
  },
  value: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  button: {
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
