// QRScanner.tsx
import React from 'react';
import { View, Text, StyleSheet, Linking, Alert } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';

interface QRScannerProps {
  onScanSuccess?: (value: string) => void; // callback nếu muốn truyền dữ liệu ra ngoài
}

// Định nghĩa type cho event của QRCodeScanner
interface QRCodeEvent {
  data: string;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess }) => {
  const handleSuccess = (e: QRCodeEvent) => {
    const qrValue: string = e.data;

    // Gọi callback nếu có
    if (onScanSuccess) {
      onScanSuccess(qrValue);
    }

    // Hiển thị thông báo
    Alert.alert('QR Code đã quét', qrValue);

    // Nếu là link, mở trình duyệt
    if (qrValue.startsWith('http')) {
      Linking.openURL(qrValue).catch(err => console.error('Không mở được URL', err));
    }
  };

  return (
    <View style={styles.container}>
      <QRCodeScanner
        onRead={handleSuccess}
        topContent={<Text style={styles.text}>Hướng camera vào QR code</Text>}
        bottomContent={<Text style={styles.text}>QR code sẽ tự động quét</Text>}
        showMarker={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  text: { fontSize: 16, textAlign: 'center', margin: 10 },
});

export default QRScanner;
