import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '../constants/color';
import PinInput from '../components/PinInput';

interface ConfirmTransferModalProps {
  visible: boolean;
  data: Record<string, string>;
  onConfirm: (pin: string) => void;
  onCancel: () => void;
}

const ConfirmTransferModal: React.FC<ConfirmTransferModalProps> = ({
  visible,
  data,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [pinAuth, setPinAuth] = useState(false);

  const handleComplete = (pin: string) => {
    onConfirm(pin);
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onCancel}
    >
      {pinAuth ? (
        <View style={styles.screenPIN}>
          <Text style={styles.titlePIN}>
            {t('transfer.confirm.enter_pin_title')}
          </Text>
          <View>
            <PinInput
              length={4}
              onComplete={handleComplete}
              create={false}
              hasBiometric={true}
            />
          </View>
        </View>
      ) : (
        <View style={styles.overlay}>
          <View style={styles.container}>
            <Text style={styles.title}>{t('transfer.confirm.title')}</Text>

            <ScrollView
              style={styles.dataContainer}
              showsVerticalScrollIndicator={false}
            >
              {Object.entries(data).map(([key, value], index) => (
                <View key={key}>
                  <View style={styles.row}>
                    <Text style={styles.label}>{key}</Text>
                    <Text style={styles.value} numberOfLines={2}>
                      {value}
                    </Text>
                  </View>
                  {index < Object.entries(data).length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
            </ScrollView>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelButtonText}>
                  {t('transfer.confirm.cancel_button')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => setPinAuth(true)}
              >
                <Text style={styles.confirmButtonText}>
                  {t('transfer.confirm.confirm_button')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </Modal>
  );
};

export default ConfirmTransferModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
  },
  dataContainer: {
    maxHeight: 300,
    marginBottom: 24,
  },
  row: {
    paddingVertical: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 6,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: Colors.main_bule,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  screenPIN: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 20,
  },
  titlePIN: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
});
