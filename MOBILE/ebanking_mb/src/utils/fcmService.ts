import { PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import fetch from './fetch';
import { API } from '../constants/api';

export interface SaveTokenDto {
  userId: number;
  username: string;
  deviceId: string;
  token: string;
}

/**
 * Xin quyền thông báo (Android) và đồng bộ token ngay khi app mở.
 */
export async function requestNotificationPermission(payload: SaveTokenDto) {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      {
        title: 'Quyền thông báo',
        message: 'Ứng dụng cần quyền để gửi thông báo cho bạn.',
        buttonPositive: 'Đồng ý',
        buttonNegative: 'Từ chối',
      },
    );

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Quyền thông báo bị từ chối');
      return;
    }
  }

  await updateServerFcmToken(payload);
}

/**
 * Xin quyền thông báo và cập nhật token trên iOS.
 */
export async function requestPermissionIOS(payload: SaveTokenDto) {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Quyền thông báo đã được cấp trên iOS');
    await updateServerFcmToken(payload);
  } else {
    console.log('Quyền thông báo bị từ chối trên iOS');
  }
}

/**
 * Luôn lấy token hiện tại và gửi lên server.
 */
export const updateServerFcmToken = async (payload: SaveTokenDto) => {
  try {
    const token = await messaging().getToken();
    if (!token) {
      console.warn('Không lấy được FCM token');
      return null;
    }
    return await sendTokenToServer(token, payload);
  } catch (error) {
    console.error('Lỗi khi cập nhật FCM token:', error);
    return null;
  }
};

/**
 * Lắng nghe sự kiện Firebase cấp token mới và đồng bộ ngay lên server.
 */
export const listenFcmTokenRefresh = (
  payloadBuilder: () => SaveTokenDto | Promise<SaveTokenDto>,
) => {
  return messaging().onTokenRefresh(async token => {
    try {
      const payload = await payloadBuilder();
      await sendTokenToServer(token, payload);
    } catch (error) {
      console.error('Lỗi khi xử lý token refresh:', error);
    }
  });
};

const sendTokenToServer = async (token: string, payload: SaveTokenDto) => {
  try {
    payload.token = token;

    // Gọi hàm post custom — hàm này đã tự xử lý parse JSON rồi
    const result = await fetch.post(API.SAVE_TOKEN_FCM, payload, false);

    console.log('Server response:', result);
    return result;
  } catch (error) {
    console.error('Lỗi khi gửi token về server:', error);
    return null;
  }
};