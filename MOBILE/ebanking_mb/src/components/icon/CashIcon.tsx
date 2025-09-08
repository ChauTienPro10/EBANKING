import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = {
    size?: number;
    color?: string;
};

export default function CashIcon({ size = 24, color = "#FFFFFF" }: Props) {
    return <Ionicons name="cash" size={size} color={color} />;
}
