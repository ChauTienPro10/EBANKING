import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

interface ErrorIconProps {
  size?: number;
  color?: string;
}

const ErrorIcon: React.FC<ErrorIconProps> = ({ size = 24, color = '#000', ...props }) => {
  return <Icon name="alert-circle" size={size} color={color} {...props} />;
};

export default ErrorIcon;
