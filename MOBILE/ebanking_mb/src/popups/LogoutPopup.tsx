// components/LogoutConfirmPopup.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../constants/color';
import { useTranslation } from 'react-i18next';

interface Props {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const LogoutConfirmPopup = ({ visible, onCancel, onConfirm }: Props) => {

  const { t } = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <Text style={styles.title}>{t('logout_popup.are_you_sure_logout')}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>{t('logout_popup.cancel')}</Text>
            </TouchableOpacity>
            <View style={{ width: 100 }} />
            <TouchableOpacity onPress={onConfirm} style={styles.logoutButton}>
              <Text style={styles.logoutText}>{t('logout_popup.logout')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LogoutConfirmPopup;

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center',
  },
  popup: {
    backgroundColor: 'white', width: '80%', padding: 20, borderRadius: 10, alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelButton: { backgroundColor: Colors.white, padding: 10, borderRadius: 5, marginRight: 10 },
  cancelText: { color: Colors.black, fontWeight: 'bold' },
  logoutButton: { backgroundColor: Colors.main_bule, padding: 10, borderRadius: 5 },
  logoutText: { color: 'white', fontWeight: 'bold' },
});
