import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import Colors from '../../../../constants/color';
import ProgressHeader from '../shared/ProgressHeader';

interface UploadPromptViewProps {
  side: 'front' | 'back';
  frontImage: string | null;
  backImage: string | null;
  onUpload: () => void;
  onContinue?: () => void;
  onConfirm?: () => void;
}

const UploadPromptView: React.FC<UploadPromptViewProps> = ({
  side,
  frontImage,
  backImage,
  onUpload,
  onContinue,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const currentImage = side === 'front' ? frontImage : backImage;
  const hasImage = !!currentImage;
  const hasBothImages = !!(frontImage && backImage);

  const handleContinuePress = () => {
    if (side === 'front') {
      if (!frontImage) {
        Toast.show({
          type: 'error',
          text1: t('ekyc_flow.upload.front_instruction'),
          position: 'top',
          visibilityTime: 3000,
          topOffset: 40,
        });
        return;
      }
      onContinue?.();
    } else {
      // Back side
      if (!backImage) {
        Toast.show({
          type: 'error',
          text1: t('ekyc_flow.upload.back_instruction'),
          position: 'top',
          visibilityTime: 3000,
          topOffset: 40,
        });
        return;
      }
      // When back image is selected, proceed to confirm
      onConfirm?.();
    }
  };

  const handleConfirmPress = () => {
    if (!hasBothImages) {
      Toast.show({
        type: 'error',
        text1:
          t('ekyc_flow.upload.front_instruction') +
          ' ' +
          t('ekyc_flow.upload.back_instruction'),
        position: 'top',
        visibilityTime: 3000,
        topOffset: 40,
      });
      return;
    }
    onConfirm?.();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProgressHeader currentStep={1} />

      <View style={styles.content}>
        {/* Upload/Preview Area */}
        <TouchableOpacity
          style={[styles.uploadArea, hasImage && styles.uploadAreaWithImage]}
          onPress={onUpload}
          activeOpacity={0.7}
        >
          {hasImage ? (
            <Image source={{ uri: currentImage }} style={styles.previewImage} />
          ) : (
            <>
              <Icon name="cloud-upload-outline" size={80} color="#9CA3AF" />
              <Text style={styles.uploadText}>
                {t('ekyc_flow.upload.upload_button')}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Instructions */}
        <View style={styles.instructionContainer}>
          <View style={styles.mainInstructionContainer}>
            <Text style={styles.instructionTitle}>CMND/CCCD</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {side === 'front'
                  ? t('ekyc_flow.complete.front_label')
                  : t('ekyc_flow.complete.back_label')}
              </Text>
            </View>
          </View>
          <Text style={styles.instructionSubtitle}>
            {side === 'front'
              ? t('ekyc_flow.upload.front_title')
              : t('ekyc_flow.upload.back_title')}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {/* Show "Tiếp Theo" for front image */}
          {side === 'front' && !hasBothImages && (
            <TouchableOpacity
              style={[
                styles.continueButton,
                !frontImage && styles.continueButtonDisabled,
              ]}
              onPress={handleContinuePress}
            >
              <Text style={styles.continueButtonText}>
                {t('ekyc_flow.upload.continue_button')}
              </Text>
            </TouchableOpacity>
          )}

          {/* Show "Tiếp Theo" for back image */}
          {side === 'back' && !hasBothImages && (
            <TouchableOpacity
              style={[
                styles.continueButton,
                !backImage && styles.continueButtonDisabled,
              ]}
              onPress={handleContinuePress}
            >
              <Text style={styles.continueButtonText}>
                {t('ekyc_flow.upload.continue_button')}
              </Text>
            </TouchableOpacity>
          )}

          {/* Show "Xác nhận" when both images are selected */}
          {hasBothImages && (
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmPress}
            >
              <Text style={styles.confirmButtonText}>
                {t('ekyc_flow.upload.confirm_button')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: 'space-between',
    paddingBottom: 30,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    marginTop: 20,
    overflow: 'hidden',
  },
  uploadAreaWithImage: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'solid',
    borderRadius: 16,
    backgroundColor: '#000000',
    paddingVertical: 0,
    minHeight: 240,
  },
  uploadText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    fontWeight: '500',
  },
  previewImage: {
    width: '100%',
    height: 240,
    resizeMode: 'contain',
  },
  instructionContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainInstructionContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  badge: {
    backgroundColor: '#FB923C',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  instructionSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
  },
  buttonContainer: {
    gap: 12,
  },
  continueButton: {
    backgroundColor: Colors.main_bule,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.main_bule,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  confirmButton: {
    backgroundColor: Colors.main_bule,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.main_bule,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default UploadPromptView;
