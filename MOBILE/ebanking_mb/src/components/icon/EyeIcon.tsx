import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

interface EyeIconProps {
  size?: number;
  color?: string;
  [key: string]: any;
}

const EyeIcon: React.FC<EyeIconProps> = ({ size = 24, color = '#000', ...props }) => {
  return <Icon name="eye" size={size} color={color} {...props} />;
};

export default EyeIcon;