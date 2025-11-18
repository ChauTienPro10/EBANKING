import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Barcode from '@kichiyaki/react-native-barcode-generator';

interface BarcodeDisplayProps {
  data?: string;
}

const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({
  data = '1234567890123',
}) => {
  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <Barcode
          value={data}
          format="CODE128"
          width={2}
          height={80}
          lineColor="#000000"
          background="#FFFFFF"
          maxWidth={300}
        />
        <Text style={styles.barcodeText}>{data}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  barcodeText: {
    fontSize: 11,
    color: '#666666',
    marginTop: 8,
    letterSpacing: 2,
    fontWeight: '500',
  },
});

export default BarcodeDisplay;
