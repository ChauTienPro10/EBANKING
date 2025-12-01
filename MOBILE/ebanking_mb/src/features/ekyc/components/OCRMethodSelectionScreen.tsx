/**
 * OCR Method Selection Screen
 * Cho phép người dùng chọn phương thức quét CCCD: Chụp ảnh hoặc Tải ảnh lên
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../../constants/color';

const OCRMethodSelectionScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleCameraOption = () => {
    (navigation as any).navigate('OCRCamera');
  };

  const handleUploadOption = () => {
    // TODO: Implement image picker for upload
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header với progress indicator */}
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressStep, styles.activeStep]}>
            <Text style={styles.activeStepText}>1</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <Text style={styles.stepText}>2</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <Text style={styles.stepText}>3</Text>
          </View>
        </View>

        <View style={styles.progressLabels}>
          <Text style={styles.activeLabel}>Xác thực</Text>
          <Text style={styles.label}>Quay video</Text>
          <Text style={styles.label}>Kiểm tra</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Vui lòng chọn nội dung</Text>

        {/* Camera Option */}
        <TouchableOpacity
          style={styles.optionButton}
          onPress={handleCameraOption}
          activeOpacity={0.8}
        >
          <View style={styles.iconContainer}>
            <Icon name="camera" size={32} color={Colors.main_bule} />
          </View>
          <Text style={styles.optionText}>Chụp ảnh</Text>
        </TouchableOpacity>

        {/* Upload Option */}
        <TouchableOpacity
          style={styles.optionButton}
          onPress={handleUploadOption}
          activeOpacity={0.8}
        >
          <View style={styles.iconContainer}>
            <Icon name="upload" size={32} color={Colors.main_bule} />
          </View>
          <Text style={styles.optionText}>Tải ảnh lên</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
    backgroundColor: '#FAFAFA',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  progressStep: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  activeStep: {
    backgroundColor: Colors.main_green,
    shadowColor: Colors.main_green,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  progressLine: {
    width: 70,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 0,
  },
  stepText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B0B0B0',
  },
  activeStepText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    marginTop: 2,
  },
  label: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  activeLabel: {
    fontSize: 14,
    color: Colors.main_bule,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 28,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.main_bule,
    marginBottom: 24,
    letterSpacing: 0.3,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: Colors.main_bule,
    borderRadius: 16,
    marginBottom: 24,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.main_bule,
    marginLeft: 24,
    letterSpacing: 0.4,
  },
  iconContainer: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default OCRMethodSelectionScreen;
