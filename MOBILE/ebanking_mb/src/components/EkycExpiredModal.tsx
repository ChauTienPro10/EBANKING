import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/color';

const { width } = Dimensions.get('window');

interface EkycExpiredModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigateToEkyc: () => void;
  reason: 'NOT_VERIFIED' | 'EXPIRED';
}

const EkycExpiredModal: React.FC<EkycExpiredModalProps> = ({
  visible,
  onClose,
  onNavigateToEkyc,
  reason,
}) => {
  const isExpired = reason === 'EXPIRED';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons
              name={isExpired ? 'time-outline' : 'shield-outline'}
              size={64}
              color={Colors.warning}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {isExpired ? 'eKYC đã hết hạn' : 'Chưa xác thực eKYC'}
          </Text>

          {/* Message */}
          <Text style={styles.message}>
            {isExpired
              ? 'Thông tin xác thực của bạn đã hết hạn. Vui lòng làm lại eKYC để tiếp tục sử dụng các tính năng giao dịch.'
              : 'Bạn cần hoàn tất xác thực eKYC để sử dụng tính năng này.'}
          </Text>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={Colors.info} />
            <Text style={styles.infoText}>
              {isExpired
                ? 'eKYC cần được làm mới mỗi năm để đảm bảo an toàn'
                : 'eKYC giúp bảo vệ tài khoản và giao dịch của bạn'}
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onNavigateToEkyc}
            >
              <Ionicons
                name="shield-checkmark"
                size={20}
                color={Colors.white}
              />
              <Text style={styles.primaryButtonText}>
                {isExpired ? 'Làm lại eKYC' : 'Xác thực ngay'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Để sau</Text>
            </TouchableOpacity>
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
    width: width * 0.85,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: Colors.grey3,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    marginLeft: 8,
    lineHeight: 18,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: Colors.main_bule,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.main_bule,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.grey2,
  },
  secondaryButtonText: {
    color: Colors.grey3,
    fontSize: 15,
    fontWeight: '500',
  },
});

export default EkycExpiredModal;
