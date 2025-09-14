import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import CustomInput from "../components/CustomInput";
import BackgroundDecoration from "../components/BackgroundDecoration";
import Fingerprint from "../components/icon/Fingerprint";
import LockIcon from "../components/icon/LockIcon";
import UserIcon from "../components/icon/UserIcon";
import EyeIcon from "../components/icon/EyeIcon";
import EyeOffIcon from "../components/icon/EyeOffIcon";
import Header from "../components/Header";
import api from "../../src/utils/fetch.ts"

import { useTranslation } from 'react-i18next';
import Colors from "../constants/color";
import GText from "../components/GText";
import { API } from "../constants/api";
import { useDispatch } from 'react-redux';  
import { setLoginStatus, setLoginResponse  } from "../store/slices/appSlice.ts";
type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

type SignInScreenNavigationProp = StackNavigationProp<AuthStackParamList, "SignIn">;

const SignInScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const navigation = useNavigation<SignInScreenNavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    const url = API.LOGIN;
    const payload = {
      username: email,
      password: password  
    }

    try {
      const response = await api.post(url, payload, false)
      dispatch(setLoginResponse(response));
      dispatch(setLoginStatus(true));
    } catch(error) {
      console.error('Login failed:', error);
    }

  };

  const handleFingerprintLogin = () => {
  };

  return (
    <BackgroundDecoration>
      <Header title={t('sign_in.text_login')} showBackButton={true} />

      <View style={styles.container}>
        <View style={styles.centralIconContainer}>
          <View style={styles.signInIconContainer}>
            <UserIcon size={60} color={Colors.grey1} />
          </View>
        </View>

        <CustomInput
          placeholder={t('sign_in.text_email')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={<UserIcon size={20} color={Colors.grey3} />}
        />
        <View style={{ height: 10 }}> </View>

        <CustomInput
          placeholder={t('sign_in.text_password')}
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
        <View style={{ height: 10 }}> </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("ForgotPassword")}
          style={styles.forgotPassword}
          accessible
          accessibilityLabel="Quên mật khẩu"
        >
          <GText type="systemLight_16" color={Colors.grey1}>{t('sign_in.text_forgot_password')}</GText>
        </TouchableOpacity>

        {/* Sign In Button */}
        <TouchableOpacity
          style={styles.signInButton}
          onPress={handleSignIn}
          disabled={isLoading}
          accessible
          accessibilityLabel="Đăng nhập"
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <GText type="systemLight_18" color={Colors.white}>{t('sign_in.text_login')}</GText>
          )}
        </TouchableOpacity>

        {/* Fingerprint Login */}
        <TouchableOpacity
          style={styles.fingerprintButton}
          onPress={handleFingerprintLogin}
          accessible
          accessibilityLabel="Đăng nhập bằng vân tay"
        >
          <Fingerprint size={32} color={Colors.red} />
          <GText type="systemLight_18" color={Colors.grey1} style={{ paddingHorizontal: 10 }}>{t('sign_in.text_fingerint_login')}</GText>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <GText type="systemLight_14" color={Colors.grey1}>{t('sign_in.text_not_have_account')}</GText>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <GText type="systemLight_14" color={Colors.main_bule} style={styles.signUpLink}>{t('sign_in.text_sign_up')}</GText>
          </TouchableOpacity>
        </View>
      </View>
    </BackgroundDecoration>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: Colors.white
  },
  backButton: {
    marginBottom: 16,
  },

  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },

  signInButton: {
    backgroundColor: Colors.main_bule,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  fingerprintButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.grey2,
    marginBottom: 24,
  },

  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },

  signUpLink: {
    paddingHorizontal: 10
  },
  centralIconContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  signInIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.main_grey,
    justifyContent: "center",
    alignItems: "center",
  },
});
