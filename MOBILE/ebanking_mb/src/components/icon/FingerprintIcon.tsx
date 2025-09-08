import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

interface FingerprintIconProps {
  size?: number;
  color?: string;
}

const FingerprintIcon: React.FC<FingerprintIconProps> = ({ size = 24, color = '#000' }) => {
  return <Icon name="finger-print" size={size} color={color} />;
};

export default FingerprintIcon;
