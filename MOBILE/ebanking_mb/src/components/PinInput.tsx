import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/color';
import Toast from 'react-native-toast-message';
import GText from './GText';
import fetch from '../utils/fetch';
import { API } from '../constants/api';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { navigationRef } from '../navigation/navigate';
import { setPinStatus, setPinAction } from '../store/slices/appSlice';

interface PinInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  create: boolean;
  hasBiometric?: boolean;
}

const PinInput: React.FC<PinInputProps> = ({
  length = 4,
  onComplete,
  create,
  hasBiometric,
}) => {
  const { t } = useTranslation();
  const loginResponse = useSelector(
    (state: RootState) => state.app.loginResponse,
  );
  const dispatch = useDispatch();

  const [pin, setPin] = useState<string[]>(Array(length).fill(''));
  const inputsRef = useRef<Array<TextInput | null>>([]);
  const [confirmPin, setConfirmPin] = useState('');
  const [pinStt, setPinStt] = useState(false);
  const pinStatus = useSelector((state: RootState) => state.app.pinStatus);
  const handleChange = async (text: string, index: number) => {
    if (!/^\d$/.test(text) && text !== '') return;

    const newPin = [...pin];
    newPin[index] = text;
    setPin(newPin);

    // focus ô tiếp theo nếu có
    if (text && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    // gọi onComplete khi nhập đầy đủ
    if (newPin.every(digit => digit !== '')) {
      const pinString = newPin.join('');
      if (create && !pinStatus) {
        if (confirmPin === pinString) {
          // call api tạo pin
          try {
            const payload = {
              username: loginResponse?.username,
              pinCode: confirmPin,
            };
            const response = await fetch.post(API.SET_PIN, payload, true);
            if (!response.status) {
              Toast.show({
                type: 'error',
                text1: t('err.error_title'),
                text2: t('err.' + response.error),
              });
              setConfirmPin('');
              setPin(Array(length).fill(''));
              inputsRef.current[0]?.focus();
            } else {
              // PIN created successfully
              dispatch(setPinStatus(true));
              dispatch(setPinAction('create'));

              Toast.show({
                type: 'success',
                text1: t('pin.created_successfully'),
                text2: t('pin.pin_is_now_active'),
              });

              setConfirmPin('');
              setPin(Array(length).fill(''));
              inputsRef.current[0]?.focus();

              // Navigate back or to Settings
              if (navigationRef.canGoBack()) {
                navigationRef.goBack();
              } else {
                navigationRef.navigate('Settings');
              }
            }
          } catch (err: any) {
            console.error('set pin error: ', err);
            Toast.show({
              type: 'error',
              text1: t('err.error_title'),
              text2: t('err.text_can_not_set_pin'),
            });
            return;
          }
        } else {
          if (confirmPin.length === length) {
            Toast.show({
              type: 'error',
              text1: t('err.error_title'),
              text2: t('err.text_pin_dont_meet'),
            });
            return;
          }
          setConfirmPin(pinString);
          // reset pin để nhập lại
          setPin(Array(length).fill(''));
          inputsRef.current[0]?.focus();
        }
      } else if (create && pinStatus) {
        try {
          const payload = {
            username: loginResponse?.username,
            pinCode: newPin.join(''),
          };
          const response = await fetch.post(API.DELETE_PIN, payload, true);
          if (!response.status) {
            Toast.show({
              type: 'error',
              text1: t('err.error_title'),
              text2: t('err.' + response.error),
            });
          } else {
            // PIN deleted successfully
            dispatch(setPinStatus(false));
            dispatch(setPinAction('delete'));

            Toast.show({
              type: 'success',
              text1: t('pin.deleted_successfully'),
              text2: t('pin.pin_has_been_removed'),
            });

            setConfirmPin('');
            setPin(Array(length).fill(''));
            inputsRef.current[0]?.focus();

            // Navigate back or to Settings
            if (navigationRef.canGoBack()) {
              navigationRef.goBack();
            } else {
              navigationRef.navigate('Settings');
            }
          }
        } catch (err: any) {
          console.error('set pin error: ', err);
          Toast.show({
            type: 'error',
            text1: t('err.error_title'),
            text2: t('err.text_delete_pin_fail'),
          });
          return;
        }
      } else {
        onComplete(pinString);
      }
    }
  };

  const handleFocus = (index: number) => {
    const firstEmptyIndex = pin.findIndex(v => v === '');

    if (firstEmptyIndex !== -1 && index > firstEmptyIndex) {
      inputsRef.current[firstEmptyIndex]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (pin[index] === '' && index > 0) {
        const newPin = [...pin];
        newPin[index - 1] = '';
        setPin(newPin);
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  return (
    <View style={styles.containerMaster}>
      <GText
        color={Colors.grey1}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          marginTop: 60,
        }}
      >
        {confirmPin.length === length
          ? t('pin.re_enter_pin')
          : t('pin.enter_pin')}
      </GText>
      <View style={styles.container}>
        {pin.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.input}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onFocus={() => handleFocus(index)}
            onChangeText={text => handleChange(text, index)}
            onKeyPress={e => handleKeyPress(e, index)}
            ref={ref => {
              inputsRef.current[index] = ref;
            }} // fix ref type
            secureTextEntry={true}
          />
        ))}
      </View>
      {hasBiometric && (
        <View style={styles.biometricComponent}>
          <TouchableOpacity style={styles.button}>
            <Icon name="finger-print" size={20} color={Colors.red} />;
            <Text style={styles.buttonText}>{t('pin.biometric_auth')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default PinInput;

const styles = StyleSheet.create({
  containerMaster: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '80%',
    marginVertical: 20,
  },
  input: {
    width: 56,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.grey1,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    color: Colors.black,
    marginHorizontal: 8,
  },
  biometricComponent: {
    marginTop: 20,
    alignItems: 'center',
    flexDirection: 'row',
  },

  title: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  button: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    marginLeft: 8,
    color: Colors.grey1,
    fontWeight: '200',
    fontSize: 16,
  },
});
