import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LockIcon from '../components/icon/LockIcon';
import UserIcon from '../components/icon/UserIcon';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import BackgroundDecoration from '../components/BackgroundDecoration';
import Header from '../components/Header';
import { useTranslation } from 'react-i18next';
import Colors from '../constants/color';
import GText from '../components/GText';
import Checkbox from '../components/CheckBox';
import MailIcon from '../components/icon/MailIcon';
import fetch from '../utils/fetch';
import Toast from 'react-native-toast-message';
import ToastService from '../components/ToastService';
import { API } from '../constants/api';
import { RootStackParamList } from '../navigation/types';
import LoadingPopup from '../popups/LoadingPopup';

type SignUpScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignUp'>;

const SignUpScreen: React.FC = () => {
  const { t } = useTranslation();

  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const [citizenId, setCitizenId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [typeVerify, setTypeVerify] = useState('email');
  const [rawPassword, setRawPassword] = useState('');

  const handleSignUp = async () => {
    setIsLoading(true);
    await setTypeVerify(detectInputType(email));
    if (typeVerify === 'unknown') return 'Số điện thoại hoặc email không đúng';
    if (!isValidCCCD(citizenId)) return 'Căn cước công dân không hợp lệ';

    const payload = {
      username: email,
      password: password,
      citizenId: citizenId,
      typeVerify: typeVerify
    }
    const handlePostRequest = async () => {
      try {
        const data = await fetch.post(API.REGISTER, payload, false);
        console.log(data);
      } catch (error) {
        ToastService.error('Login failed:', (error as Error).message || String(error));
        return;
      }

    };
    await handlePostRequest()
    return "OK"
  };

  const doSignup = async () => {
    const preHandMess = await handleSignUp();
    if (preHandMess == 'OK') {
      ToastService.success('Thông báo', 'OTP đã được gửi đến ' + email);
      navigation.navigate("OTPPage", { username: email, targetPage: "SignIn" })
    }
    else {
      ToastService.info("Đăng ký thất bại", preHandMess);
    }
    setIsLoading(false);
  }

  const detectInputType = (input: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^0\d{9}$/;

    if (emailRegex.test(input)) {
      return "email";
    } else if (phoneRegex.test(input)) {
      return "phone";
    } else {
      return "unknown";
    }
  };

  const isValidCCCD = (cccd: string) => {
    const cccdRegex = /^\d{12}$/;

    // Kiểm tra đúng 12 chữ số
    if (!cccdRegex.test(cccd)) {
      return false;
    }

    // Kiểm tra mã tỉnh (000 - 999) — bạn có thể tùy chọn kiểm tra sâu hơn
    const provinceCode = parseInt(cccd.slice(0, 3), 10);
    if (provinceCode < 1 || provinceCode > 999) {
      return false;
    }

    // Kiểm tra giới tính và thế kỷ (1 chữ số thứ 4)
    const genderCenturyDigit = parseInt(cccd[3], 10);
    if (genderCenturyDigit < 0 || genderCenturyDigit > 9) {
      return false;
    }

    // Nếu cần, bạn có thể kiểm tra thêm logic ngày tháng sinh, mã số cá nhân,…

    return true;
  };


  const isFormValid = citizenId.length > 0 && email.length > 0 && password.length > 0 && acceptTerms && password === rawPassword;

  return (
    <BackgroundDecoration>
      <LoadingPopup visible={isLoading} message="Đang xử lý..." />
      <Header title={t('sign_in.text_sign_up')} showBackButton={true} />

      <SafeAreaView style={styles.container}>
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
                <View style={styles.userIconContainer}>
                  <UserIcon size={60} color={Colors.main_bule} />
                </View>
              </View>
              <View style={styles.form}>
                <CustomInput
                  placeholder={t('sign_in.text_cccd')}
                  value={citizenId}
                  onChangeText={setCitizenId}
                  autoCapitalize="words"
                  leftIcon={<UserIcon size={20} color="#6B7280" />}
                />
                <View style={{ height: 10 }}> </View>

                <CustomInput
                  placeholder={t('sign_in.text_email_or_phone')}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  leftIcon={<MailIcon size={20} color="#6B7280" />}
                />
                <View style={{ height: 10 }}> </View>

                <CustomInput
                  placeholder={t('sign_in.text_password')}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  leftIcon={<LockIcon size={20} color="#6B7280" />}
                />
                <View style={{ height: 10 }}> </View>

                <CustomInput
                  placeholder={t('sign_in.raw_password')}
                  value={rawPassword}
                  onChangeText={setRawPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  leftIcon={<LockIcon size={20} color="#6B7280" />}
                />
                <View style={{ height: 10 }}> </View>

                {/* Terms and Conditions Checkbox */}
                <View
                  style={styles.termsCheckboxContainer}
                >
                  <Checkbox checked={acceptTerms} onChange={setAcceptTerms} style={{ marginHorizontal: 5 }} />
                  <View style={styles.termsTextContainer}>
                    <GText type='systemLight_14' color={Colors.grey1}>
                      {t('sign_in.text_by_the_confirm_policy')}{' '}
                      <GText type='systemLight_14' color={Colors.main_bule} >{t('sign_in.text_policy_and_term')}</GText>{' '}
                      {t('sign_in.text_of_us')}
                    </GText>
                  </View>
                </View>

                <CustomButton
                  title={t('sign_in.text_sign_up')}
                  onPress={doSignup}
                  loading={isLoading}
                  disabled={!isFormValid}
                  containerStyle={styles.signUpButton}
                />
              </View>

              <View style={styles.signInContainer}>
                <GText type='systemLight_14' color={Colors.grey1}>{t('sign_in.text_have_account')}{' '}</GText>
                <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                  <GText type='systemLight_14' color={Colors.main_bule}>{t('sign_in.text_login')}</GText>
                </TouchableOpacity>
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
    paddingTop: 50,
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
  },
  greeting: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 28,
  },
  centralIconContainer: {
    marginBottom: 40,
  },
  userIconContainer: {
    width: 120,
    height: 80,
    backgroundColor: Colors.grey2,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  form: {
    width: '100%',
    marginBottom: 40,
  },
  termsContainer: {
    marginBottom: 24,
  },
  termsText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
  termsLink: {
    color: '#FFFFFF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  signUpButton: {
    marginBottom: 24,
    // backgroundColor: Colors.main_bule,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  signInLink: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  termsCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  tickMark: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  termsTextContainer: {
    flex: 1,
  },
});

export default SignUpScreen;
