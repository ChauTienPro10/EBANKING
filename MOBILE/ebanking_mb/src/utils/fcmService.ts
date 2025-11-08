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

export async function requestNotificationPermission(payload: SaveTokenDto) {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
                title: 'Quyền thông báo',
                message: 'Ứng dụng cần quyền để gửi thông báo cho bạn.',
                buttonPositive: 'Đồng ý',
                buttonNegative: 'Từ chối',
            }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            const token = await messaging().getToken();
            if (token) {
                await sendTokenToServer(token, payload); // Gửi token về server
            }
        } else {
            console.log('Quyền thông báo bị từ chối');
        }
    }
}

export async function requestPermissionIOS() {
    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
        console.log('Quyền thông báo đã được cấp trên iOS');
    } else {
        console.log('Quyền thông báo bị từ chối trên iOS');
    }
}

export const getFcmToken = async () => {
    const token = await messaging().getToken();
    return token;
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