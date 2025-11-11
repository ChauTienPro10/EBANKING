/**
 * eKYC Loading Overlay Component
 */

import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import GText from '../../../components/GText';
import Colors from '../../../constants/color';
import { EKYCStep } from '../types';

interface EKYCLoadingOverlayProps {
  visible: boolean;
  currentStep: EKYCStep;
}

const EKYCLoadingOverlay: React.FC<EKYCLoadingOverlayProps> = ({
  visible,
  currentStep,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color={Colors.main_bule} />
      <GText type="system_16" color={Colors.textPrimary} style={styles.text}>
        {currentStep}
      </GText>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  text: {
    marginTop: 16,
    textAlign: 'center',
  },
});

export default EKYCLoadingOverlay;
