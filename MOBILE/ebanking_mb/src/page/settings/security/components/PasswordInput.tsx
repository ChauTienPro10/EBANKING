import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { CustomInput } from '../../../../components';
import Icon from 'react-native-vector-icons/Ionicons';

type PasswordInputProps = {
  title: string;
  password: string;
  setPassword: (value: string) => void;
};

const PasswordInput = ({
  title,
  password,
  setPassword,
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = React.useState(false);
  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{title}</Text>
      <CustomInput
        placeholder={title}
        secureTextEntry={!showPassword}
        value={password}
        onChangeText={setPassword}
        containerStyle={styles.input}
        rightIcon={
          <Icon
            name={showPassword ? 'eye' : 'eye-off'}
            size={20}
            color="#666"
            onPress={() => setShowPassword(!showPassword)}
          />
        }
      />
    </View>
  );
};

export default PasswordInput;

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 30,
    textAlign: 'center',
  },

  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    marginBottom: 6,
    marginLeft: 4,
  },

  input: {
    marginBottom: 20,
  },
});
