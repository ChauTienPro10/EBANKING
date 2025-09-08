import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = {
    size?: number;
    color?: string;
};

export default function GridIcon({ size = 24, color = "#FFFFFF" }: Props) {
    return <Ionicons name="grid" size={size} color={color} />;
}
