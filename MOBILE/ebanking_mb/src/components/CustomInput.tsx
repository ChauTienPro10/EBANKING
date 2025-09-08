import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Colors from '../constants/color';

interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const CustomInput: React.FC<CustomInputProps> = ({
                                                   label,
                                                   error,
                                                   containerStyle,
                                                   inputStyle,
                                                   leftIcon,
                                                   rightIcon,
                                                   ...props
                                                 }) => {
  return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={styles.label}>{label}</Text>}

        <View style={[styles.inputContainer, error && styles.inputContainerError]}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

          <TextInput
              style={[
                styles.input,
                leftIcon ? styles.inputWithLeftIcon : null,
                rightIcon ? styles.inputWithRightIcon : null,
                inputStyle,
              ].filter(Boolean)}
              placeholderTextColor="#9CA3AF"
              {...props}
          />

          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: Colors.grey2,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  inputContainerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 16,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  leftIcon: {
    marginRight: 12,
  },
  rightIcon: {
    marginLeft: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
});

export default CustomInput;
