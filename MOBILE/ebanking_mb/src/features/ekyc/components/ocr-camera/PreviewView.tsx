import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '../../../../constants/color';
import ProgressHeader from '../shared/ProgressHeader';

interface PreviewViewProps {
  previewImage: string;
  captureState: 'front' | 'back';
  onConfirm: () => void;
  onRetake: () => void;
}

const PreviewView: React.FC<PreviewViewProps> = ({
  previewImage,
  captureState,
  onConfirm,
  onRetake,
}) => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <ProgressHeader currentStep={1} />
      <Image source={{ uri: previewImage }} style={styles.preview} />
      <View style={styles.previewControls}>
        <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
          <Text style={styles.buttonText}>
            {t('ekyc_flow.preview.confirm_button')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.retakeButton} onPress={onRetake}>
          <Text style={[styles.buttonText, { color: Colors.textSecondary }]}>
            {t('ekyc_flow.preview.retake_button')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  preview: {
    flex: 1,
    resizeMode: 'contain',
    backgroundColor: Colors.black,
  },
  previewControls: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    gap: 12,
  },
  confirmButton: {
    paddingVertical: 16,
    backgroundColor: Colors.main_bule,
    borderRadius: 12,
    shadowColor: Colors.main_bule,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retakeButton: {
    paddingVertical: 16,
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.textSecondary,
    marginBottom: 12,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default PreviewView;
