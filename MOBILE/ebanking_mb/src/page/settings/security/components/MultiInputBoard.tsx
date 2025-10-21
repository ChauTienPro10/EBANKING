import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import InputBlock from './InputBlock';
import { validateCodeWithMessage } from '../../../../utils/validatecode';
import { useTranslation } from 'react-i18next';

type InputBoardProps = {
  title_first: string;
  title_second: string;
  submitText: string;
  onSubmit: (pin: string[]) => void;
  keyword_language?: string;
};
const MultiInputBoard = ({
  title_first,
  title_second,
  submitText,
  onSubmit,
  keyword_language,
}: InputBoardProps) => {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [repeatPin, setRepeatPin] = useState(['', '', '', '', '', '']);
  const { t } = useTranslation();
  const handleSubmit = () => {
    const validatePin = validateCodeWithMessage(pin);
    if (validatePin) {
      Alert.alert(t('common.error'), t(`${keyword_language}.${validatePin}`));
      return;
    }

    const validateRepeatPin = validateCodeWithMessage(repeatPin);
    if (validateRepeatPin) {
      Alert.alert(
        t('common.error'),
        t(`${keyword_language}.${validateRepeatPin}`),
      );
      return;
    }

    if (pin.join('') !== repeatPin.join('')) {
      Alert.alert(t('common.error'), t(`${keyword_language}.mismatch`));
      return;
    }
    onSubmit?.(pin);
  };
  return (
    <View>
      <InputBlock title={title_first} pin={pin} onChangePin={setPin} />
      <View style={styles.spacing} />
      <InputBlock
        title={title_second}
        pin={repeatPin}
        onChangePin={setRepeatPin}
      />
      <View style={styles.warmContainer}>
        <Text style={styles.warmTitle}>
          {t('change_pin_otp.warning.title')}
        </Text>
        <Text style={styles.warmText}>
          • {t('change_pin_otp.warning.line1')}
        </Text>
        <Text style={styles.warmText}>
          • {t('change_pin_otp.warning.line2')}
        </Text>
        <Text style={styles.warmText}>
          • {t('change_pin_otp.warning.line3')}
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{submitText}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MultiInputBoard;
const styles = StyleSheet.create({
  button: {
    backgroundColor: '#8B0000',
    borderRadius: 8,
    paddingVertical: 14,
    marginHorizontal: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  spacing: {
    height: 50,
  },
  warmContainer: {
    backgroundColor: '#fff8e1',
    borderWidth: 1,
    borderColor: '#facc15',
    borderRadius: 10,
    padding: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  warmTitle: {
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 6,
  },
  warmText: {
    color: '#78350f',
    lineHeight: 20,
    marginBottom: 6,
  },
});
