import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

interface SearchIconProps {
  size?: number;
  color?: string;
  [key: string]: any;
}

const SearchIcon: React.FC<SearchIconProps> = ({ size = 24, color = '#000', ...props }) => {
  return <Icon name="search" size={size} color={color} {...props} />;
};

export default SearchIcon;