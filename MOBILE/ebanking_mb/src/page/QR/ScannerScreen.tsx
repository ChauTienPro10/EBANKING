import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { QRScanScreen, QRReceiveScreen } from './screens';
import { TabButton } from './components';
import QRColors from './styles/colors';
import Colors from '../../constants/color';

/**
 * Main QR Scanner Screen with Tab Navigation
 * Handles QR Payment, QR Scan, and QR Receive functionality
 */
export default function ScannerScreen() {
  const [activeTab, setActiveTab] = useState(1);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={QRColors.primary} />

      {/* Main Content */}
      <View style={styles.content}>
        {activeTab === 0 && <QRScanScreen />}
        {activeTab === 1 && <QRScanScreen />}
        {activeTab === 2 && <QRReceiveScreen />}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {/* <TabButton
          iconName="camera"
          label="QR Thanh toán"
          active={activeTab === 0}
          onPress={() => setActiveTab(0)}
        /> */}
        <TabButton
          iconName="camera"
          label="Quét mã"
          active={activeTab === 1}
          onPress={() => setActiveTab(1)}
        />
        <TabButton
          iconName="gift"
          label="QR Nhận tiền"
          active={activeTab === 2}
          onPress={() => setActiveTab(2)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
});
