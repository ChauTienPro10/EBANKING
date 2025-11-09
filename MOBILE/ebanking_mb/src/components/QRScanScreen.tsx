import React, { useState } from 'react';
import { View, Text, Button, Alert, Image } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import { launchImageLibrary } from 'react-native-image-picker';
import jsQR from 'jsqr';
import { decode } from 'base64-arraybuffer';

const QRScanScreen = () => {
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const onCameraSuccess = (e: { data: string }) => {
    setScannedData(e.data);
    Alert.alert('QR Code Scanned', e.data);
  };

  const pickImageFromGallery = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', includeBase64: true });
    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setImageUri(asset.uri || null);

      if (asset.base64) {
        const bytes = decode(asset.base64);
        // jsQR expects Uint8ClampedArray
        const arr = new Uint8ClampedArray(bytes);
        // jsQR cần width/height, bạn cần lấy metadata ảnh
        // Đây chỉ ví dụ cơ bản, có thể cần thêm thư viện để đọc size ảnh
        const code = jsQR(arr, 100, 100); // ⚠️ chỉnh width/height thực tế
        if (code) {
          setScannedData(code.data);
          Alert.alert('QR from Gallery', code.data);
        } else {
          Alert.alert('Không tìm thấy QR code trong ảnh');
        }
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <QRCodeScanner
        onRead={onCameraSuccess}
        flashMode={RNCamera.Constants.FlashMode.auto}
        topContent={<Text style={{ textAlign: 'center', fontSize: 16 }}>Đưa camera vào QR code</Text>}
      />
      <Button title="Chọn QR từ thư viện" onPress={pickImageFromGallery} />
      {imageUri && <Image source={{ uri: imageUri }} style={{ width: 200, height: 200, alignSelf: 'center', marginTop: 10 }} />}
      {scannedData && <Text style={{ textAlign: 'center', marginTop: 10 }}>Dữ liệu QR: {scannedData}</Text>}
    </View>
  );
};

export default QRScanScreen;
