import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

interface PersonIconProps {
  size?: number;
  color?: string;
}

const PersonIcon: React.FC<PersonIconProps> = ({ size = 24, color = '#000', ...props }) => {
  return <Icon name="person" size={size} color={color} {...props} />;
};

export default PersonIcon;
