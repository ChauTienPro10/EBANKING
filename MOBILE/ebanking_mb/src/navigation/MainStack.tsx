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
import LanguageScreen from '../page/settings/LanguaguesScreen';
import NotificationsScreen from '../page/settings/NotificationScreen';
import AboutScreen from '../page/settings/AboutScreen';
import HelpScreen from '../page/settings/HelpScreen';
import BiometricScreen from '../page/settings/BiometricScreen';
import PrivacyScreen from '../page/settings/PrivacyScreen';
import SecurityScreen from '../page/settings/security/SecurityScreen';
import ChangePinScreen from '../page/settings/security/ChangePinOTPScreen';
import ForgotPinOTPScreen from '../page/settings/security/ForgotPinOTPScreen';
import ChangePasswordScreen from '../page/settings/security/ChangePasswordScreen';
import ChangePinMyVIBScreen from '../page/settings/security/ChangePinMyVIB';

const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator
      initialRouteName="Settings" //
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
      <Stack.Screen name="language_settings" component={LanguageScreen} />
      <Stack.Screen name='notification_settings' component={NotificationsScreen} />
      <Stack.Screen name="security_settings" component={SecurityScreen} />
      <Stack.Screen name="change_pin_otp" component={ChangePinScreen} />
      <Stack.Screen name="change_pin_myvib" component={ChangePinMyVIBScreen} />
      <Stack.Screen name="change_password" component={ChangePasswordScreen} />
      <Stack.Screen name="forgot_pin_otp" component={ForgotPinOTPScreen} />
      <Stack.Screen name="biometric_settings" component={BiometricScreen} />
      <Stack.Screen name="privacy_settings" component={PrivacyScreen} />
      <Stack.Screen name="about" component={AboutScreen} />
      <Stack.Screen name="help" component={HelpScreen} />
    </Stack.Navigator>
  );
}
