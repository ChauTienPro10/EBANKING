import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

interface TicketIconProps {
  size?: number;
  color?: string;
  [key: string]: any;
}

const TicketIcon: React.FC<TicketIconProps> = ({ size = 24, color = '#000', ...props }) => {
  return <Icon name="ticket" size={size} color={color} {...props} />;
};

export default TicketIcon;
