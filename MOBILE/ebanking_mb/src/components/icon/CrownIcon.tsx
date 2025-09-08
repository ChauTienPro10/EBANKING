import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

interface CrownIconProps {
  size?: number;
  color?: string;
  [key: string]: any;
}

const CrownIcon: React.FC<CrownIconProps> = ({ size = 24, color = '#000', ...props }) => {
  return <Icon name="crown" size={size} color={color} {...props} />;
};

export default CrownIcon;
