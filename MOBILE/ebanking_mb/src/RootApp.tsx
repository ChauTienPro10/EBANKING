// RootApp.tsx
import React, { useEffect } from 'react';
import {
  View,
  StatusBar,
  useColorScheme,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';
import '../i18n';

import Colors from './constants/color';
import { RootState, AppDispatch } from './store';
import AuthNavigator from './navigation/AuthNavigator';
import MainStack from './navigation/MainStack';
import { fetchAccountTransInfo } from './store/fetchAPI/AccountFetch';
import { fetchUserInfo } from './store/fetchAPI/UserInfoFetch';
import { TextEncoder, TextDecoder } from 'text-encoding';
import { navigationRef } from './navigation/navigate';
import {
  requestNotificationPermission,
  requestPermissionIOS,
} from './utils/fcmService';
import { SaveTokenDto } from './utils/fcmService';
import DeviceInfo from 'react-native-device-info';
import FlashMessage from 'react-native-flash-message';
import { HOST_SERVER } from './constants/api';

declare const global: any;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// @ts-ignore
import SockJS from 'sockjs-client/dist/sockjs';
import { Stomp } from '@stomp/stompjs';
import { useListenNotiFromFirebase } from './hooks/useListenNotiFromFirebase';

const SOCKET_URL = `http://${HOST_SERVER}:8006/ws`;

const RootApp: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const isLoggedIn = useSelector((state: RootState) => state.app.isLoggedIn);
  const loginResponse = useSelector(
    (state: RootState) => state.app.loginResponse,
  );
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        const payload: SaveTokenDto = {
          userId: 0,
          username: 'guest',
          deviceId: (await DeviceInfo.getUniqueId()).toString(),
          token: '',
        };
        await requestNotificationPermission(payload);
      } else if (Platform.OS === 'ios') {
        await requestPermissionIOS();
      }
    };
    requestPermissions();
  }, []);

  useEffect(() => {
    if (loginResponse) {
      const stompClient = Stomp.over(() => new SockJS(SOCKET_URL));
      stompClient.debug = str => console.log('[STOMP]', str);

      stompClient.connect(
        {},
        (frame: any) => {
          console.log('STOMP connected:', frame);

          stompClient.subscribe(
            '/topic/trans-subscribe/' + loginResponse.username,
            message => {
              console.log('Received:', message.body);
              const transaction = JSON.parse(message.body);

              if (navigationRef.isReady()) {
                navigationRef.navigate('TransactionSuccess', {
                  amount: transaction.amount.toString(),
                  transactionId: transaction.transactionId.toString(),
                  date: transaction.transactionAt,
                  receiver: transaction.receiverAccountNumber,
                  content: transaction.description ?? 'Không có nội dung',
                });
              }
            },
          );

          stompClient.send(
            '/app/chat.sendMessage',
            {},
            'Hello from React Native!',
          );
        },
        (error: any) => {
          console.error('STOMP connection error:', error);
        },
      );

      return () => {
        if (stompClient && stompClient.connected) {
          stompClient.disconnect(() => {
            console.log('🔌 STOMP disconnected');
          });
        }
      };
    }
  }, [loginResponse]);

  useEffect(() => {
    if (loginResponse?.id) {
      dispatch(fetchAccountTransInfo(loginResponse.id));
      dispatch(fetchUserInfo(loginResponse.id));
    }
  }, [loginResponse, dispatch]);

  useListenNotiFromFirebase();
  const keyboardVerticalOffset = Platform.select({
    ios: 90,
    android: 90,
    default: 90,
  });

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <View style={styles.container}>
        <FlashMessage position="top" />
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          translucent
          backgroundColor="transparent"
        />
        <NavigationContainer ref={navigationRef}>
          {/* ✅ Important */}
          {/* TODO: Remove this bypass for production */}
          <MainStack />
          {/* {isLoggedIn ? <MainStack /> : <AuthNavigator />} */}
        </NavigationContainer>
      </View>
      <Toast />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.main_bule,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  flex: {
    flex: 1,
  },
});

export default RootApp;
