import React from 'react';
import Entypo from 'react-native-vector-icons/Entypo';

type Props = {
    size?: number;
    color?: string;
    style?: object; // sửa {} thành object cho rõ ràng
};

export default function LockIcon({ size = 24, color = "#FFFFFF", style }: Props) {
    return <Entypo name="lock" size={size} color={color} style={style} />;
}
