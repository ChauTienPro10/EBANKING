import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Colors from '../constants/color';

interface ReminderPopupProps {
  visible: boolean;
  message: string;
  onClose: () => void;
}

const ReminderPopup: React.FC<ReminderPopupProps> = ({ visible, message, onClose }) => {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      // Fade in khi hiển thị
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.popup, { opacity: fadeAnim }]}>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>Đóng</Text>
          </TouchableOpacity>
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
    width: 280,
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    backgroundColor: Colors.main_bule,
    borderRadius: 6,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
  },
});
