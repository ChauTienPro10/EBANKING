import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

interface InputIconProps {
  size?: number;
  color?: string;
}

const InputIcon: React.FC<InputIconProps> = ({ size = 24, color = '#000', ...props }) => {
  return <Icon name="input" size={size} color={color} {...props} />;
};

export default InputIcon;
