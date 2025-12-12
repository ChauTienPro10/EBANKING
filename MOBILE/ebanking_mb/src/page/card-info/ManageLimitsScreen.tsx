import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Colors from '../../constants/color';
import Header from '../../components/Header';
import PinInput from '../../components/PinInput';
import fetch from '../../utils/fetch';
import { API } from '../../constants/api';

const ManageLimitsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const loginResponse = useSelector(
    (state: RootState) => state.app.loginResponse,
  );
  const userInfo = useSelector((state: RootState) => state.app.userInfoData);

  const [dailyLimit, setDailyLimit] = useState('');
  const [singleLimit, setSingleLimit] = useState('');
  const [currentLimits, setCurrentLimits] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInputKey, setPinInputKey] = useState(0);

  // System maximum limits
  const SYSTEM_MAX_DAILY = 50000000;
  const SYSTEM_MAX_SINGLE = 10000000;
  const MIN_LIMIT = 100000;

  useEffect(() => {
    fetchCurrentLimits();
  }, []);

  const fetchCurrentLimits = async () => {
    try {
      setLoading(true);
      const response = await fetch.get(
        `${API.GET_USER_LIMITS}/${userInfo?.id}`,
        {}, // params (empty object)
        true, // authRequire
      );

      if (response) {
        setCurrentLimits(response);
        setDailyLimit(response.dailyLimit.toString());
        setSingleLimit(response.singleTransactionLimit.toString());
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể tải thông tin hạn mức',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (value: string): string => {
    const number = value.replace(/[^0-9]/g, '');
    if (!number) return '';
    return parseInt(number).toLocaleString('vi-VN');
  };

  const parseMoney = (value: string): number => {
    return parseInt(value.replace(/[^0-9]/g, '') || '0');
  };

  const validateLimits = (): boolean => {
    const daily = parseMoney(dailyLimit);
    const single = parseMoney(singleLimit);

    if (daily < MIN_LIMIT || single < MIN_LIMIT) {
      Toast.show({
        type: 'error',
        text1: 'Hạn mức không hợp lệ',
        text2: `Hạn mức tối thiểu là ${MIN_LIMIT.toLocaleString('vi-VN')} ₫`,
      });
      return false;
    }

    if (daily > SYSTEM_MAX_DAILY) {
      Toast.show({
        type: 'error',
        text1: 'Vượt hạn mức hệ thống',
        text2: `Hạn mức ngày tối đa là ${SYSTEM_MAX_DAILY.toLocaleString(
          'vi-VN',
        )} ₫`,
      });
      return false;
    }

    if (single > SYSTEM_MAX_SINGLE) {
      Toast.show({
        type: 'error',
        text1: 'Vượt hạn mức hệ thống',
        text2: `Hạn mức giao dịch đơn tối đa là ${SYSTEM_MAX_SINGLE.toLocaleString(
          'vi-VN',
        )} ₫`,
      });
      return false;
    }

    if (single > daily) {
      Toast.show({
        type: 'error',
        text1: 'Hạn mức không hợp lệ',
        text2: 'Hạn mức giao dịch đơn không được lớn hơn hạn mức ngày',
      });
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateLimits()) return;
    setShowPinModal(true);
  };

  const handlePinComplete = async (pin: string) => {
    try {
      setSaving(true);

      // Verify PIN
      const pinPayload = {
        username: loginResponse?.username,
        pinCode: pin,
      };

      const pinResponse = await fetch.post(API.CHECK_PIN, pinPayload, true);

      if (!pinResponse) {
        Toast.show({
          type: 'error',
          text1: 'Sai mã PIN',
          text2: 'Vui lòng thử lại',
        });
        setPinInputKey(prev => prev + 1);
        return;
      }

      // Update limits
      const updatePayload = {
        dailyLimit: parseMoney(dailyLimit),
        singleTransactionLimit: parseMoney(singleLimit),
      };

      const updateResponse = await fetch.put(
        `${API.UPDATE_USER_LIMITS}/${userInfo?.id}`,
        updatePayload,
        true,
      );

      if (updateResponse) {
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: 'Đã cập nhật hạn mức giao dịch',
        });
        setShowPinModal(false);
        navigation.goBack();
      }
    } catch (error: any) {
      const message =
        error?.message?.replace('INTERNAL: ', '') ||
        'Không thể cập nhật hạn mức';
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: message,
      });
      setPinInputKey(prev => prev + 1);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Quản lý hạn mức" showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.main_bule} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Quản lý hạn mức" showBackButton />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Lưu ý</Text>
          <Text style={styles.infoText}>
            • Hạn mức giao dịch đơn không được lớn hơn hạn mức ngày{'\n'}• Hạn
            mức tối thiểu: {MIN_LIMIT.toLocaleString('vi-VN')} ₫{'\n'}• Cần xác
            thực mã PIN để thay đổi hạn mức
          </Text>
        </View>

        {/* Daily Limit */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Hạn mức ngày</Text>
          <TextInput
            style={styles.input}
            value={formatMoney(dailyLimit)}
            onChangeText={text => setDailyLimit(text)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={Colors.grey3}
          />
          <Text style={styles.helperText}>
            Tối đa: {SYSTEM_MAX_DAILY.toLocaleString('vi-VN')} ₫
          </Text>
        </View>

        {/* Single Transaction Limit */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Hạn mức giao dịch đơn</Text>
          <TextInput
            style={styles.input}
            value={formatMoney(singleLimit)}
            onChangeText={text => setSingleLimit(text)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={Colors.grey3}
          />
          <Text style={styles.helperText}>
            Tối đa: {SYSTEM_MAX_SINGLE.toLocaleString('vi-VN')} ₫
          </Text>
        </View>

        {/* Current Usage */}
        {currentLimits && (
          <View style={styles.usageCard}>
            <Text style={styles.usageTitle}>Sử dụng hôm nay</Text>
            <Text style={styles.usageAmount}>
              {currentLimits.usedAmount.toLocaleString('vi-VN')} ₫
            </Text>
            <Text style={styles.usageSubtext}>
              Còn lại: {currentLimits.remainingAmount.toLocaleString('vi-VN')} ₫
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* PIN Modal */}
      <Modal
        visible={showPinModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPinModal(false)}
      >
        <View style={styles.pinModalOverlay}>
          <View style={styles.pinModalContent}>
            <Text style={styles.pinModalTitle}>Xác nhận thay đổi</Text>
            <Text style={styles.pinModalSubtitle}>
              Nhập mã PIN để xác nhận thay đổi hạn mức
            </Text>
            <PinInput
              key={pinInputKey}
              length={4}
              onComplete={handlePinComplete}
              create={false}
              hasBiometric={false}
            />
            <TouchableOpacity
              style={styles.pinModalCancel}
              onPress={() => {
                setShowPinModal(false);
                setPinInputKey(prev => prev + 1);
              }}
            >
              <Text style={styles.pinModalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  infoCard: {
    backgroundColor: Colors.main_bule + '10',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: Colors.grey3,
    lineHeight: 18,
  },
  inputCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  input: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    borderBottomWidth: 2,
    borderBottomColor: Colors.main_bule,
    paddingVertical: 8,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 11,
    color: Colors.grey3,
  },
  usageCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  usageTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.grey3,
    marginBottom: 8,
  },
  usageAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.main_bule,
    marginBottom: 4,
  },
  usageSubtext: {
    fontSize: 12,
    color: Colors.grey3,
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  saveButton: {
    backgroundColor: Colors.main_bule,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  pinModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pinModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  pinModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  pinModalSubtitle: {
    fontSize: 14,
    color: Colors.grey3,
    marginBottom: 24,
    textAlign: 'center',
  },
  pinModalCancel: {
    marginTop: 16,
    paddingVertical: 12,
  },
  pinModalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.grey3,
  },
});

export default ManageLimitsScreen;
