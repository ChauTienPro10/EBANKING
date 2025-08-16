import React from 'react';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

type Props = {
    size?: number;
    color?: string;
};

export default function EyeIcon({ size = 24, color = "#000" }: Props) {
    return <SimpleLineIcons name="eye" size={size} color={color} />;
}
