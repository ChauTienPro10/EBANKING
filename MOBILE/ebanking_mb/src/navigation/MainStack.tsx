import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from '../auths/SignInScreen';
import SignUpScreen from '../auths/SignUpScreen';
import ForgotPasswordScreen from '../auths/ForgotPasswordScreen';
import DemoScreen from '../auths/DemoScreen';
import HomeScreen from '../page/home/HomeScreen';
import MenuScreen from '../page/menu/MenuScreen';
import SearchScreen from '../page/search/SearchScreen';
import SettingsScreen from '../page/settings/SettingsScreen';
import SupportScreen from '../page/support/SupportScreen';
import TransferScreen from '../page/transfer/TransferScreen';
import ProfileScreen from '../page/profile/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator
      initialRouteName="Profile" //
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
    </Stack.Navigator>
  );
}
