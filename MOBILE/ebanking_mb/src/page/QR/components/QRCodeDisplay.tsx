import React from 'react';
import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import QRColors from '../styles/colors';

interface QRCodeDisplayProps {
  size?: number;
  showLogo?: boolean;
  data?: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  size = 200,
  showLogo = false,
  data,
}) => {
  // Default QR data nếu không có data truyền vào
  const qrValue = data || "";

  return (
    <View
      style={[styles.shadowContainer, { width: size + 16, height: size + 16 }]}
    >
      <View
        style={[styles.outerContainer, { width: size + 16, height: size + 16 }]}
      >
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={styles.qrWrapper}>
            <QRCode
              value={qrValue}
              size={size - 40}
              color="#000000"
              backgroundColor="#FFFFFF"
              quietZone={0}
              ecl="H"
            />
          </View>
          {showLogo && (
            <View style={styles.logoOverlay}>
              <View style={styles.logoBackground}>
                <View style={styles.logo} />
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  outerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  container: {
    backgroundColor: '#FAFBFC',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  qrWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 4,
    borderRadius: 4,
  },
  logoOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBackground: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 14,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: QRColors.primary,
  },
});

export default QRCodeDisplay;
