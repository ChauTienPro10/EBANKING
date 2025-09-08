import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

interface WifiIconProps {
  size?: number;
  color?: string;
  [key: string]: any;
}

const WifiIcon: React.FC<WifiIconProps> = ({ size = 24, color = '#000', ...props }) => {
  return <Icon name="wifi" size={size} color={color} {...props} />;
};

export default WifiIcon;
