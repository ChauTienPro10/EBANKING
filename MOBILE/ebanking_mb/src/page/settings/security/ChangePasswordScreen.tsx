import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Header } from '../../../components';
import PasswordInput from './components/PasswordInput';
import { t } from 'i18next';
import { useNavigation } from '@react-navigation/native';
const ChangePasswordScreen = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigation = useNavigation();
  const validatePassword = (password: string) => {
    // Viết hoa chữ cái đầu, chứa chữ thường, số và ký tự đặc biệt, >=8 ký tự
    const regex =
      /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])[A-Z][A-Za-z\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{7,}$/;
    return regex.test(password);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t('common.error'), t('change_password.validation.empty'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('common.error'), t('change_password.validation.notMatch'));
      return;
    }

    if (!validatePassword(newPassword)) {
      Alert.alert(
        t('common.error'),
        t('change_password.validation.invalid'),
      );
      return;
    }
    Alert.alert(t('common.success'), t('change_password.success'));
    navigation.goBack();  
  };

  return (
    <View style={styles.container}>
      <Header title={t('change_password.title')} showBackButton />
      <View style={styles.content}>
        <PasswordInput
          title={t('change_password.currentPassword')}
          password={currentPassword}
          setPassword={setCurrentPassword}
        />
        <PasswordInput
          title={t('change_password.newPassword')}
          password={newPassword}
          setPassword={setNewPassword}
        />
        <PasswordInput
          title={t('change_password.confirmPassword')}
          password={confirmPassword}
          setPassword={setConfirmPassword}
        />

        <TouchableOpacity
          style={[styles.button]}
          onPress={handleChangePassword}
        >
          <Text style={styles.buttonText}>{t('change_password.confirmChange')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    marginTop: '30%',
    padding: 20,
  },

  button: {
    backgroundColor: '#b71c1c',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
