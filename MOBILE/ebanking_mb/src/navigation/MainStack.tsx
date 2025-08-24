// src/navigation/MainStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from '../auths/SignInScreen';
import SignUpScreen from '../auths/SignUpScreen';
import ForgotPasswordScreen from '../auths/ForgotPasswordScreen';
import DemoScreen from '../auths/DemoScreen';


const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator initialRouteName="Sign_in">
      <Stack.Screen name="Sign_in" component={SignInScreen} />
      <Stack.Screen name="Sign_up" component={SignUpScreen} />
      <Stack.Screen name="Forgot_password" component={ForgotPasswordScreen} />
      <Stack.Screen name="Demo" component={DemoScreen} />

    </Stack.Navigator>
  );
}
