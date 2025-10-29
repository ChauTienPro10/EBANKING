import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../page/home/HomeScreen';
import MenuScreen from '../page/menu/MenuScreen';
import SearchScreen from '../page/search/SearchScreen';
import SettingsScreen from '../page/settings/SettingsScreen';
import SupportScreen from '../page/support/SupportScreen';
import TransferScreen from '../page/transfer/TransferScreen';
import ProfileScreen from '../page/profile/ProfileScreen';
import OpenAccountScreen from '../page/transaction/OpenAccountScreen';
import { RootStackParamList } from './types';
import TransactionSuccessScreen from '../page/transfer/Success';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function MainStack() {
  return (
    <Stack.Navigator
      initialRouteName="Transfer" //
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Menu" component={MenuScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="Transfer" component={TransferScreen} />
      <Stack.Screen name="OpenCard" component={OpenAccountScreen} />
      <Stack.Screen name="TransactionSuccess" component={TransactionSuccessScreen} />

    </Stack.Navigator>
  );
}
