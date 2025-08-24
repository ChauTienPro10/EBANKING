import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SignInScreen from '../auths/SignInScreen';
import SignUpScreen from '../auths/SignUpScreen';
import ForgotPasswordScreen from '../auths/ForgotPasswordScreen';

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="SignIn"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
        cardOverlayEnabled: false,
      }}
    >
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
