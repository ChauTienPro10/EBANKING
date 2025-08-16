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
import LeftIcon from '../components/icon/LeftIcon';
import Fingerprint from '../components/icon/Fingerprint';
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

type SignUpScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SignUp'>;

const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSignUp = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const isFormValid = name.length > 0 && email.length > 0 && password.length > 0 && acceptTerms;

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
              <Text style={styles.greeting}>Xin chào, tạo tài khoản mới</Text>

              <View style={styles.centralIconContainer}>
                <View style={styles.userIconContainer}>
                  <UserIcon size={60} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.form}>
                <CustomInput
                  placeholder="Họ và tên"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  leftIcon={<UserIcon size={20} color="#6B7280" />}
                />

                <CustomInput
                  placeholder="Email hoặc số điện thoại"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  leftIcon={<UserIcon size={20} color="#6B7280" />}
                />

                <CustomInput
                  placeholder="Mật khẩu"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  leftIcon={<LockIcon size={20} color="#6B7280" />}
                />

                {/* Terms and Conditions Checkbox */}
                <TouchableOpacity
                  style={styles.termsCheckboxContainer}
                  onPress={() => setAcceptTerms(!acceptTerms)}
                >
                  <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                    {acceptTerms && <Text style={styles.tickMark}>✓</Text>}
                  </View>
                  <View style={styles.termsTextContainer}>
                    <Text style={styles.termsText}>
                      Bằng việc tạo tài khoản, bạn đồng ý với{' '}
                      <Text style={styles.termsLink}>Điều khoản và Điều kiện</Text>
                    </Text>
                  </View>
                </TouchableOpacity>

                <CustomButton
                  title="Đăng ký"
                  onPress={handleSignUp}
                  loading={isLoading}
                  disabled={!isFormValid}
                  containerStyle={styles.signUpButton}
                />
              </View>

              <View style={styles.signInContainer}>
                <Text style={styles.signInText}>Đã có tài khoản? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                  <Text style={styles.signInLink}>Đăng nhập</Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  signInText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
  },
  signInLink: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  termsCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
