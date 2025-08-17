import React from 'react';
import Feather from 'react-native-vector-icons/Feather';

type Props = {
    size?: number;
    color?: string;
};

export default function EyeOffIcon({ size = 24, color = "#000" }: Props) {
    return <Feather name="eye-off" size={size} color={color} />;
}
