import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import SingleInputBoard from './components/SingleInputBoard';
import MultiInputBoard from './components/MultiInputBoard';
import { Header } from '../../../components';

const ChangePinMyVIBScreen = () => {
  const [isCheckCurrentPin, setIsCheckCurrentPin] = useState(true);
  const navigation = useNavigation();

  const handleCheckCurrentPin = (pin: string[]) => {
    const pinValue = pin.join('');
    console.log('PIN hiện tại:', pinValue);
    setIsCheckCurrentPin(false);
  };

  const handleChangePin = (pin: string[]) => {
    const pinValue = pin.join('');
    console.log('PIN mới:', pinValue);
    Toast.show({
      type: 'success',
      text1: 'Đổi mã pin thành công',
    });
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="Đổi mã PIN" showBackButton />
      <View style={styles.content}>
 {
        isCheckCurrentPin ? (
         <SingleInputBoard
           title="Nhập mã PIN Smart OTP hiện tại"
           submitText="Tiếp tục"
           onSubmit={handleCheckCurrentPin}
         />
        )
        : (
          <MultiInputBoard
            title_first="Nhập mã PIN Smart OTP mới"
            title_second="Nhập lại mã PIN Smart OTP mới"
            submitText="Tiếp tục"
            onSubmit={handleChangePin}
          />
        )
      }
        </View>
    </KeyboardAvoidingView>
  );
};

export default ChangePinMyVIBScreen;

const styles = StyleSheet.create({
  content: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
 
});
