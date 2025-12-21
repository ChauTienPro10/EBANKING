// RootApp.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  StatusBar,
  useColorScheme,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Text,
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
import {
  fetchAnalysis30Days,
  fetchAnalysisCurrentMonth,
  fetchAnalysisPreviousMonth,
  fetchAnalysisCurrentWeek,
  fetchAnalysisPreviousWeek,
  fetchAnalysisWeeklyStats,
} from './store/fetchAPI/AnalysisFetch';
import { TextEncoder, TextDecoder } from 'text-encoding';
import { navigationRef } from './navigation/navigate';
import {
  requestNotificationPermission,
  requestPermissionIOS,
  listenFcmTokenRefresh,
  updateServerFcmToken,
  SaveTokenDto,
} from './utils/fcmService';
import DeviceInfo from 'react-native-device-info';
import FlashMessage from 'react-native-flash-message';
import { HOST_SERVER } from './constants/api';
import fetch from './utils/fetch';
declare const global: any;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// @ts-ignore
import SockJS from 'sockjs-client/dist/sockjs';
import { Stomp } from '@stomp/stompjs';
import { useListenNotiFromFirebase } from './hooks/useListenNotiFromFirebase';
import { setPinStatus, resetModalSession } from './store/slices/appSlice';
import { API } from './constants/api';

const SOCKET_URL = `http://${HOST_SERVER}:8006/ws`;

const RootApp: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const isLoggedIn = useSelector((state: RootState) => state.app.isLoggedIn);
  const loginResponse = useSelector(
    (state: RootState) => state.app.loginResponse,
  );
  const dispatch = useDispatch<AppDispatch>();
  const [deviceId, setDeviceId] = useState<string>('');

  useEffect(() => {
    const fetchDeviceId = async () => {
      const id = await DeviceInfo.getUniqueId();
      setDeviceId(id?.toString() || '');
    };
    fetchDeviceId();
  }, []);

  useEffect(() => {
    if (!deviceId) {
      return;
    }

    const requestPermissions = async () => {
      const payload: SaveTokenDto = {
        userId: 0,
        username: 'guest',
        deviceId,
        token: '',
      };

      if (Platform.OS === 'android') {
        await requestNotificationPermission(payload);
      } else if (Platform.OS === 'ios') {
        await requestPermissionIOS(payload);
      }
    };
    requestPermissions();
  }, [deviceId]);

  useEffect(() => {
    if (!deviceId || !loginResponse) {
      return;
    }

    const syncTokenAfterLogin = async () => {
      const payload: SaveTokenDto = {
        userId: loginResponse.id,
        username: loginResponse.username ?? 'guest',
        deviceId,
        token: '',
      };
      await updateServerFcmToken(payload);
    };

    syncTokenAfterLogin();
  }, [deviceId, loginResponse]);

  useEffect(() => {
    if (!deviceId) {
      return;
    }

    const unsubscribe = listenFcmTokenRefresh(() => ({
      userId: loginResponse?.id ?? 0,
      username: loginResponse?.username ?? 'guest',
      deviceId,
      token: '',
    }));

    return () => {
      unsubscribe();
    };
  }, [deviceId, loginResponse]);

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
    const fetchPinStatus = async () => {
      try {
        const _pinStt = await fetch.get(
          API.GET_PIN_STT.replace('{username}', loginResponse?.username || ''),
          {},
          true,
        );
        dispatch(setPinStatus(_pinStt));
      } catch (error) {
        console.error('Error fetching pin status:', error);
      }
    };

    fetchPinStatus();
  }, [loginResponse]);

  useEffect(() => {
    if (isLoggedIn && loginResponse?.id) {
      dispatch(fetchAccountTransInfo(loginResponse.id));
      dispatch(fetchUserInfo(loginResponse.id));

      // Fetch analysis data
      if (loginResponse.username) {
        dispatch(fetchAnalysis30Days(loginResponse.username));
        dispatch(fetchAnalysisCurrentMonth(loginResponse.username));
        dispatch(fetchAnalysisPreviousMonth(loginResponse.username));
        dispatch(fetchAnalysisCurrentWeek(loginResponse.username));
        dispatch(fetchAnalysisPreviousWeek(loginResponse.username));
        dispatch(fetchAnalysisWeeklyStats(loginResponse.username));
      }

      // Reset modal session on login for fresh state
      dispatch(resetModalSession());
    }
  }, [isLoggedIn, loginResponse, dispatch]);

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
          {/* <MainStack /> */}
          {isLoggedIn ? <MainStack /> : <AuthNavigator />}
        </NavigationContainer>
      </View>
      <Toast
        config={{
          warning: ({ text1, text2, ...rest }) => (
            <View
              style={{
                height: 60,
                width: '90%',
                backgroundColor: '#FFF3E0',
                borderLeftColor: '#FF9800',
                borderLeftWidth: 5,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 15,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              <View style={{ marginRight: 10 }}>
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: '#FF9800',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}
                  >
                    !
                  </Text>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}
                >
                  {text1}
                </Text>
                {text2 && (
                  <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                    {text2}
                  </Text>
                )}
              </View>
            </View>
          ),
        }}
      />
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
