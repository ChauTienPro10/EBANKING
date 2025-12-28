// Polyfills for React Native
import { install } from 'react-native-quick-crypto';

// Install crypto polyfills
install();

// Make Buffer available globally
import { Buffer } from '@craftzdog/react-native-buffer';

declare const global: any;
global.Buffer = Buffer;

// Import base64 functions and make them available globally
try {
  const base64 = require('react-native-quick-base64');
  if (base64.fromArrayBuffer) {
    global.base64FromArrayBuffer = base64.fromArrayBuffer;
  }
  if (base64.toArrayBuffer) {
    global.base64ToArrayBuffer = base64.toArrayBuffer;
  }
} catch (e) {
  // Fallback base64 polyfills using Buffer
  if (!global.base64FromArrayBuffer) {
    global.base64FromArrayBuffer = function(arrayBuffer: ArrayBuffer): string {
      return Buffer.from(arrayBuffer).toString('base64');
    };
  }

  if (!global.base64ToArrayBuffer) {
    global.base64ToArrayBuffer = function(base64: string): ArrayBuffer {
      const buffer = Buffer.from(base64, 'base64');
      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    };
  }
}