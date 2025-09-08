import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = {
    size?: number;
    color?: string;
};

export default function HelpCircleIcon({ size = 24, color = "#FFFFFF" }: Props) {
    return <Ionicons name="help-circle" size={size} color={color} />;
}
