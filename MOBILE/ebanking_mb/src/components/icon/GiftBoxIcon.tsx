import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

interface GiftBoxIconProps {
  size?: number;
  color?: string;
  [key: string]: any;
}

const GiftBoxIcon: React.FC<GiftBoxIconProps> = ({ size = 24, color = '#000', ...props }) => {
  return <Icon name="gift" size={size} color={color} {...props} />;
};

export default GiftBoxIcon;
