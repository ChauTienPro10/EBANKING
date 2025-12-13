import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/color';

interface EKYCRequiredModalProps {
  visible: boolean;
  onClose: () => void;
  onGoToEKYC: () => void;
  amount: string;
}

const EKYCRequiredModal: React.FC<EKYCRequiredModalProps> = ({
  visible,
  onClose,
  onGoToEKYC,
  amount,
}) => {
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
            <Icon name="shield-checkmark" size={60} color={Colors.yellow} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Yêu cầu xác thực eKYC</Text>

          {/* Message */}
          <Text style={styles.message}>
            Giao dịch trên <Text style={styles.highlight}>10.000.000đ</Text> yêu
            cầu xác thực khuôn mặt.
          </Text>
          <Text style={styles.message}>
            Bạn cần hoàn thành <Text style={styles.highlight}>eKYC</Text> trước
            khi thực hiện giao dịch này.
          </Text>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Icon
              name="information-circle"
              size={20}
              color={Colors.main_bule}
            />
            <Text style={styles.infoText}>
              Vui lòng vào Hồ sơ {'>'} eKYC để hoàn tất xác thực
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Đóng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onGoToEKYC}
              activeOpacity={0.8}
            >
              <Icon name="arrow-forward" size={18} color="#FFF" />
              <Text style={styles.primaryButtonText}>Đi tới eKYC</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EKYCRequiredModal;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: width - 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  highlight: {
    fontWeight: '700',
    color: Colors.yellow,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 24,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.main_bule,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Colors.main_bule,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: Colors.main_bule,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
});
