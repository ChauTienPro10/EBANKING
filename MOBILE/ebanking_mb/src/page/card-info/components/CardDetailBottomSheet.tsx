import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import Colors from '../../../constants/color';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { formatCurrency, mockCardData } from '../mockCardData';

interface CardDetailBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

const { height } = Dimensions.get('window');

const CardDetailBottomSheet: React.FC<CardDetailBottomSheetProps> = ({
  visible,
  onClose,
}) => {
  const account = useSelector(
    (state: RootState) => state.app.accountTransResponse,
  );
  const userInfo = useSelector((state: RootState) => state.app.userInfoData);
  const cardStatus = useSelector((state: RootState) => state.app.cardStatus);

  const formatCardNumber = (value?: string) => {
    if (!value) {
      return '•••• •••• •••• ••••';
    }

    const digitsOnly = value.replace(/\D/g, '');
    if (!digitsOnly) {
      return value;
    }

    return digitsOnly.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatTitleCase = (value?: string) => {
    if (!value) {
      return '';
    }
    return value
      .toLowerCase()
      .split(/[\s_]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (value?: string) => {
    if (!value) {
      return mockCardData.issueDate;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const statusLabel =
    cardStatus === 'locked' ? 'Đang khóa' : 'Đang hoạt động';

  const currencyCode = account?.currency ?? mockCardData.currency;

  const availableBalance =
    account?.balance ?? mockCardData.cardLimit - mockCardData.spentAmount;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.bottomSheet}>
          {/* Handle Bar */}
          <View style={styles.handleBar} />

          <Text style={styles.title}>Chi tiết thẻ</Text>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.detailRow}>
              <Text style={styles.label}>Số thẻ</Text>
              <Text style={styles.value}>
                {formatCardNumber(account?.accountNumber)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Chủ thẻ</Text>
              <Text style={styles.value}>
                {userInfo?.fullName ?? mockCardData.cardHolderName}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Loại thẻ</Text>
              <Text style={styles.value}>
                {formatTitleCase(account?.accountType) || mockCardData.cardType}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Trạng thái</Text>
              <Text style={styles.value}>{statusLabel}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Ngày hết hạn</Text>
              <Text style={styles.value}>
                {mockCardData.expiryMonth}/{mockCardData.expiryYear}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>CVV</Text>
              <Text style={styles.value}>•••</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Ngày phát hành</Text>
              <Text style={styles.value}>{formatDate(account?.openedDate)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Hạn mức thẻ</Text>
              <Text style={styles.valueHighlight}>
                {formatCurrency(mockCardData.cardLimit)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Số dư khả dụng</Text>
              <Text style={styles.valueHighlight}>
                {formatCurrency(availableBalance, currencyCode)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Đơn vị tiền tệ</Text>
              <Text style={styles.value}>{currencyCode}</Text>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.8,
    paddingTop: 12,
    paddingBottom: 34,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: Colors.grey2,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
  },
  content: {
    paddingHorizontal: 24,
    maxHeight: height * 0.6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  label: {
    fontSize: 15,
    color: Colors.grey3,
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  valueHighlight: {
    fontSize: 15,
    color: Colors.main_bule,
    fontWeight: '700',
  },
  closeButton: {
    marginHorizontal: 24,
    marginTop: 20,
    backgroundColor: Colors.main_bule,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default CardDetailBottomSheet;
