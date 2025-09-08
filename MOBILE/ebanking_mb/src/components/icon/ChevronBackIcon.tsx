import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

interface ChevronBackIconProps {
  size?: number;
  color?: string;
  style?: any;
}

const ChevronBackIcon: React.FC<ChevronBackIconProps> = ({ size = 24, color = '#000', style, ...props }) => {
  return <Icon name="chevron-back" size={size} color={color} style={style} {...props} />;
};

export default ChevronBackIcon;
