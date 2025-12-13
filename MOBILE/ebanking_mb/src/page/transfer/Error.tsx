import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import Colors from '../../constants/color';
import { Header } from '../../components';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'TransactionFailedScreen'
>;

const TransactionFailedScreen: React.FC<Props> = ({ navigation, route }) => {
  const { errorString } = route.params || {};

  const { t } = useTranslation();

  // Handle error message
  const getErrorMessage = () => {
    if (!errorString) {
      return 'Không thể thực hiện giao dịch. Vui lòng thử lại sau.';
    }

    const errorStr = String(errorString).trim();

    // Check for PIN-related errors
    if (
      errorStr.includes('pin is null') ||
      errorStr.includes('pin') ||
      errorStr.includes('PIN')
    ) {
      return 'Bạn chưa thiết lập mã PIN. Vui lòng vào Cài đặt để thiết lập mã PIN trước khi thực hiện giao dịch.';
    }

    // Try to get translation, fallback to error string
    const translationKey = `transfer.error.${errorStr}`;
    const translated = t(translationKey);

    // If translation returns the key itself, it means no translation found
    if (translated === translationKey) {
      return errorStr;
    }

    return translated;
  };

  const handleRetry = () => {
    // If it's a PIN error, navigate to settings instead
    const errorStr = String(errorString || '').trim();
    if (
      errorStr.includes('pin is null') ||
      errorStr.includes('pin') ||
      errorStr.includes('PIN')
    ) {
      navigation.navigate('Settings');
      return;
    }
    navigation.replace('Transfer', {
      receiver: '',
      amount: '',
      content: '',
      bankCode: '',
    });
  };

  const handleBackHome = () => {
    navigation.navigate('Home');
  };

  const isPinError = String(errorString || '')
    .trim()
    .includes('pin');

  return (
    <View style={styles.containerMaster}>
      <Header title="Giao dich thất bại" />

      <View style={styles.container}>
        {/* Warning Icon */}
        <View style={styles.iconContainer}>
          <Icon name="alert-circle" size={80} color={Colors.yellow} />
        </View>

        <Text style={styles.title}>Giao dịch thất bại</Text>
        <Text style={styles.message}>{getErrorMessage()}</Text>

        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryText}>
            {isPinError ? 'Đi tới Cài đặt' : 'Thử lại'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={handleBackHome}>
          <Text style={styles.backText}>Quay về trang chủ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TransactionFailedScreen;

const styles = StyleSheet.create({
  containerMaster: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    width: '90%',
    marginHorizontal: '5%',
    marginVertical: 40,
    paddingVertical: 40,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    // Shadow for Android
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.yellow,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  retryButton: {
    backgroundColor: Colors.yellow,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
    // Shadow for button
    shadowColor: Colors.yellow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  retryText: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backText: {
    color: Colors.main_bule,
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
