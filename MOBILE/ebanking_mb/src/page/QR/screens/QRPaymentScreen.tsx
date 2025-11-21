import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  QRCodeDisplay,
  AccountSelector,
  BarcodeDisplay,
  SimpleHeader,
} from '../components';
import QRColors from '../styles/colors';
import { commonStyles } from '../styles/commonStyles';
import GText from '../../../components/GText';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../../../constants/color';
import { useQRPayment } from '../hooks';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../navigation/types';

type QRNavigation = StackNavigationProp<RootStackParamList>;

const QRPaymentScreen: React.FC = () => {
  const navigation = useNavigation<QRNavigation>();
  const {
    isLoading,
    error: apiError,
    qrData,
    countdown,
    isAuthenticated,
    selectedAccount,
    accounts,
    verifyPin,
    refreshQR,
    selectAccount,
  } = useQRPayment();

  const [showPinModal, setShowPinModal] = useState(true);
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [pinError, setPinError] = useState('');
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handlePinChange = async (text: string, index: number) => {
    if (!/^\d$/.test(text) && text !== '') return;

    const newPin = [...pin];
    newPin[index] = text;
    setPin(newPin);
    setPinError('');

    // Auto focus next input
    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit when all filled
    if (newPin.every(digit => digit !== '')) {
      const pinString = newPin.join('');

      // Call API to verify PIN
      const success = await verifyPin(pinString);

      if (success) {
        setShowPinModal(false);
      } else {
        setPinError(apiError || 'Mã PIN không đúng');
        setPin(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !pin[index] && index > 0) {
      const newPin = [...pin];
      newPin[index - 1] = '';
      setPin(newPin);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleRefresh = async () => {
    await refreshQR();
  };

  const handleAccountPress = () => {
    // TODO: Open account selection modal with accounts list
    console.log('Available accounts:', accounts);
  };

  return (
    <View style={styles.container}>
      {/* PIN Authentication Modal */}
      <Modal
        visible={showPinModal}
        transparent
        animationType="slide"
        onRequestClose={() => {}}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Icon
              name="lock-closed"
              size={48}
              color={QRColors.primary}
              style={styles.modalIcon}
            />
            <GText type="systemBold_20" style={styles.modalTitle}>
              Xác thực thanh toán
            </GText>
            <GText type="systemLight_14" style={styles.modalSubtitle}>
              Nhập mã PIN để hiển thị QR thanh toán
            </GText>

            {/* Custom PIN Input */}
            <View style={styles.pinContainer}>
              {pin.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => {
                    inputRefs.current[index] = ref;
                  }}
                  style={styles.pinInput}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={text => handlePinChange(text, index)}
                  onKeyPress={e => handleKeyPress(e, index)}
                  secureTextEntry
                  autoFocus={index === 0}
                />
              ))}
            </View>

            {pinError ? (
              <GText type="systemLight_12" style={styles.errorText}>
                {pinError}
              </GText>
            ) : null}

            {isLoading && (
              <ActivityIndicator
                color={QRColors.primary}
                style={styles.loader}
              />
            )}

            <GText type="systemLight_12" style={styles.hintText}>
              Demo PIN: 1111
            </GText>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <SimpleHeader
        title="QR Thanh toán"
        subtitle="Đưa mã cho thu ngân để thanh toán"
        rightIcon="refresh-cw"
        onRightPress={handleRefresh}
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[commonStyles.card, styles.qrCard]}>
          {/* QR Code Container */}
          <View style={styles.qrSection}>
            {isLoading && !qrData ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={QRColors.primary} />
                <GText
                  type="systemLight_14"
                  color={QRColors.textSecondary}
                  style={styles.loadingText}
                >
                  Đang tạo mã QR...
                </GText>
              </View>
            ) : qrData ? (
              <>
                <View style={styles.qrCodeWrapper}>
                  <QRCodeDisplay size={260} data={qrData.qrContent} showLogo />
                </View>

                {/* Barcode */}
                <View style={styles.barcodeWrapper}>
                  <BarcodeDisplay data={qrData.barcodeContent} />
                </View>
              </>
            ) : null}
          </View>

          {/* Countdown Info */}
          {isAuthenticated && qrData && (
            <View style={styles.countdownContainer}>
              <GText type="systemLight_14" color={QRColors.textSecondary}>
                Tự động cập nhật sau{' '}
                <GText type="systemBold_16" color={QRColors.primary}>
                  {countdown}s
                </GText>
              </GText>
              <TouchableOpacity onPress={handleRefresh} disabled={isLoading}>
                <GText
                  type="systemBold_14"
                  color={isLoading ? QRColors.textSecondary : QRColors.primary}
                >
                  {isLoading ? 'Đang tải...' : 'Cập nhật'}
                </GText>
              </TouchableOpacity>
            </View>
          )}

          {/* Error Message */}
          {apiError && !isLoading && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={20} color="#EF4444" />
              <GText type="systemLight_14" style={styles.apiErrorText}>
                {apiError}
              </GText>
            </View>
          )}

          {/* Additional Info */}
          <View style={styles.infoSection}>
            <TouchableOpacity style={styles.infoButton}>
              <Icon
                name="information-circle-outline"
                size={20}
                color={Colors.main_bule}
              />
              <GText type="systemLight_14" color={Colors.main_bule}>
                Xem ưu đãi hoặc nhập mã
              </GText>
              <Icon name="chevron-forward" size={20} color={Colors.main_bule} />
            </TouchableOpacity>
          </View>

          {/* Account Section */}
          <View style={styles.accountSection}>
            <GText type="systemLight_12" color={QRColors.textSecondary}>
              Tài khoản/Thẻ
            </GText>
            {selectedAccount && (
              <AccountSelector
                accountName={selectedAccount.name}
                balance={`${selectedAccount.balance.toLocaleString('vi-VN')}đ`}
                onPress={handleAccountPress}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: QRColors.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: QRColors.cardBackground,
    borderRadius: 24,
    padding: 32,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: QRColors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  pinInput: {
    width: 56,
    height: 56,
    borderWidth: 2,
    borderColor: Colors.grey1,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: Colors.black,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 8,
  },
  loader: {
    marginTop: 12,
  },
  hintText: {
    color: QRColors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  apiErrorText: {
    color: '#EF4444',
  },
  subtitle: {
    opacity: 0.9,
    marginTop: 4,
  },
  content: {
    flex: 1,
    backgroundColor: QRColors.background,
  },
  contentContainer: {
    padding: 20,
  },
  qrCard: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 24,
  },
  qrSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  qrCodeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  barcodeWrapper: {
    width: '100%',
    paddingHorizontal: 24,
  },
  countdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  infoSection: {
    width: '100%',
    marginBottom: 20,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  accountSection: {
    width: '100%',
    gap: 8,
  },
});

export default QRPaymentScreen;
