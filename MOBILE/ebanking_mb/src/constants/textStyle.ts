import { TextStyle as RNTextStyle } from 'react-native';
import Colors from './color';

const TextStyles: Record<string, RNTextStyle> = {
  systemBold_24: {
    fontSize: 24,
    fontFamily: 'System',
    fontWeight: 'bold',
    lineHeight: 28,
    color: Colors.black,
  },
  systemBold_20: {
    fontSize: 20,
    fontFamily: 'System',
    fontWeight: 'bold',
    lineHeight: 24,
    color: Colors.black,
  },
  systemBold_18: {
    fontSize: 18,
    fontFamily: 'System',
    fontWeight: 'bold',
    lineHeight: 22,
    color: Colors.black,
  },
  systemBold_16: {
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: 'bold',
    lineHeight: 20,
    color: Colors.black,
  },
  systemMedium_16: {
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: '600',
    lineHeight: 20,
    color: Colors.black,
  },
  systemMedium_14: {
    fontSize: 14,
    fontFamily: 'System',
    fontWeight: '600',
    lineHeight: 18,
    color: Colors.black,
  },
  systemLight_18: {
    fontSize: 18,
    fontFamily: 'System',
    lineHeight: 22,
    fontWeight: 'normal',
    color: Colors.black,
  },
  systemLight_16: {
    fontSize: 16,
    fontFamily: 'System',
    lineHeight: 20,
    fontWeight: 'normal',
    color: Colors.black,
  },
  systemLight_14: {
    fontSize: 14,
    fontFamily: 'System',
    lineHeight: 20,
    fontWeight: 'normal',
    color: Colors.black,
  },
  systemLight_12: {
    fontSize: 12,
    fontFamily: 'System',
    lineHeight: 16,
    fontWeight: 'normal',
    color: Colors.black,
  },
};

export default TextStyles;
