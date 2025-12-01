import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Colors from '../../../../constants/color';
import ProgressHeader from '../shared/ProgressHeader';

interface CompleteViewProps {
  onContinue: () => void;
  onRetake: () => void;
}

const CompleteView: React.FC<CompleteViewProps> = ({
  onContinue,
  onRetake,
}) => {
  return (
    <SafeAreaView style={styles.whiteContainer}>
      <ProgressHeader currentStep={2} />
      <View style={styles.completeContainer}>
        <View style={styles.successIcon}>
          <Text style={styles.successIconText}>✓</Text>
        </View>
        <Text style={styles.completeTitle}>Đã quay xong video</Text>
        <Text style={styles.completeSubtitle}>
          Video đã được ghi lại thành công
        </Text>
      </View>
      <View style={styles.completeControls}>
        <TouchableOpacity style={styles.primaryButton} onPress={onContinue}>
          <Text style={styles.primaryButtonText}>Tiếp tục</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={onRetake}>
          <Text style={styles.secondaryButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  whiteContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.main_green,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIconText: {
    fontSize: 48,
    color: Colors.white,
    fontWeight: '700',
  },
  completeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  completeSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  completeControls: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.main_bule,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: Colors.main_bule,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CompleteView;
