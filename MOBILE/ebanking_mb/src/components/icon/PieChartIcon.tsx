import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
};

export default function PieChartIcon({ size = 24, color = '#14B8A6' }: Props) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Main pie chart circle */}
        <Circle
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
        />

        {/* Pie slice 1 - largest (from top, clockwise 140 degrees) */}
        <Path
          d="M 12 2 L 12 12 L 19.5 7 A 10 10 0 0 0 12 2"
          fill={color}
          opacity="0.9"
        />

        {/* Pie slice 2 - medium (140-240 degrees) */}
        <Path
          d="M 12 12 L 19.5 7 A 10 10 0 0 1 19.5 17 L 12 12"
          fill={color}
          opacity="0.6"
        />

        {/* Pie slice 3 - small (240-360 degrees) */}
        <Path
          d="M 12 12 L 19.5 17 A 10 10 0 0 1 12 22 L 12 12"
          fill={color}
          opacity="0.3"
        />

        {/* Pie slice 4 - smallest (270-360 degrees) */}
        <Path
          d="M 12 12 L 12 22 A 10 10 0 0 1 4.5 17 L 12 12"
          fill={color}
          opacity="0.15"
        />

        {/* Center circle for modern look */}
        <Circle
          cx="12"
          cy="12"
          r="3"
          fill="white"
          stroke={color}
          strokeWidth="1"
        />

        {/* Small dot in center */}
        <Circle cx="12" cy="12" r="1" fill={color} />
      </Svg>
    </View>
  );
}
