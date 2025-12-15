import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = {
  size?: number;
  color?: string;
};

export default function BarChartIcon({ size = 24, color = '#FFFFFF' }: Props) {
  return <Ionicons name="bar-chart" size={size} color={color} />;
}
