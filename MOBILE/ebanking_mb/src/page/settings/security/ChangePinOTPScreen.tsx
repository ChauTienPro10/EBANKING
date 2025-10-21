import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Toast from 'react-native-toast-message';
import SingleInputBoard from './components/SingleInputBoard';
import MultiInputBoard from './components/MultiInputBoard';
import { Header } from '../../../components';
import { validateCodeWithMessage } from '../../../utils/validatecode';
import { useTranslation } from 'react-i18next';

const ChangePinScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [isCheckCurrentPin, setIsCheckCurrentPin] = useState(true);

  const handleCheckCurrentPin = (pin: string[]) => {
    const error = validateCodeWithMessage(pin);
    if (error) {
      Alert.alert(t('common.error'), t(`change_pin_otp.validation.${error}`));
      return;
    }
    setIsCheckCurrentPin(false);
  };

  const handleChangePin = (pin: string[]) => {
    const error = validateCodeWithMessage(pin);
    if (error) {
      Alert.alert(t('error'), t(`change_pin_otp.validation.${error}`));
      return;
    }
    Toast.show({
      type: 'success',
      text1: t('change_pin_otp.success'),
    });
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title={t('change_pin_otp.title')} showBackButton />
      <View style={styles.content}>
        {isCheckCurrentPin ? (
          <SingleInputBoard
            title={t('change_pin_otp.enterCurrentPin')}
            submitText={t('change_pin_otp.continue')}
            onSubmit={handleCheckCurrentPin}
          />
        ) : (
          <MultiInputBoard
            title_first={t('change_pin_otp.enterNewPin')}
            title_second={t('change_pin_otp.reenterNewPin')}
            submitText={t('change_pin_otp.continue')}
            onSubmit={handleChangePin}
            keyword_language="change_pin_otp.validation"
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChangePinScreen;

const styles = StyleSheet.create({
  content: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
});
