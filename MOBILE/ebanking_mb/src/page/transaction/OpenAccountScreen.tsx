import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Colors from '../../constants/color';
import { Header } from '../../components';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LoadingPopup from '../../popups/LoadingPopup';
import fetch from '../../utils/fetch';
import { API } from '../../constants/api';
import AccountNumberPickerPopup from '../../popups/AccountNumberPickerPopup';
import Toast from 'react-native-toast-message';
import { AppDispatch, store } from '../../store';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchAccountTransInfo } from '../../store/fetchAPI/AccountFetch';

type OpenCardNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OpenCard'
>;
type OpenCardRouteProp = RouteProp<RootStackParamList, 'OpenCard'>;

const OpenAccountScreen: React.FC = () => {
  const route = useRoute<OpenCardRouteProp>();
  const navigation = useNavigation<OpenCardNavigationProp>();
  const { userInfo } = route.params;
  const [loading, setLoading] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const dispatch: AppDispatch = store.dispatch;
  const loginResponse = useSelector(
    (State: RootState) => State.app.loginResponse,
  );

  const handleSubmit = async (code: string, type: string) => {
    setLoading(true);
    const url = API.OPEN_ACCOUNT_TRANSACTION;
    const payload = {
      accountNumber: code,
      accountType: type,
      userId: userInfo?.id,
    };
    try {
      const response = await fetch.post(url, payload, true);
      Toast.show({
        type: 'success',
        text1: 'Liên kết tài khoản thành công!',
        text2: 'Bạn có thể tiếp tục sử dụng dịch vụ.',
        visibilityTime: 2000,
      });

      if (loginResponse?.id) {
        dispatch(fetchAccountTransInfo(loginResponse.id));
      }
      navigation.navigate('Home' as never);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Liên kết tài khoản thất bại.',
        text2: 'Vui long liên hệ tư vấn khách hàng để được hộ trợ',
        visibilityTime: 2000,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <LoadingPopup visible={loading} message="Đang xử lý..." />
      <AccountNumberPickerPopup
        visible={popupVisible}
        onClose={() => setPopupVisible(false)}
        onSelect={(code, type) => handleSubmit(code, type)}
      />
      <Header title="Xác nhận thông tin" />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formSection}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Họ và tên</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.fieldInput}
                placeholder="Nhập họ và tên"
                value={userInfo?.fullName}
                editable={false}
                placeholderTextColor={Colors.grey1}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Số điện thoại</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.fieldInput}
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
                value={userInfo?.phone || 'Chưa cập nhật'}
                editable={false}
                placeholderTextColor={Colors.grey1}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Số CMND/CCCD</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.fieldInput}
                placeholder="Nhập số CMND/CCCD"
                keyboardType="numeric"
                value={userInfo?.citizenId}
                editable={false}
                placeholderTextColor={Colors.grey1}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.fieldInput}
                placeholder="Nhập email"
                keyboardType="email-address"
                value={userInfo?.email || 'Chưa cập nhật'}
                editable={false}
                placeholderTextColor={Colors.grey1}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Địa chỉ liên hệ</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.fieldInput, styles.textArea]}
                placeholder="Nhập địa chỉ liên hệ"
                multiline
                numberOfLines={3}
                value={userInfo?.address}
                editable={false}
                placeholderTextColor={Colors.grey1}
              />
            </View>
          </View>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              setPopupVisible(true);
            }}
          >
            <Text style={styles.primaryButtonText}>Mở tài khoản</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              navigation.navigate('Profile' as never);
            }}
          >
            <Text style={styles.secondaryButtonText}>Chỉnh sửa thông tin</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default OpenAccountScreen;

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  formSection: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.grey3,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fieldInput: {
    paddingVertical: 13,
    paddingHorizontal: 14,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '400',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
    paddingTop: 13,
  },
  actionSection: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.main_bule,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.main_bule,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.main_bule,
  },
  secondaryButtonText: {
    color: Colors.main_bule,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
