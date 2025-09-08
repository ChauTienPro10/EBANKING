import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

interface GlobeIconProps {
  size?: number;
  color?: string;
}

const GlobeIcon: React.FC<GlobeIconProps> = ({ size = 24, color = '#000' }) => {
  return <Icon name="globe" size={size} color={color} />;
};

export default GlobeIcon;
