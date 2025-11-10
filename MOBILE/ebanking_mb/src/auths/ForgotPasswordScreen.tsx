import React, { useState, useRef, useEffect } from 'react';
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
import { useTranslation } from 'react-i18next';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import BackgroundDecoration from '../components/BackgroundDecoration';
import Header from '../components/Header';
import Colors from '../constants/color';
import MailIcon from '../components/icon/MailIcon';
import PhoneIcon from '../components/icon/PhoneIcon';
import GText from '../components/GText';
import ReloadIcon from '../components/icon/ReloadIcon';
import Toast from 'react-native-toast-message';
import fetch from '../utils/fetch';
import { API } from '../constants/api';
import LoadingPopup from '../popups/LoadingPopup';
import LockIcon from '../components/icon/LockIcon';
import { EyeIcon, EyeOffIcon } from '../components/icon';

type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [typeVerify, setTypeVerify] = useState('email');
  const [countDown, setCountDown] = useState(90);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // const handlePhonePrefixChange = (countryCode: CountryCode, callingCode: string) => {
  //   console.log('Mã quốc gia:', countryCode);
  //   console.log('Mã vùng:', callingCode);
  // };
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false)
  const otpRefs = useRef<TextInput[]>([]);

  const setTypeVerifyHandle: any = () => {
    if (typeVerify === 'phone') {
      setTypeVerify('email');
    } else {
      setTypeVerify('phone');
    }
  }

  const requestOtp: any = async () => {
    setIsLoading(true);
    try {
      const rs = await fetch.post(API.FORGOT_PASS_REQUEST_OTP, { username: phone, typeVerify: typeVerify }, true);
      if (rs.status) {
        setStep('code');
      }
      else {
        Toast.show({
          type: 'error',
          text1: t('err.error_title'),
          text2: t('err.text_err_progress')
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('err.error_title'),
        text2: t('err.text_err_progress')
      });

    } finally {
      setIsLoading(false);
    }
  }

  const handleSendCode = async () => {
    requestOtp();
    startTimer();
  };

  const handleVerifyCode:any = async () => {
    setIsLoading(true);
    const otpString = otp.join('');
    try {
      const rs = await fetch.post(API.FORGOT_PASS_SEND_OTP, { username: phone, otp: otp.join(''), password: password }, false);
      console.log('đ', rs);
      if (rs.status) {
        navigation.navigate('SignIn');
      }
      else {
        Toast.show({
        type: 'error',
        text1: t('err.error_title'),
        text2: t('err.' + rs.error)
      });
      setIsLoading(false);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('err.error_title'),
        text2: t('err.text_err_progress')
      });
    } finally {
      setLoading(false);
    }
  };




  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setCountDown(90);
    timerRef.current = setInterval(() => {
      setCountDown(prev => {
        if (prev === 1) {
          clearInterval(timerRef.current!);
          stopTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      const newOtp = [...otp];

      if (otp[index]) {
        newOtp[index] = '';
        setOtp(newOtp);
        if (index > 0) {
          otpRefs.current[index - 1]?.focus();
        }
      } else if (index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        otpRefs.current[index - 1]?.focus();
      }
    }
  };
  const handleOtpFocus = (index: number) => {
    const lastFilledIndex = getLastFilledIndex(otp);

    if (index > lastFilledIndex + 1) {
      const nextIndex = Math.min(lastFilledIndex + 1, otp.length - 1);
      otpRefs.current[nextIndex]?.focus();
    }
  };

  const getLastFilledIndex = (arr: string[]): number => {
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i] !== '') {
        return i;
      }
    }
    return -1;
  };


  const renderPhoneStep = () => (
    <>


      <View style={styles.phoneInputContainer}>
        <CustomInput
          placeholder={typeVerify === 'phone' ? t('sign_in.text_phone') : t('sign_in.text_email')}
          value={phone}
          onChangeText={setPhone}
          keyboardType={typeVerify === 'phone' ? "phone-pad" : "default"}
          autoCapitalize="none"
          containerStyle={styles.phoneInput}
          leftIcon={typeVerify === 'phone' ? <PhoneIcon size={20} color={Colors.grey3} /> : <MailIcon size={20} color={Colors.grey3} />}
        />
      </View>

      <GText type='systemLight_14' color={Colors.grey1} style={{ padding: 12 }}>
        {t('sign_in.text_otp_was_send')}{' '}<GText type='systemLight_14' color={Colors.main_bule}>{typeVerify === 'phone' ? t('sign_in.text_phone') : t('sign_in.text_email')}</GText>{' '}{t('sign_in.text_of_you')}
      </GText>

      <CustomButton
        title={t('sign_in.text_send_otp')}
        onPress={handleSendCode}
        loading={isLoading}
        disabled={phone.length < 10}
        containerStyle={styles.sendButton}
      />
    </>
  );

  const renderCodeStep = () => (
    <>
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
            onFocus={() => handleOtpFocus(index)}
            maxLength={1}
            textAlign="center"
            selectTextOnFocus
          />
        ))}
      </View>

      <View style={styles.resendContainer}>
        <GText type='systemLight_14' color={Colors.grey1}>{t('sign_in.text_not_get_otp')}</GText>
        <TouchableOpacity disabled={countDown !== 0} onPress={async () => { await setCountDown(90); startTimer() }}>
          <GText type='systemLight_14' color={countDown === 0 ? Colors.main_bule : Colors.grey1}>{' '}{t('sign_in.text_send_again')}</GText>
        </TouchableOpacity>
      </View>

      <CustomInput
        placeholder={t('sign_in.text_password_new')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        leftIcon={<LockIcon size={20} color={Colors.grey3} />}
        rightIcon={
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeOffIcon size={20} color={Colors.grey3} />
            ) : (
              <EyeIcon size={20} color={Colors.grey3} />
            )}
          </TouchableOpacity>
        }
      />

      <View style={{height: 20}}></View>

      <CustomButton
        title={t('sign_in.text_auth')}
        onPress={handleVerifyCode}
        loading={isLoading}
        disabled={otp.join('').length !== 6 || password.length <= 5}
        containerStyle={styles.verifyButton}
      />
      {countDown !== 0 && <GText type='systemLight_14' color={Colors.black} style={{
        width: '100%',
        textAlign: 'center',
      }}>{countDown}{'(s)'}</GText>}

    </>

  );

  return (
    <BackgroundDecoration>
      <LoadingPopup visible={loading} message="Đang xử lý..." />
      <SafeAreaView style={styles.container}>
        <Header title='Khôi phục mật khẩu' showBackButton={true} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>

              <View style={styles.centralIconContainer}>
                <View style={styles.lockIconContainer}>
                  <ReloadIcon size={50} color={Colors.grey1} />
                </View>
              </View>

              <View style={styles.form}>
                {step === 'phone' ? renderPhoneStep() : renderCodeStep()}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <TouchableOpacity onPress={() => { setTypeVerifyHandle() }} style={styles.change_type_container}>
          <GText type='systemBold_16' color={Colors.main_bule}>{typeVerify === 'phone' ? t('forgot_password.use_email') :
            t('forgot_password.use_phone')}</GText>
        </TouchableOpacity>
      </SafeAreaView>
    </BackgroundDecoration>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white
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
    marginTop: 40

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
    marginVertical: 24
  },
  otpInput: {
    width: 50,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  otpInputEmpty: {
    borderColor: Colors.grey1,
    backgroundColor: Colors.grey1,
  },
  otpInputFilled: {
    borderColor: Colors.main_bule,
    backgroundColor: Colors.main_bule,
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

  change_type_container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    textAlign: 'center'
  }
});

export default ForgotPasswordScreen;
