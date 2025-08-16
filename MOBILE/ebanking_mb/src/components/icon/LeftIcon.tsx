import React from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';

type Props = {
    size?: number;
    color?: string;
};

export default function LeftIcon({ size = 24, color = "#FFFFFF" }: Props) {
    return <AntDesign name="left" size={size} color={color} />;
}
