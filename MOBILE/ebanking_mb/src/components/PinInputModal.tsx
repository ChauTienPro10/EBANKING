import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { RootState } from '../store';
import { SavingsService } from '../services/SavingsService';
import Colors from '../constants/color';

interface PinInputModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: (pin: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function PinInputModal({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
}: PinInputModalProps) {
  const [pin, setPin] = useState('');
  const [verifying, setVerifying] = useState(false);
  const { loginResponse } = useSelector((state: RootState) => state.app);

  const handleConfirm = async () => {
    if (pin.length < 4) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Mã PIN phải có ít nhất 4 chữ số',
      });
      return;
    }

    if (!loginResponse?.username) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không tìm thấy thông tin đăng nhập',
      });
      return;
    }

    setVerifying(true);
    try {
      const isValidPin = await SavingsService.verifyPin(
        loginResponse.username,
        pin,
      );

      if (isValidPin) {
        onConfirm(pin);
        setPin(''); // Clear PIN after successful verification
      } else {
        Toast.show({
          type: 'error',
          text1: 'Mã PIN không đúng',
          text2: 'Vui lòng kiểm tra lại mã PIN của bạn',
        });
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể xác thực mã PIN. Vui lòng thử lại',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleCancel = () => {
    setPin('');
    onCancel();
  };

  const isProcessing = verifying || loading;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.pinContainer}>
            <TextInput
              style={styles.pinInput}
              value={pin}
              onChangeText={setPin}
              placeholder="••••••"
              placeholderTextColor={Colors.textSecondary}
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
              autoFocus
              editable={!isProcessing}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={isProcessing}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                (pin.length < 4 || isProcessing) && styles.disabledButton,
              ]}
              onPress={handleConfirm}
              disabled={pin.length < 4 || isProcessing}
              activeOpacity={0.8}
            >
              {isProcessing ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.confirmText}>
                  {verifying ? 'Đang xác thực...' : 'Xác nhận'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  pinContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  pinInput: {
    borderWidth: 2,
    borderColor: Colors.main_bule,
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
    letterSpacing: 8,
    color: Colors.textPrimary,
    backgroundColor: `${Colors.main_bule}08`,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  confirmButton: {
    backgroundColor: Colors.main_bule,
    shadowColor: Colors.main_bule,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: Colors.textSecondary,
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
