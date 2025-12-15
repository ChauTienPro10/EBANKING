import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../page/home/HomeScreen';
import MenuScreen from '../page/menu/MenuScreen';
import CardScreen from '../page/card-info/CardScreen';
import ManageLimitsScreen from '../page/card-info/ManageLimitsScreen';
import SearchScreen from '../page/search/SearchScreen';
import SettingsScreen from '../page/settings/SettingsScreen';
import SupportScreen from '../page/support/SupportScreen';
import TransferScreen from '../page/transfer/TransferScreen';
import ProfileScreen from '../page/profile/ProfileScreen';
import OpenAccountScreen from '../page/transaction/OpenAccountScreen';
import { RootStackParamList } from './types';
import TransactionSuccessScreen from '../page/transfer/Success';
import PendingTransactionScreen from '../page/transfer/Pending';
import TransactionFailedScreen from '../page/transfer/Error';
import TransactionHistoryScreen from '../page/transaction/TransactionHistoryScreen';
import TransactionDetailScreen from '../page/transaction/TransactionDetailScreen';
import ShowNotificationScreen from '../notification/showNoti';
import SetPinCodeScreen from '../PIN/pinCodeScreen';
import ScannerScreen from '../page/QR/ScannerScreen';
import {
  EKYCScreen,
  LivenessCameraScreen,
  ReviewScreen,
  ResultScreen,
} from '../features/ekyc';
import EKYCDetailScreen from '../features/ekyc/screens/EKYCDetailScreen';
import OCRCameraScreen from '../features/ekyc/components/OCRCameraScreen';
import ChatScreen from '../page/chatbot/ChatScreen';
import NotiScreen from '../page/notify/notiScreen';
import FaceAuthScreen from '../features/face-auth/FaceAuthScreen';
import LotteryScreen from '../page/lottery/LotteryScreen';
import StatisticsScreen from '../page/statistics/StatisticsScreen';
import SuspiciousTransactionsScreen from '../page/transaction/SuspiciousTransactionsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function MainStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Menu" component={MenuScreen} />
      <Stack.Screen name="Card" component={CardScreen} />
      <Stack.Screen name="ManageLimits" component={ManageLimitsScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="Chatbot" component={ChatScreen} />
      <Stack.Screen name="Transfer" component={TransferScreen} />
      <Stack.Screen name="Lottery" component={LotteryScreen} />
      <Stack.Screen name="Statistics" component={StatisticsScreen} />
      <Stack.Screen name="OpenCard" component={OpenAccountScreen} />
      <Stack.Screen
        name="TransactionSuccess"
        component={TransactionSuccessScreen}
      />
      <Stack.Screen
        name="PendingTransactionScreen"
        component={PendingTransactionScreen}
      />
      <Stack.Screen
        name="TransactionFailedScreen"
        component={TransactionFailedScreen}
      />
      <Stack.Screen
        name="TransactionHistoryScreen"
        component={TransactionHistoryScreen}
      />
      <Stack.Screen
        name="TransactionDetail"
        component={TransactionDetailScreen}
      />
      <Stack.Screen
        name="SuspiciousTransactions"
        component={SuspiciousTransactionsScreen}
      />
      <Stack.Screen
        name="ShowNotificationScreen"
        component={ShowNotificationScreen}
      />
      <Stack.Screen name="SetPINCode" component={SetPinCodeScreen} />
      <Stack.Screen name="ScannerScreen" component={ScannerScreen} />
      <Stack.Screen name="Notifications" component={NotiScreen} />

      {/* eKYC Flow - Native Camera Implementation */}
      <Stack.Screen name="EKYC" component={EKYCScreen} />
      <Stack.Screen name="OCRCamera" component={OCRCameraScreen} />
      <Stack.Screen name="LivenessCamera" component={LivenessCameraScreen} />
      <Stack.Screen name="ReviewScreen" component={ReviewScreen} />
      <Stack.Screen name="ResultScreen" component={ResultScreen} />
      <Stack.Screen name="EKYCDetail" component={EKYCDetailScreen} />

      {/* Face Authentication for High-Value Transactions */}
      <Stack.Screen name="FaceAuthScreen" component={FaceAuthScreen} />
    </Stack.Navigator>
  );
}
