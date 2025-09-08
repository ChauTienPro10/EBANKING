import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

interface AirplaneIconProps {
  size?: number;
  color?: string;
  [key: string]: any;
}

const AirplaneIcon: React.FC<AirplaneIconProps> = ({ size = 24, color = '#000', ...props }) => {
  return <Icon name="airplane" size={size} color={color} {...props} />;
};

export default AirplaneIcon;
