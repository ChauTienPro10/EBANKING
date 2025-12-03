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
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../../constants/color';
import ProgressHeader from './shared/ProgressHeader';

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
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
        hidden={false}
      />
      <ProgressHeader currentStep={1} />

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
