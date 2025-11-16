import React from 'react';
import CameraKitCameraScreen from 'react-native-camera-kit';
interface QRScannerProps {
  onScanSuccess?: (value: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess }) => {
  return (
    <CameraKitCameraScreen
      scanBarcode={true}
      onReadCode={(event: { nativeEvent: { codeStringValue: any; }; }) => {
        const qrValue = event?.nativeEvent?.codeStringValue;

        if (qrValue && onScanSuccess) {
          onScanSuccess(qrValue);
        }
      }}
      showFrame={true}
      laserColor="#ff0000"
      frameColor="#00ff00"
    />
  );
};

export default QRScanner;
