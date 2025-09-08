import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

interface StarIconProps {
  size?: number;
  color?: string;
  [key: string]: any;
}

const StarIcon: React.FC<StarIconProps> = ({ size = 24, color = '#000', ...props }) => {
  return <Icon name="star" size={size} color={color} {...props} />;
};

export default StarIcon;
