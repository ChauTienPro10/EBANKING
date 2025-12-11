import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { CheckIcon, ErrorIcon } from '../../components/icon';
import Colors from '../../constants/color';

interface FaceAuthResultModalProps {
  visible: boolean;
  success: boolean;
  onContinue: () => void;
  onRetry?: () => void;
  onCancel?: () => void;
  message?: string;
}

const FaceAuthResultModal: React.FC<FaceAuthResultModalProps> = ({
  visible,
  success,
  onContinue,
  onRetry,
  onCancel,
  message,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={success ? onContinue : onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Title */}
          <Text
            style={[
              styles.title,
              success ? styles.successTitle : styles.errorTitle,
            ]}
          >
            {success ? 'Xác Thực Thành Công' : 'Xác Thực Thất Bại'}
          </Text>
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              success ? styles.successIconBg : styles.errorIconBg,
            ]}
          >
            {success ? (
              <CheckIcon size={40} color={Colors.white} />
            ) : (
              <ErrorIcon size={40} color={Colors.white} />
            )}
          </View>

          {/* Message (optional) */}
          {message && <Text style={styles.message}>{message}</Text>}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {success ? (
              <TouchableOpacity
                style={[styles.button, styles.successButton]}
                onPress={onContinue}
              >
                <Text style={styles.buttonText}>Tiếp tục</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onCancel}
                >
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>
                    Hủy
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.retryButton]}
                  onPress={onRetry}
                >
                  <Text style={styles.buttonText}>Thử lại</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: Dimensions.get('window').width * 0.85,
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIconBg: {
    backgroundColor: Colors.success,
  },
  errorIconBg: {
    backgroundColor: Colors.error,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  successTitle: {
    color: Colors.success,
  },
  errorTitle: {
    color: Colors.error,
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successButton: {
    backgroundColor: Colors.main_bule,
  },
  retryButton: {
    backgroundColor: Colors.main_bule,
  },
  cancelButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  cancelButtonText: {
    color: Colors.textPrimary,
  },
});

export default FaceAuthResultModal;
