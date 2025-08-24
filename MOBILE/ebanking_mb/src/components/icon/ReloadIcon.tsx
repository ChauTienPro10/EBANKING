import React from 'react';
import Octicons from 'react-native-vector-icons/Octicons';

type Props = {
    size?: number;
    color?: string;
};

export default function ReloadIcon({ size = 24, color = "#000" }: Props) {
    return <Octicons name="sync" size={size} color={color} />;
}
