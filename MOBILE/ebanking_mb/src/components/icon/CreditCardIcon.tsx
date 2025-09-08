import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = {
    size?: number;
    color?: string;
};

export default function CreditCardIcon({ size = 24, color = "#000000" }: Props) {
    return <Ionicons name="card" size={size} color={color} />;
}
