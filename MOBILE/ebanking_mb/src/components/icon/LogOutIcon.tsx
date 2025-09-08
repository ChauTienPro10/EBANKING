import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

interface LogOutIconProps {
  size?: number;
  color?: string;
}

const LogOutIcon: React.FC<LogOutIconProps> = ({ size = 24, color = '#000' }) => {
  return <Icon name="log-out" size={size} color={color} />;
};

export default LogOutIcon;
