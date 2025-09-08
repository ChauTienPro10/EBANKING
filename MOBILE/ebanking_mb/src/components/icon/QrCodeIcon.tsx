import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

interface QrCodeIconProps {
  size?: number;
  color?: string;
  [key: string]: any;
}

const QrCodeIcon: React.FC<QrCodeIconProps> = ({ size = 24, color = '#000', ...props }) => {
  return <Icon name="qr-code" size={size} color={color} {...props} />;
};

export default QrCodeIcon;
