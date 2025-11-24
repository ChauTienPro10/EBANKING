import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

export const EMVChip = () => (
  <Svg width="48" height="38" viewBox="0 0 48 38" fill="none">
    <Rect width="48" height="38" rx="6" fill="#D4AF37" />
    <Rect x="8" y="8" width="10" height="8" fill="#B8982F" />
    <Rect x="20" y="8" width="10" height="8" fill="#B8982F" />
    <Rect x="32" y="8" width="8" height="8" fill="#B8982F" />
    <Rect x="8" y="18" width="10" height="6" fill="#B8982F" />
    <Rect x="20" y="18" width="10" height="6" fill="#B8982F" />
    <Rect x="32" y="18" width="8" height="6" fill="#B8982F" />
    <Rect x="8" y="26" width="10" height="4" fill="#B8982F" />
    <Rect x="20" y="26" width="10" height="4" fill="#B8982F" />
    <Rect x="32" y="26" width="8" height="4" fill="#B8982F" />
  </Svg>
);

export const ContactlessIcon = () => (
  <Svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <Path
      d="M12 8C12 8 16 10.5 16 16C16 21.5 12 24 12 24"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Path
      d="M8 12C8 12 10 13.5 10 16C10 18.5 8 20 8 20"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Path
      d="M16 6C16 6 22 9.5 22 16C22 22.5 16 26 16 26"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </Svg>
);
