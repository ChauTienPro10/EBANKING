import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { QRCodeDisplay, SimpleHeader } from '../components';
import QRColors from '../styles/colors';
import { commonStyles } from '../styles/commonStyles';
import GText from '../../../components/GText';
import CustomButton from '../../../components/CustomButton';
import TextStyles from '../../../constants/textStyle';

const QRReceiveScreen: React.FC = () => {
  const [showCustomize, setShowCustomize] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const accountInfo = {
    name: 'NGUYEN VAN A',
    number: '0123456789',
    bank: 'VietcomBank',
  };

  const handleShare = () => {
    Alert.alert('Chia sẻ', 'Tính năng chia sẻ QR code');
  };

  const handleSave = () => {
    Alert.alert('Lưu mã', 'Đã lưu mã QR vào thư viện');
  };

  const handleUpdateQR = () => {
    if (!amount) {
      Alert.alert('Thông báo', 'Vui lòng nhập số tiền');
      return;
    }
    Alert.alert('Cập nhật', 'Đã cập nhật mã QR với thông tin mới');
    setShowCustomize(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <SimpleHeader
        title="QR Nhận tiền"
        subtitle="Chia sẻ mã để nhận tiền"
        rightIcon="share-2"
        onRightPress={handleShare}
      />

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* QR Code */}
        <View style={styles.qrCodeWrapper}>
          <View style={styles.qrCodeBox}>
            <QRCodeDisplay size={240} showLogo />
          </View>
        </View>

        {/* Account Info */}
        <View style={styles.accountInfo}>
          <InfoRow label="Chủ tài khoản" value={accountInfo.name} />
          <InfoRow label="Số tài khoản" value={accountInfo.number} />
          <InfoRow label="Ngân hàng" value={accountInfo.bank} />
        </View>

        {/* Customize Button */}
        {!showCustomize ? (
          <CustomButton
            title="Tùy chỉnh số tiền"
            variant="outline"
            onPress={() => setShowCustomize(true)}
            containerStyle={styles.customizeBtn}
          />
        ) : (
          /* Customize Form */
          <View style={styles.customizeForm}>
            <View style={styles.customizeHeader}>
              <GText type="systemBold_16" color={QRColors.textPrimary}>
                Tùy chỉnh thông tin
              </GText>
              <TouchableOpacity onPress={() => setShowCustomize(false)}>
                <Icon name="x" size={20} color={QRColors.textLight} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <GText
                type="systemLight_14"
                color={QRColors.textSecondary}
                style={styles.formLabel}
              >
                Số tiền
              </GText>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="Nhập số tiền"
                keyboardType="numeric"
                style={styles.input}
                placeholderTextColor={QRColors.textLight}
              />
            </View>

            <View style={styles.formGroup}>
              <GText
                type="systemLight_14"
                color={QRColors.textSecondary}
                style={styles.formLabel}
              >
                Nội dung chuyển khoản
              </GText>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Nhập nội dung"
                style={styles.input}
                placeholderTextColor={QRColors.textLight}
              />
            </View>

            <CustomButton
              title="Cập nhật mã QR"
              onPress={handleUpdateQR}
              containerStyle={styles.updateBtn}
            />
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={handleShare}
            style={styles.primaryActionButton}
            activeOpacity={0.7}
          >
            <Icon name="share-2" size={20} color={QRColors.textWhite} />
            <GText type="systemBold_16" color={QRColors.textWhite}>
              Chia sẻ
            </GText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSave}
            style={styles.secondaryActionButton}
            activeOpacity={0.7}
          >
            <Icon name="download" size={20} color={QRColors.textPrimary} />
            <GText type="systemBold_16" color={QRColors.textPrimary}>
              Lưu mã
            </GText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// Info Row Component
interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <GText type="systemLight_14" color={QRColors.textSecondary}>
      {label}
    </GText>
    <GText type="systemBold_14" color={QRColors.textPrimary}>
      {value}
    </GText>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: QRColors.background,
  },
  subtitle: {
    opacity: 0.9,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  qrCodeWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrCodeBox: {
    backgroundColor: QRColors.cardBackground,
    padding: 16,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: QRColors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  accountInfo: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  customizeBtn: {
    marginBottom: 16,
  },
  customizeForm: {
    backgroundColor: QRColors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: QRColors.border,
  },
  customizeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    marginBottom: 8,
  },
  input: {
    backgroundColor: QRColors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: QRColors.border,
    borderRadius: 8,
    ...TextStyles.systemLight_16,
    color: QRColors.textPrimary,
  },
  updateBtn: {
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryActionButton: {
    flex: 1,
    backgroundColor: QRColors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryActionButton: {
    flex: 1,
    backgroundColor: QRColors.cardBackground,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: QRColors.border,
  },
});

export default QRReceiveScreen;
