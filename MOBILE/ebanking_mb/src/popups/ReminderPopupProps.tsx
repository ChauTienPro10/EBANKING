import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated, BackHandler } from 'react-native';
import Colors from '../constants/color';
import { useTranslation } from 'react-i18next';

interface ReminderPopupProps {
  visible: boolean;
  message: string;
  onClose: () => void;
  confirmLabel?: string;
}

const ReminderPopup: React.FC<ReminderPopupProps> = ({ visible, message, onClose, confirmLabel }) => {
  const fadeAnim = new Animated.Value(0);
  const { t } = useTranslation();

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleExitApp = () => {
    BackHandler.exitApp();
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.popup, { opacity: fadeAnim }]}>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={[styles.button, styles.closeButton]}>
              <Text style={styles.buttonText}>{confirmLabel || t('common.close')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleExitApp} style={[styles.button, styles.exitButton]}>
              <Text style={styles.buttonText}>{t('common.exit_app')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default ReminderPopup;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: 300,
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  button: {
    borderRadius: 6,
    paddingHorizontal: 15,
    paddingVertical: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: Colors.main_bule,
  },
  exitButton: {
    backgroundColor: Colors.grey1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '300',
  },
});
