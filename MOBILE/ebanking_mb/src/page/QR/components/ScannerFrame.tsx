import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import QRColors from '../styles/colors';

const { width } = Dimensions.get('window');
const FRAME_SIZE = Math.min(width * 0.7, 280);

const ScannerFrame: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Corner brackets */}
      <View style={[styles.corner, styles.cornerTopLeft]} />
      <View style={[styles.corner, styles.cornerTopRight]} />
      <View style={[styles.corner, styles.cornerBottomLeft]} />
      <View style={[styles.corner, styles.cornerBottomRight]} />

      {/* Scanning line animation */}
      <View style={styles.scanLine} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: QRColors.scannerFrame,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: QRColors.scannerLine,
    shadowColor: QRColors.scannerLine,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});

export default ScannerFrame;
