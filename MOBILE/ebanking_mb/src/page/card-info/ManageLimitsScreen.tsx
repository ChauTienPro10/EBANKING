import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { setPinActionTimestamp } from '../../store/slices/appSlice';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import Colors from '../../constants/color';
import Header from '../../components/Header';
import fetch from '../../utils/fetch';
import { API } from '../../constants/api';
import { formatCurrencyByLanguage } from '../../utils/currency';
import i18n from '../../../i18n';

const ManageLimitsScreen: React.FC = () => {
  const { t } = useTranslation();
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
        text1: t('common.error'),
        text2: t('card.manage_limits_error_load'),
      });
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (value: string): string => {
    // Remove all non-digit characters
    const number = value.replace(/[^0-9]/g, '');
    if (!number) return '';

    const currentLanguage = i18n.language;
    const numValue = parseInt(number);

    // If English, the stored value is VND, display as USD
    if (currentLanguage === 'en') {
      const usdAmount = numValue / 25000;
      return usdAmount.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }

    // Vietnamese - display VND
    return numValue.toLocaleString('vi-VN');
  };

  const handleDailyLimitChange = (text: string) => {
    // Extract only numbers
    const numbers = text.replace(/[^0-9]/g, '');

    const currentLanguage = i18n.language;

    // If English, user is typing USD, convert to VND for storage
    if (currentLanguage === 'en') {
      const usdValue = parseInt(numbers || '0');
      const vndValue = usdValue * 25000;
      setDailyLimit(vndValue.toString());
    } else {
      // Vietnamese - store VND directly
      setDailyLimit(numbers);
    }
  };

  const handleSingleLimitChange = (text: string) => {
    // Extract only numbers
    const numbers = text.replace(/[^0-9]/g, '');

    const currentLanguage = i18n.language;

    // If English, user is typing USD, convert to VND for storage
    if (currentLanguage === 'en') {
      const usdValue = parseInt(numbers || '0');
      const vndValue = usdValue * 25000;
      setSingleLimit(vndValue.toString());
    } else {
      // Vietnamese - store VND directly
      setSingleLimit(numbers);
    }
  };

  const parseMoney = (value: string): number => {
    // Value is already in VND, just parse it
    return parseInt(value.replace(/[^0-9]/g, '') || '0');
  };

  const validateLimits = (): boolean => {
    const daily = parseMoney(dailyLimit);
    const single = parseMoney(singleLimit);

    if (daily < MIN_LIMIT || single < MIN_LIMIT) {
      Toast.show({
        type: 'error',
        text1: t('card.manage_limits_error_invalid'),
        text2: t('card.manage_limits_error_min', {
          minLimit: formatCurrencyByLanguage(MIN_LIMIT),
        }),
      });
      return false;
    }

    if (daily > SYSTEM_MAX_DAILY) {
      Toast.show({
        type: 'error',
        text1: t('card.manage_limits_error_exceed_system'),
        text2: t('card.manage_limits_error_daily_max', {
          maxLimit: formatCurrencyByLanguage(SYSTEM_MAX_DAILY),
        }),
      });
      return false;
    }

    if (single > SYSTEM_MAX_SINGLE) {
      Toast.show({
        type: 'error',
        text1: t('card.manage_limits_error_exceed_system'),
        text2: t('card.manage_limits_error_single_max', {
          maxLimit: formatCurrencyByLanguage(SYSTEM_MAX_SINGLE),
        }),
      });
      return false;
    }

    if (single > daily) {
      Toast.show({
        type: 'error',
        text1: t('card.manage_limits_error_invalid'),
        text2: t('card.manage_limits_error_single_exceed_daily'),
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateLimits()) return;

    try {
      setSaving(true);

      // Update limits directly without PIN verification
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
        // Set timestamp to trigger grace period in CardScreen
        dispatch(setPinActionTimestamp(Date.now()));

        Toast.show({
          type: 'success',
          text1: t('card.manage_limits_success_title'),
          text2: t('card.manage_limits_success_message'),
        });

        // Delay navigation to let user see the toast
        setTimeout(() => {
          navigation.goBack();
        }, 2500);
      }
    } catch (error: any) {
      const message =
        error?.message?.replace('INTERNAL: ', '') ||
        t('card.manage_limits_error_update');
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title={t('card.manage_limits_title')} showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.main_bule} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('card.manage_limits_title')} showBackButton />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            {t('card.manage_limits_info_title')}
          </Text>
          <Text style={styles.infoText}>
            {t('card.manage_limits_info_text', {
              minLimit: formatCurrencyByLanguage(MIN_LIMIT),
            })}
          </Text>
        </View>

        {/* Daily Limit */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>
            {t('card.manage_limits_daily_label')}
          </Text>
          <TextInput
            style={styles.input}
            value={formatMoney(dailyLimit)}
            onChangeText={handleDailyLimitChange}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={Colors.grey3}
          />
          <Text style={styles.helperText}>
            {t('card.manage_limits_max_label', {
              maxLimit: formatCurrencyByLanguage(SYSTEM_MAX_DAILY),
            })}
          </Text>
        </View>

        {/* Single Transaction Limit */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>
            {t('card.manage_limits_single_label')}
          </Text>
          <TextInput
            style={styles.input}
            value={formatMoney(singleLimit)}
            onChangeText={handleSingleLimitChange}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={Colors.grey3}
          />
          <Text style={styles.helperText}>
            {t('card.manage_limits_max_label', {
              maxLimit: formatCurrencyByLanguage(SYSTEM_MAX_SINGLE),
            })}
          </Text>
        </View>

        {/* Current Usage */}
        {currentLimits && (
          <View style={styles.usageCard}>
            <Text style={styles.usageTitle}>
              {t('card.manage_limits_usage_title')}
            </Text>
            <Text style={styles.usageAmount}>
              {formatCurrencyByLanguage(currentLimits.usedAmount)}
            </Text>
            <Text style={styles.usageSubtext}>
              {t('card.manage_limits_usage_remaining', {
                amount: formatCurrencyByLanguage(currentLimits.remainingAmount),
              })}
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
            <Text style={styles.saveButtonText}>
              {t('card.manage_limits_save_button')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  infoText: {
    fontSize: 12,
    color: Colors.grey3,
    lineHeight: 16,
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
});

export default ManageLimitsScreen;
