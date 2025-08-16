import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LeftIcon from '../components/icon/LeftIcon';
import LockIcon from '../components/icon/LockIcon';
import UserIcon from '../components/icon/UserIcon';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import BackgroundDecoration from '../components/BackgroundDecoration';

type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  
  const otpRefs = useRef<TextInput[]>([]);

  const handleSendCode = () => {
    if (phone.length >= 10) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setStep('code');
      }, 2000);
    }
  };

  const handleVerifyCode = () => {
    const otpString = otp.join('');
    if (otpString.length === 6) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        navigation.navigate('SignIn');
      }, 2000);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const renderPhoneStep = () => (
    <>
      <Text style={styles.instruction}>
        Nhập số điện thoại của bạn để nhận mã xác thực
      </Text>
      
      <View style={styles.phoneInputContainer}>
        <View style={styles.phonePrefix}>
          <Text style={styles.phonePrefixText}>+84</Text>
        </View>
        <CustomInput
          placeholder="Số điện thoại"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoCapitalize="none"
          maxLength={10}
          containerStyle={styles.phoneInput}
          leftIcon={<UserIcon size={20} color="#6B7280" />}
        />
      </View>

      <Text style={styles.verificationText}>
        Chúng tôi sẽ gửi mã xác thực 6 số qua tin nhắn SMS
      </Text>

      <CustomButton
        title="Gửi mã xác thực"
        onPress={handleSendCode}
        loading={isLoading}
        disabled={phone.length < 10}
        containerStyle={styles.sendButton}
      />
    </>
  );

  const renderCodeStep = () => (
    <>
      <Text style={styles.instruction}>
        Nhập mã xác thực 6 số đã được gửi đến {phone}
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              if (ref) otpRefs.current[index] = ref;
            }}
            style={[
              styles.otpInput,
              digit ? styles.otpInputFilled : styles.otpInputEmpty
            ]}
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
            onKeyPress={(e) => handleOtpKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
            selectTextOnFocus
          />
        ))}
      </View>

      <Text style={styles.verificationText}>
        Mã xác thực sẽ hết hạn sau 5 phút
      </Text>

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Không nhận được mã? </Text>
        <TouchableOpacity>
          <Text style={styles.resendLink}>Gửi lại</Text>
        </TouchableOpacity>
      </View>

      <CustomButton
        title="Xác thực"
        onPress={handleVerifyCode}
        loading={isLoading}
        disabled={otp.join('').length !== 6}
        containerStyle={styles.verifyButton}
      />
    </>
  );

  return (
    <BackgroundDecoration>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <LeftIcon size={24} color="#FFFFFF" />
                <Text style={styles.backText}>Quay lại</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <Text style={styles.title}>
                {step === 'phone' ? 'Quên mật khẩu' : 'Xác thực mã'}
              </Text>

              <View style={styles.centralIconContainer}>
                <View style={styles.lockIconContainer}>
                  <LockIcon size={50} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.form}>
                {step === 'phone' ? renderPhoneStep() : renderCodeStep()}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundDecoration>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  centralIconContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  lockIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  form: {
    width: '100%',
    marginBottom: 40,
  },
  instruction: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  phonePrefix: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  phonePrefixText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
  },
  verificationText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
    lineHeight: 20,
  },
  sendButton: {
    marginBottom: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  otpInputEmpty: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  otpInputFilled: {
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
  },
  resendLink: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  verifyButton: {
    marginBottom: 24,
  },
});

export default ForgotPasswordScreen;
