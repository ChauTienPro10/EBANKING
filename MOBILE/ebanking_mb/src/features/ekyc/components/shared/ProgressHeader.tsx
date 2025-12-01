import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../../../constants/color';

interface ProgressHeaderProps {
  currentStep: 1 | 2 | 3;
}

const ProgressHeader: React.FC<ProgressHeaderProps> = ({ currentStep }) => (
  <View style={styles.progressHeader}>
    <View style={styles.progressContainer}>
      <View style={styles.stepWrapper}>
        <View
          style={[styles.progressStep, currentStep >= 1 && styles.activeStep]}
        >
          <Text
            style={currentStep >= 1 ? styles.activeStepText : styles.stepText}
          >
            1
          </Text>
        </View>
        <Text style={currentStep === 1 ? styles.activeLabel : styles.label}>
          Xác thực
        </Text>
      </View>

      <View
        style={[styles.progressLine, currentStep >= 2 && styles.activeLine]}
      />

      <View style={styles.stepWrapper}>
        <View
          style={[styles.progressStep, currentStep >= 2 && styles.activeStep]}
        >
          <Text
            style={currentStep >= 2 ? styles.activeStepText : styles.stepText}
          >
            2
          </Text>
        </View>
        <Text style={currentStep === 2 ? styles.activeLabel : styles.label}>
          Quay video
        </Text>
      </View>

      <View
        style={[styles.progressLine, currentStep >= 3 && styles.activeLine]}
      />

      <View style={styles.stepWrapper}>
        <View
          style={[styles.progressStep, currentStep >= 3 && styles.activeStep]}
        >
          <Text
            style={currentStep >= 3 ? styles.activeStepText : styles.stepText}
          >
            3
          </Text>
        </View>
        <Text style={currentStep === 3 ? styles.activeLabel : styles.label}>
          Kiểm tra
        </Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  progressHeader: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stepWrapper: {
    alignItems: 'center',
    gap: 8,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeStep: {
    backgroundColor: Colors.main_green,
    borderColor: Colors.main_green,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
    marginTop: 15,
  },
  activeLine: {
    backgroundColor: Colors.main_green,
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  activeStepText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  label: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeLabel: {
    fontSize: 11,
    color: Colors.main_green,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default ProgressHeader;
