import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

interface MoreIconProps {
  size?: number;
  color?: string;
  [key: string]: any;
}

const MoreIcon: React.FC<MoreIconProps> = ({ size = 24, color = '#000', ...props }) => {
  return <Icon name="ellipsis-horizontal" size={size} color={color} {...props} />;
};

export default MoreIcon;
