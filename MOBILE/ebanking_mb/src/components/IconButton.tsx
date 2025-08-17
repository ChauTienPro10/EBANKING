import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';

interface IconButtonProps {
  icon: React.ReactNode; // fix TS2322
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: number;
  style?: ViewStyle;
}

const IconButton: React.FC<IconButtonProps> = ({
                                                 icon,
                                                 onPress,
                                                 variant = 'primary',
                                                 size = 48,
                                                 style,
                                               }) => {
  return (
      <TouchableOpacity
          onPress={onPress}
          style={[
            styles.base,
            { width: size, height: size, borderRadius: size / 2 },
            variantStyles[variant],
            style,
          ]}
      >
        {icon}
      </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: '#2563EB' },
  secondary: { backgroundColor: '#6B7280' },
  outline: {
    borderWidth: 2,
    borderColor: '#2563EB',
    backgroundColor: 'transparent',
  },
});

export default IconButton;
