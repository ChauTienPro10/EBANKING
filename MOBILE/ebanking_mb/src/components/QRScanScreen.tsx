import React, { useState } from 'react';
import { View, Text, Button, Alert, Image } from 'react-native';
import { useCameraDevice, Camera, useFrameProcessor, Frame } from 'react-native-vision-camera';
import { scanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
import { launchImageLibrary } from 'react-native-image-picker';
import jsQR from 'jsqr';
import { decode } from 'base64-arraybuffer';
import { runOnJS } from 'react-native-reanimated';

const QRScanScreen = () => {
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const device = useCameraDevice('back');

  const frameProcessor = useFrameProcessor((frame: Frame) => {
    'worklet';
    const detectedBarcodes = scanBarcodes(frame, [BarcodeFormat.QR_CODE]);
    if (detectedBarcodes.length > 0 && detectedBarcodes[0].rawValue) {
      const value = detectedBarcodes[0].rawValue;
      runOnJS(setScannedData)(value);
      runOnJS(Alert.alert)('QR Code Scanned', value);
    }
  }, []);

  const pickImageFromGallery = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', includeBase64: true });
    if (result.assets?.length) {
      const asset = result.assets[0];
      setImageUri(asset.uri || null);

      if (asset.base64) {
        const bytes = decode(asset.base64);
        const arr = new Uint8ClampedArray(bytes);
        // ⚠️ Cần width/height thực tế để jsQR hoạt động chính xác
        const code = jsQR(arr, 100, 100);
        if (code?.data) {
          setScannedData(code.data);
          Alert.alert('QR from Gallery', code.data);
        } else {
          Alert.alert('Không tìm thấy QR code trong ảnh');
        }
      }
    }
  };

  if (!device) {
    return <Text style={{ textAlign: 'center', marginTop: 100 }}>Đang khởi tạo camera...</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <Camera
        style={{ flex: 1 }}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
      />
      <Button title="Chọn QR từ thư viện" onPress={pickImageFromGallery} />
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={{ width: 200, height: 200, alignSelf: 'center', marginTop: 10 }}
        />
      )}
      {scannedData && (
        <Text style={{ textAlign: 'center', marginTop: 10 }}>Dữ liệu QR: {scannedData}</Text>
      )}
    </View>
  );
};

export default QRScanScreen;
