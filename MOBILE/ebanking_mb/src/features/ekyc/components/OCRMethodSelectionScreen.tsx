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
  Alert,
  Platform,
  PermissionsAndroid,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import ImageCropper from 'react-native-image-crop-picker';
import { useTranslation } from 'react-i18next';
import Colors from '../../../constants/color';
import ProgressHeader from './shared/ProgressHeader';
import PreviewView from './ocr-camera/PreviewView';
import CompleteView from './ocr-camera/CompleteView';
import UploadPromptView from './ocr-camera/UploadPromptView';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GUIDE_WIDTH = SCREEN_WIDTH * 0.9;
const GUIDE_HEIGHT = GUIDE_WIDTH / 1.586;

type UploadState = 'selection' | 'uploadPrompt' | 'front' | 'back' | 'complete';

const OCRMethodSelectionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  // State management for upload flow
  const [uploadState, setUploadState] =
    React.useState<UploadState>('selection');
  const [frontImage, setFrontImage] = React.useState<string | null>(null);
  const [backImage, setBackImage] = React.useState<string | null>(null);
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);

  const handleCameraOption = () => {
    (navigation as any).navigate('OCRCamera');
  };

  /**
   * Request storage permission on Android
   * Android 13+ (API 33+) uses READ_MEDIA_IMAGES instead of READ_EXTERNAL_STORAGE
   */
  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      // Android 13+ (API 33+) uses READ_MEDIA_IMAGES
      const apiLevel = Platform.Version;

      let permission;
      if (apiLevel >= 33) {
        permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
      } else {
        permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      }

      const granted = await PermissionsAndroid.request(permission, {
        title: t('ekyc_flow.method_selection.permission_title'),
        message: t('ekyc_flow.method_selection.permission_message'),
        buttonNeutral: t('ekyc_flow.method_selection.permission_neutral'),
        buttonNegative: t('ekyc_flow.method_selection.permission_negative'),
        buttonPositive: t('ekyc_flow.method_selection.permission_positive'),
      });

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error('[Upload] Permission error:', err);
      return false;
    }
  };

  /**
   * Pick and crop a single image
   * Step 1: Launch image library to select image
   * Step 2: Crop the selected image
   */
  const pickAndCropImage = async (
    side: 'front' | 'back',
  ): Promise<string | null> => {
    try {
      // Step 1: Select image from library
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
        selectionLimit: 1,
      });

      // User cancelled
      if (result.didCancel) {
        return null;
      }

      // Error occurred
      if (result.errorCode) {
        console.error('[Upload] Image library error:', result.errorMessage);
        Alert.alert(
          t('ekyc_flow.method_selection.error_title'),
          t('ekyc_flow.method_selection.error_library'),
        );
        return null;
      }

      // No assets selected
      if (!result.assets || result.assets.length === 0) {
        return null;
      }

      const selectedImage = result.assets[0];
      if (!selectedImage.uri) {
        console.error('[Upload] No URI in selected image');
        Alert.alert(
          t('ekyc_flow.method_selection.error_title'),
          t('ekyc_flow.method_selection.error_read_image'),
        );
        return null;
      }

      // Step 2: Crop the selected image
      const croppedImage = await ImageCropper.openCropper({
        path: selectedImage.uri,
        width: Math.round(GUIDE_WIDTH * 3),
        height: Math.round(GUIDE_HEIGHT * 3),
        cropping: true,
        freeStyleCropEnabled: true,
        cropperCircleOverlay: false,
        compressImageQuality: 0.95,
        mediaType: 'photo',
        includeBase64: false,
        cropperToolbarTitle:
          side === 'front'
            ? t('ekyc_flow.camera.crop_front_title')
            : t('ekyc_flow.camera.crop_back_title'),
        cropperChooseText: t('ekyc_flow.camera.crop_done'),
        cropperCancelText: t('ekyc_flow.camera.crop_cancel'),
      });

      return croppedImage.path;
    } catch (error: any) {
      // User cancelled cropping
      if (error.message && error.message.includes('User cancelled')) {
        return null;
      }

      // Real error
      console.error('[Upload] Image picker/cropper error:', error);
      Alert.alert(
        t('ekyc_flow.method_selection.error_title'),
        t('ekyc_flow.method_selection.error_process_image'),
      );
      return null;
    }
  };

  /**
   * Handle upload option - show upload prompt screen
   */
  const handleUploadOption = () => {
    setUploadState('uploadPrompt');
  };

  /**
   * Handle upload from prompt screen
   */
  const handleUploadFromPrompt = async () => {
    // Determine which side we're uploading
    const side = uploadState === 'uploadPrompt' ? 'front' : 'back';
    setUploadState(side);

    // Request permission first
    const hasPermission = await requestStoragePermission();

    if (!hasPermission) {
      Alert.alert(
        t('ekyc_flow.method_selection.permission_required_title'),
        t('ekyc_flow.method_selection.permission_required_message'),
        [{ text: t('ekyc_flow.method_selection.permission_positive') }],
      );
      // Stay on upload prompt
      setUploadState(side === 'front' ? 'uploadPrompt' : 'back');
      return;
    }

    // Pick and crop image
    const image = await pickAndCropImage(side);

    if (image) {
      // Save image directly to state for inline preview
      if (side === 'front') {
        setFrontImage(image);
        // Stay on upload prompt for front
        setUploadState('uploadPrompt');
      } else {
        setBackImage(image);
        // Stay on back upload prompt
        setUploadState('back');
      }
    } else {
      // User cancelled, stay on upload prompt
      setUploadState(side === 'front' ? 'uploadPrompt' : 'back');
    }
  };

  /**
   * Confirm the previewed image
   */
  const confirmPhoto = () => {
    if (!previewImage) return;

    if (uploadState === 'front') {
      setFrontImage(previewImage);
      setPreviewImage(null);
      // Show upload prompt for back image
      setUploadState('back');
    } else if (uploadState === 'back') {
      setBackImage(previewImage);
      setPreviewImage(null);
      setUploadState('complete');
    }
  };

  /**
   * Handle continue button (front image done, move to back)
   */
  const handleContinue = () => {
    setUploadState('back');
  };

  /**
   * Handle confirm button (both images done, go to complete view)
   */
  const handleConfirm = () => {
    setUploadState('complete');
  };

  /**
   * Retake the current photo
   */
  const retakePhoto = async () => {
    const currentSide = uploadState === 'front' ? 'front' : 'back';
    setPreviewImage(null);

    const image = await pickAndCropImage(currentSide);
    if (image) {
      setPreviewImage(image);
    } else {
      // User cancelled, go back to upload prompt
      setUploadState(currentSide === 'front' ? 'uploadPrompt' : 'back');
    }
  };

  /**
   * Navigate to Liveness with both images
   */
  const navigateToLiveness = () => {
    if (frontImage && backImage) {
      (navigation as any).navigate('LivenessCamera', {
        frontImage,
        backImage,
      });
    }
  };

  /**
   * Retake all photos
   */
  const retakeAll = () => {
    setUploadState('selection');
    setFrontImage(null);
    setBackImage(null);
    setPreviewImage(null);
  };

  // Show upload prompt with inline preview
  if (
    uploadState === 'uploadPrompt' ||
    uploadState === 'front' ||
    uploadState === 'back'
  ) {
    return (
      <UploadPromptView
        side={
          uploadState === 'uploadPrompt' || uploadState === 'front'
            ? 'front'
            : 'back'
        }
        frontImage={frontImage}
        backImage={backImage}
        onUpload={handleUploadFromPrompt}
        onContinue={handleContinue}
        onConfirm={handleConfirm}
      />
    );
  }

  // Show complete view when both images are selected
  if (uploadState === 'complete' && frontImage && backImage) {
    return (
      <CompleteView
        frontImage={frontImage}
        backImage={backImage}
        onContinue={navigateToLiveness}
        onRetake={retakeAll}
      />
    );
  }

  // Show selection screen
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
        <Text style={styles.title}>
          {t('ekyc_flow.method_selection.title')}
        </Text>

        {/* Camera Option */}
        <TouchableOpacity
          style={styles.optionButton}
          onPress={handleCameraOption}
          activeOpacity={0.8}
          disabled={uploadState !== 'selection'}
        >
          <View style={styles.iconContainer}>
            <Icon name="camera" size={32} color={Colors.main_bule} />
          </View>
          <Text style={styles.optionText}>
            {t('ekyc_flow.method_selection.camera_option')}
          </Text>
        </TouchableOpacity>

        {/* Upload Option */}
        <TouchableOpacity
          style={styles.optionButton}
          onPress={handleUploadOption}
          activeOpacity={0.8}
          disabled={uploadState !== 'selection'}
        >
          <View style={styles.iconContainer}>
            <Icon name="upload" size={32} color={Colors.main_bule} />
          </View>
          <Text style={styles.optionText}>
            {t('ekyc_flow.method_selection.upload_option')}
          </Text>
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
