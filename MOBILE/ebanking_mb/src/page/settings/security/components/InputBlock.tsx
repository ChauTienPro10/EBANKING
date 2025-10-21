import React, { useRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

type InputBlockProps = {
  title: string;
  pin: string[];
  onChangePin: (pin: string[]) => void;
};

const InputBlock = ({ title, pin, onChangePin }: InputBlockProps) => {
  const inputs = useRef<TextInput[]>([]);

  const handleChange = (text: string, index: number) => {
    if (/^\d*$/.test(text)) {
      const newPin = [...pin];
      newPin[index] = text;
      onChangePin(newPin);

      if (text && index < 5) {
        inputs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && pin[index] === '') {
      if (index > 0) {
        const newPin = [...pin];
        newPin[index - 1] = '';
        onChangePin(newPin);
        inputs.current[index - 1]?.focus();
      }
    }
  };

  return (
    <View>
      <Text style={styles.title}>{title}</Text>

      {/* Ô nhập mã PIN */}
      <View style={styles.pinContainer}>
        {pin.map((value, index) => (
          <TextInput
            key={index}
            ref={ref => {
              if (ref) inputs.current[index] = ref;
            }}
            style={[styles.pinInput, value ? styles.pinFilled : null]}
            maxLength={1}
            keyboardType="number-pad"
            secureTextEntry
            onChangeText={text => handleChange(text, index)}
            onKeyPress={e => handleKeyPress(e, index)}
            value={value}
          />
        ))}
      </View>
    </View>
  );
};

export default InputBlock;

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    color: '#444',
    fontSize: 16,
    marginBottom: 30,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginBottom: 40,
  },
  pinInput: {
    width: 45,
    height: 45,
    borderBottomWidth: 2,
    borderColor: '#ccc',
    textAlign: 'center',
    fontSize: 22,
    borderRadius: 8,
  },
  pinFilled: {
    borderColor: '#8B0000',
  },
});
