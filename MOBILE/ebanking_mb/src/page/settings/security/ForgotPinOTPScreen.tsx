import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Header } from "../../../components";
import { useTranslation } from "react-i18next";

const ForgotPinOTPScreen = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");

  const handleSendOTP = () => {
    if (!email.trim()) {
      Alert.alert(t("forgot_pin_otp.errorTitle"), t("forgot_pin_otp.validation.empty"));
      return;
    }
    console.log("Đang gửi mã OTP đến:", email);
    // TODO: Gọi API gửi OTP
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      {/* Header */}
      <Header title={t("forgot_pin_otp.title")} showBackButton />

      {/* Nội dung */}
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          {t("forgot_pin_otp.subtitle")}
        </Text>

        {/* Ô nhập email/sđt */}
        <TextInput
          style={styles.input}
          placeholder={t("forgot_pin_otp.placeholder")}
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.button} onPress={handleSendOTP}>
          <Text style={styles.buttonText}>{t("forgot_pin_otp.button")}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ForgotPinOTPScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    marginTop: 30,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#444",
    fontSize: 16,
    marginBottom: 30,
    lineHeight: 22,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 25,
  },
  button: {
    width: "100%",
    backgroundColor: "#8B0000",
    borderRadius: 10,
    paddingVertical: 14,
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
