import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

interface GameControllerIconProps {
  size?: number;
  color?: string;
  [key: string]: any;
}

const GameControllerIcon: React.FC<GameControllerIconProps> = ({ size = 24, color = '#000', ...props }) => {
  return <Icon name="game-controller" size={size} color={color} {...props} />;
};

export default GameControllerIcon;
