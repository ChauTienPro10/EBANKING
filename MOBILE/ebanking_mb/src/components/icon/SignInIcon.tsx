import React from 'react';
import Octicons from 'react-native-vector-icons/Octicons';

type Props = {
    size?: number;
    color?: string;
};

export default function SignInIcon({ size = 24, color = "#000" }: Props) {
    return <Octicons name="sign-in" size={size} color={color} />;
}
