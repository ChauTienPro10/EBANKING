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
import { Header } from '../../components';
import Colors from '../../constants/color';

type Props = NativeStackScreenProps<RootStackParamList, 'TransactionSuccess'>;

const TransactionSuccessScreen: React.FC<Props> = ({ navigation, route }) => {
  const { amount, transactionId, date, receiver, content } = route.params!;

  return (
    <View style={styles.containerMaster}>
      <Header title="Giao dịch" />
      <View style={styles.container}>
        {/* <Image
          source={require('../../assets/success.png')} // ✅ bạn cần thêm ảnh success.png vào thư mục assets
          style={styles.image}
        /> */}
        <Text style={styles.title}>Giao dịch thành công!</Text>

        <View style={styles.infoBox}>
          <InfoRow label="Số tiền" value={amount || '₫500.000'} />
          <InfoRow label="Mã giao dịch" value={transactionId || 'TXN123456789'} />
          <InfoRow label="Thời gian" value={date || new Date().toLocaleString('vi-VN')} />
          <InfoRow label="Người nhận" value={receiver} />
          <InfoRow label="Nội dung" value={content} />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.buttonText}>Về trang chủ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

export default TransactionSuccessScreen;


const styles = StyleSheet.create({
  containerMaster: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  container: {
    flex: 1,
    paddingVertical: 40,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
    tintColor: '#2ecc71',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2ecc71',
    marginBottom: 30,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  row: {
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    color: '#555',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginTop: 2,
  },
  button: {
    backgroundColor: Colors.main_bule,
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
