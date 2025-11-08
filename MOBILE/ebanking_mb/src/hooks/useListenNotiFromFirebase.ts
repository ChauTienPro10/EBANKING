import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import { showMessage } from 'react-native-flash-message';
import Colors from '../constants/color';
import { navigationRef } from '../navigation/navigate';

/**
 * Hook xử lý lắng nghe thông báo từ Firebase Messaging
 */
export const useListenNotiFromFirebase = (onReceiveNoti?: (msg: any) => void) => {
  useEffect(() => {
    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      const title = remoteMessage.notification?.title || 'Thông báo';
      const body = remoteMessage.notification?.body || '';

      showMessage({
        message: title,
        description: 'Xem chi tiết...',
        type: 'info',
        backgroundColor: Colors.black,
        color: Colors.white,
        icon: 'auto',
        floating: true,
        duration: 4000,
        onPress: () => {
          if (navigationRef.current?.isReady()) {
            navigationRef.current.navigate('ShowNotificationScreen', { title, body });
          }
        },
      });
    });

    const unsubscribeOnOpened = messaging().onNotificationOpenedApp(remoteMessage => {
      if (onReceiveNoti) onReceiveNoti(remoteMessage);
    });

    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage && onReceiveNoti) {
        onReceiveNoti(remoteMessage);
      }
    });

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnOpened();
    };
  }, [onReceiveNoti]);
};
