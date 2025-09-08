import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

interface EyeOffIconProps {
  size?: number;
  color?: string;
  [key: string]: any;
}

const EyeOffIcon: React.FC<EyeOffIconProps> = ({ size = 24, color = '#000', ...props }) => {
  return <Icon name="eye-off" size={size} color={color} {...props} />;
};

export default EyeOffIcon;