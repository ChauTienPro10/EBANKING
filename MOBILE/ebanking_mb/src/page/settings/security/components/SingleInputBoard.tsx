import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import InputBlock from './InputBlock';

type InputBoardProps = {
  title: string;
  submitText: string;
  onSubmit: (pin: string[]) => void;
};
const SingleInputBoard = ({ title, submitText, onSubmit }: InputBoardProps) => {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
 
  return (
    <View>
      <InputBlock title={title} pin={pin} onChangePin={setPin} />
      <TouchableOpacity style={styles.button} onPress={() => onSubmit?.(pin)}>
        <Text style={styles.buttonText}>{submitText}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SingleInputBoard;

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
});
