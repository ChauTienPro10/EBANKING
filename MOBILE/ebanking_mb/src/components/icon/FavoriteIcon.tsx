import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

interface FavoriteIconProps {
  size?: number;
  color?: string;
}

const FavoriteIcon: React.FC<FavoriteIconProps> = ({ size = 24, color = '#000', ...props }) => {
  return <Icon name="heart" size={size} color={color} {...props} />;
};

export default FavoriteIcon;
