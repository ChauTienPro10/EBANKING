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
      const isValidPin = await SavingsService.verifyPin(loginResponse.username, pin);
      
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
              placeholder="Nhập mã PIN"
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
            >
              {isProcessing ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
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
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    minWidth: 320,
    maxWidth: 380,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  pinContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  pinInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    textAlign: 'center',
    width: 200,
    letterSpacing: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#1976D2',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});