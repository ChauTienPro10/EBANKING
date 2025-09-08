import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

interface Props {
  size?: number;
  color?: string;
}

const CheckIcon: React.FC<Props> = ({ size = 24, color = '#000' }) => {
  return (
    <Icon name="checkmark" size={size} color={color} />
  );
};

export default CheckIcon;
