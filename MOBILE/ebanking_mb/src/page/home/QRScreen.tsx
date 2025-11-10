import React from 'react';
import { SafeAreaView } from 'react-native';
import QRScanScreen from '../../components/QRScanScreen'; // Đường dẫn tới file bạn gửi ở trên

const QRSCreen: React.FC = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QRScanScreen />
    </SafeAreaView>
  );
};

export default QRSCreen;