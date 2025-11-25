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
import { formatCurrency } from '../mockCardData';

interface CardDetailBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  cardData: {
    cardNumber: string;
    cardHolderName: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    cardType: string;
    issueDate: string;
    cardLimit: number;
    availableBalance: number;
  };
}

const { height } = Dimensions.get('window');

const CardDetailBottomSheet: React.FC<CardDetailBottomSheetProps> = ({
  visible,
  onClose,
  cardData,
}) => {
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

          {/* Title */}
          <Text style={styles.title}>Chi tiết thẻ</Text>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Card Number */}
            <View style={styles.detailRow}>
              <Text style={styles.label}>Số thẻ</Text>
              <Text style={styles.value}>{cardData.cardNumber}</Text>
            </View>

            {/* Card Holder */}
            <View style={styles.detailRow}>
              <Text style={styles.label}>Chủ thẻ</Text>
              <Text style={styles.value}>{cardData.cardHolderName}</Text>
            </View>

            {/* Card Type */}
            <View style={styles.detailRow}>
              <Text style={styles.label}>Loại thẻ</Text>
              <Text style={styles.value}>{cardData.cardType}</Text>
            </View>

            {/* Expiry Date */}
            <View style={styles.detailRow}>
              <Text style={styles.label}>Ngày hết hạn</Text>
              <Text style={styles.value}>
                {cardData.expiryMonth}/{cardData.expiryYear}
              </Text>
            </View>

            {/* CVV */}
            <View style={styles.detailRow}>
              <Text style={styles.label}>CVV</Text>
              <Text style={styles.value}>•••</Text>
            </View>

            {/* Issue Date */}
            <View style={styles.detailRow}>
              <Text style={styles.label}>Ngày phát hành</Text>
              <Text style={styles.value}>{cardData.issueDate}</Text>
            </View>

            {/* Card Limit */}
            <View style={styles.detailRow}>
              <Text style={styles.label}>Hạn mức thẻ</Text>
              <Text style={styles.valueHighlight}>
                {formatCurrency(cardData.cardLimit)}
              </Text>
            </View>

            {/* Available Balance */}
            <View style={styles.detailRow}>
              <Text style={styles.label}>Số dư khả dụng</Text>
              <Text style={styles.valueHighlight}>
                {formatCurrency(cardData.availableBalance)}
              </Text>
            </View>
          </ScrollView>

          {/* Close Button */}
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
