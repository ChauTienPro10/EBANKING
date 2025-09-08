import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

interface InformationCircleIconProps {
  size?: number;
  color?: string;
}

const InformationCircleIcon: React.FC<InformationCircleIconProps> = ({ size = 24, color = '#000' }) => {
  return <Icon name="information-circle" size={size} color={color} />;
};

export default InformationCircleIcon;
