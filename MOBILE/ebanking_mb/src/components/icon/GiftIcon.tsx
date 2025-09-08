import React from 'react';
import { IconProps } from 'react-native-vector-icons/Icon';
import Icon from 'react-native-vector-icons/Ionicons';

const GiftIcon: React.FC<IconProps> = ({ size = 24, color = '#000', ...props }) => {
  return <Icon {...props} name="gift" size={size} color={color} />;
};

export default GiftIcon;
