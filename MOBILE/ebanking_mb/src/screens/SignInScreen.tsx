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
import LeftIcon from "../components/icon/LeftIcon";
import Fingerprint from "../components/icon/Fingerprint";
import LockIcon from "../components/icon/LockIcon";
import UserIcon from "../components/icon/UserIcon";
import EyeIcon from "../components/icon/EyeIcon";
import EyeOffIcon from "../components/icon/EyeOffIcon";
import SignInIcon from "../components/icon/SignInIcon";

type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

type SignInScreenNavigationProp = StackNavigationProp<AuthStackParamList, "SignIn">;

const SignInScreen: React.FC = () => {
  const navigation = useNavigation<SignInScreenNavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      // TODO: call API login tại đây
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Đăng nhập với:", { email, password });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFingerprintLogin = () => {
    console.log("Đăng nhập bằng vân tay");
    // TODO: Implement fingerprint authentication
  };

  return (
    <BackgroundDecoration>
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessible
            accessibilityLabel="Quay lại"
        >
          <LeftIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.title}>Đăng nhập</Text>

        {/* Central Icon */}
        <View style={styles.centralIconContainer}>
          <View style={styles.signInIconContainer}>
            <SignInIcon size={60} color="#FFFFFF" />
          </View>
        </View>

        {/* Input Email */}
        <CustomInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<UserIcon size={20} color="#6B7280" />}
        />

        {/* Input Password với toggle mắt */}
        <CustomInput
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            leftIcon={<LockIcon size={20} color="#6B7280" />}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOffIcon size={20} color="#6B7280" />
                ) : (
                  <EyeIcon size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            }
        />

        {/* Forgot Password */}
        <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
            style={styles.forgotPassword}
            accessible
            accessibilityLabel="Quên mật khẩu"
        >
          <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
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
              <ActivityIndicator color="#FFFFFF" />
          ) : (
              <Text style={styles.signInButtonText}>Đăng nhập</Text>
          )}
        </TouchableOpacity>

        {/* Fingerprint Login */}
        <TouchableOpacity
            style={styles.fingerprintButton}
            onPress={handleFingerprintLogin}
            accessible
            accessibilityLabel="Đăng nhập bằng vân tay"
        >
          <Fingerprint size={32} color="#FFFFFF" />
          <Text style={styles.fingerprintText}>Đăng nhập bằng vân tay</Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Bạn chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={styles.signUpLink}>Đăng ký</Text>
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
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 32,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  signInButton: {
    backgroundColor: "#1E40AF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  fingerprintButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 24,
  },
  fingerprintText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  signUpText: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  signUpLink: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  centralIconContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  signInIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
});
