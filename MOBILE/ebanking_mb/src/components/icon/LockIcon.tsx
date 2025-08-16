import React from 'react';
import Entypo from 'react-native-vector-icons/Entypo';

type Props = {
    size?: number;
    color?: string;
};

export default function LockIcon({ size = 24, color = "#FFFFFF" }: Props) {
    return <Entypo name="lock" size={size} color={color} />;
}
