import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../../../constants/color';

interface ProgressHeaderProps {
  currentStep: 1 | 2 | 3;
}

const ProgressHeader: React.FC<ProgressHeaderProps> = ({ currentStep }) => (
  <View style={styles.progressHeader}>
    <View style={styles.progressContainer}>
      <View
        style={[styles.progressStep, currentStep >= 1 && styles.activeStep]}
      >
        <Text
          style={currentStep >= 1 ? styles.activeStepText : styles.stepText}
        >
          1
        </Text>
      </View>
      <View
        style={[styles.progressLine, currentStep >= 2 && styles.activeLine]}
      />
      <View
        style={[styles.progressStep, currentStep >= 2 && styles.activeStep]}
      >
        <Text
          style={currentStep >= 2 ? styles.activeStepText : styles.stepText}
        >
          2
        </Text>
      </View>
      <View
        style={[styles.progressLine, currentStep >= 3 && styles.activeLine]}
      />
      <View
        style={[styles.progressStep, currentStep >= 3 && styles.activeStep]}
      >
        <Text
          style={currentStep >= 3 ? styles.activeStepText : styles.stepText}
        >
          3
        </Text>
      </View>
    </View>
    <View style={styles.progressLabels}>
      <Text style={currentStep === 1 ? styles.activeLabel : styles.label}>
        Xác thực
      </Text>
      <Text style={currentStep === 2 ? styles.activeLabel : styles.label}>
        Quay video
      </Text>
      <Text style={currentStep === 3 ? styles.activeLabel : styles.label}>
        Kiểm tra
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  progressHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  progressStep: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStep: {
    backgroundColor: Colors.main_green,
  },
  progressLine: {
    width: 80,
    height: 2,
    backgroundColor: '#E0E0E0',
  },
  activeLine: {
    backgroundColor: Colors.main_green,
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B0B0B0',
  },
  activeStepText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  activeLabel: {
    fontSize: 12,
    color: Colors.main_bule,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
});

export default ProgressHeader;
