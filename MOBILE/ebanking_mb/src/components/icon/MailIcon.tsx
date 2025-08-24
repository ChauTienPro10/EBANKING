import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = {
    size?: number;
    color?: string;
};

export default function MailIcon({ size = 24, color = "#FFFFFF" }: Props) {
    return <Ionicons name="mail" size={size} color={color} />;
}
