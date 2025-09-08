import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

interface MenuIconProps {
  size?: number;
  color?: string;
  [key: string]: any;
}

const MenuIcon: React.FC<MenuIconProps> = ({ size = 24, color = '#000', ...props }) => {
  return <Icon name="menu" size={size} color={color} {...props} />;
};

export default MenuIcon;
