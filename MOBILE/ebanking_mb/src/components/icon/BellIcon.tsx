import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

interface BellIconProps {
  size?: number;
  color?: string;
  [key: string]: any;
}

const BellIcon: React.FC<BellIconProps> = ({ size = 24, color = '#000', ...props }) => {
  return <Icon name="notifications" size={size} color={color} {...props} />;
};

export default BellIcon;
