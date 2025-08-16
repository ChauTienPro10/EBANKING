import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {
    size?: number;
    color?: string;
};

export default function Fingerprint({ size = 24, color = "#FFFFFF" }: Props) {
    return <MaterialCommunityIcons name="fingerprint" size={size} color={color} />;
}
