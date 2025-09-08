import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

interface Props {
  size?: number;
  color?: string;
}

const ChevronDownIcon: React.FC<Props> = ({ size = 24, color = '#000' }) => {
  return (
    <Icon name="chevron-down" size={size} color={color} />
  );
};

export default ChevronDownIcon;
