import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface InfoCircleIconProps {
  size?: number;
  color?: string;
}

const InfoCircleIcon: React.FC<InfoCircleIconProps> = ({
  size = 24,
  color = '#000000',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <Path
        d="M12 16V12"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Circle cx="12" cy="8" r="1" fill={color} />
    </Svg>
  );
};

export default InfoCircleIcon;
