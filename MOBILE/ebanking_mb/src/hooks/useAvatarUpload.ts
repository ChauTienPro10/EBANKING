import { useState, useCallback } from 'react';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';
import ImagePicker from 'react-native-image-crop-picker';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchUserInfo } from '../store/fetchAPI/UserInfoFetch';
import fetch from '../utils/fetch';
import { API } from '../constants/api';

export const useAvatarUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const dispatch: AppDispatch = useDispatch();
  const loginResponse = useSelector(
    (state: RootState) => state.app.loginResponse,
  );

  /**
   * Request camera permission on Android
   */
  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Quyền truy cập Camera',
            message: 'Ứng dụng cần quyền truy cập camera để chụp ảnh đại diện',
            buttonNeutral: 'Hỏi lại sau',
            buttonNegative: 'Từ chối',
            buttonPositive: 'Đồng ý',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  /**
   * Request storage permission on Android for gallery access
   */
  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        // For Android 13+ (API 33+), use READ_MEDIA_IMAGES
        const androidVersion = Platform.Version;
        if (androidVersion >= 33) {
          const granted = await PermissionsAndroid.request(
            'android.permission.READ_MEDIA_IMAGES' as any,
            {
              title: 'Quyền truy cập ảnh',
              message: 'Ứng dụng cần quyền truy cập ảnh để chọn ảnh đại diện',
              buttonNeutral: 'Hỏi lại sau',
              buttonNegative: 'Từ chối',
              buttonPositive: 'Đồng ý',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          // For older Android versions, use READ_EXTERNAL_STORAGE
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'Quyền truy cập bộ nhớ',
              message:
                'Ứng dụng cần quyền truy cập bộ nhớ để chọn ảnh đại diện',
              buttonNeutral: 'Hỏi lại sau',
              buttonNegative: 'Từ chối',
              buttonPositive: 'Đồng ý',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  /**
   * Crop image to circular shape
   */
  const cropImage = async (imagePath: string): Promise<string | null> => {
    try {
      const croppedImage = await ImagePicker.openCropper({
        path: imagePath,
        width: 400,
        height: 400,
        cropperCircleOverlay: true,
        cropping: true,
        includeBase64: true,
        compressImageQuality: 0.8,
        mediaType: 'photo',
      });

      return croppedImage.data || null;
    } catch (error: any) {
      if (error.message !== 'User cancelled image selection') {
        console.error('Crop error:', error);
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không thể cắt ảnh',
        });
      }
      return null;
    }
  };

  /**
   * Upload avatar to server
   */
  const uploadAvatar = async (base64Image: string): Promise<boolean> => {
    if (!loginResponse?.id) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không tìm thấy thông tin người dùng',
      });
      return false;
    }

    setIsUploading(true);
    try {
      const url = API.UPLOAD_AVATAR.replace(
        '{userId}',
        String(loginResponse.id),
      );
      const payload = {
        imageBase64: `data:image/jpeg;base64,${base64Image}`,
      };

      await fetch.post(url, payload, true);

      // Refresh user info to get new avatar URL
      await dispatch(fetchUserInfo(loginResponse.id));

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đã cập nhật ảnh đại diện',
      });

      return true;
    } catch (error: any) {
      console.error('Upload avatar error:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message || 'Không thể tải ảnh lên',
      });
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Handle selecting image from gallery
   */
  const handleSelectFromGallery = useCallback(async () => {
    try {
      // Request storage permission for Android
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert(
          'Quyền truy cập bị từ chối',
          'Vui lòng cấp quyền truy cập ảnh trong cài đặt để sử dụng tính năng này',
          [{ text: 'OK' }],
        );
        return;
      }

      const result: ImagePickerResponse = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
        selectionLimit: 1,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        console.error('Image picker error:', result.errorMessage);
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: result.errorMessage || 'Không thể chọn ảnh từ thư viện',
        });
        return;
      }

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        return;
      }

      // Crop image
      const base64Image = await cropImage(asset.uri);
      if (!base64Image) {
        return;
      }

      // Upload to server
      await uploadAvatar(base64Image);
    } catch (error) {
      console.error('Gallery selection error:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Đã xảy ra lỗi khi chọn ảnh',
      });
    }
  }, [loginResponse]);

  /**
   * Handle taking photo with camera
   */
  const handleTakePhoto = useCallback(async () => {
    try {
      // Request camera permission
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert(
          'Quyền truy cập bị từ chối',
          'Vui lòng cấp quyền truy cập camera trong cài đặt để sử dụng tính năng này',
          [{ text: 'OK' }],
        );
        return;
      }

      const result: ImagePickerResponse = await launchCamera({
        mediaType: 'photo',
        quality: 1,
        cameraType: 'front',
        saveToPhotos: false,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không thể chụp ảnh',
        });
        return;
      }

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        return;
      }

      // Crop image
      const base64Image = await cropImage(asset.uri);
      if (!base64Image) {
        return;
      }

      // Upload to server
      await uploadAvatar(base64Image);
    } catch (error) {
      console.error('Camera error:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Đã xảy ra lỗi khi chụp ảnh',
      });
    }
  }, [loginResponse]);

  return {
    isUploading,
    handleSelectFromGallery,
    handleTakePhoto,
  };
};
