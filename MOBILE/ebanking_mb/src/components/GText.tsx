import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import TextStyles from '../constants/textStyle';
import Colors from '../constants/color';

interface GTextProps extends TextProps {
  type?: keyof typeof TextStyles;
  color?: string;
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
}

const GText: React.FC<GTextProps> = ({
  children,
  type = 'systemBold_16',
  color = Colors.black,
  style,
  ...rest
}) => {
  return (
    <Text
      style={[TextStyles[type], { color }, style]}
      {...rest}
    >
      {children}
    </Text>
  );
};

export default GText;
