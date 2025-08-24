import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import Colors from '../constants/color';
interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  containerStyle,
  textStyle,
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];

    if (disabled) {
      return [...baseStyle, styles.disabled];
    }

    switch (variant) {
      case 'primary':
        return [...baseStyle, styles.primary];
      case 'secondary':
        return [...baseStyle, styles.secondary];
      case 'outline':
        return [...baseStyle, styles.outline];
      default:
        return [...baseStyle, styles.primary];
    }
  };

  const getTextStyle = () => {
    const baseTextStyle = [styles.text, styles[`${size}Text`]];

    if (disabled) {
      return [...baseTextStyle, styles.disabledText];
    }

    switch (variant) {
      case 'outline':
        return [...baseTextStyle, styles.outlineText];
      default:
        return [...baseTextStyle, styles.primaryText];
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), containerStyle]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? `${Colors.main_bule}` : `${Colors.white}`}
          size="small"
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  // Size variants
  small: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 44,
  },
  medium: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 56,
  },
  large: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    minHeight: 64,
  },
  // Color variants
  primary: {
    backgroundColor: Colors.main_bule,
  },
  secondary: {
    backgroundColor: '#6B7280',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.main_bule,
  },
  disabled: {
    backgroundColor: '#D1D5DB',
    borderColor: '#D1D5DB',
  },
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  primaryText: {
    color: Colors.white,
  },
  outlineText: {
    color: Colors.main_bule,
  },
  disabledText: {
    color: '#9CA3AF',
  },
});

export default CustomButton;
