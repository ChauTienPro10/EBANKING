import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Gift {
  id: string;
  name: string;
  price: number;
  emoji: string;
}

interface QuickGiftModalProps {
  visible: boolean;
  onClose: () => void;
  onSend: (gift: Gift) => void;
}

const GIFTS: Gift[] = [
  { id: '1', name: 'Trà sữa', price: 12140, emoji: '🧋' },
  { id: '2', name: 'Trà sữa', price: 20000, emoji: '🧋' },
  { id: '3', name: 'Bánh sinh nhật', price: 39999, emoji: '🎂' },
  { id: '4', name: 'Kim cương', price: 40000, emoji: '💎' },
  { id: '5', name: 'Xe hơi', price: 50000, emoji: '🚗' },
  { id: '6', name: 'Hoa', price: 66666, emoji: '💐' },
  { id: '7', name: 'Gấu bông', price: 66686, emoji: '🧸' },
  { id: '8', name: 'Tên lửa', price: 88888, emoji: '🚀' },
  { id: '9', name: 'Nước hoa', price: 99999, emoji: '🧴' },
];

/**
 * Quick Gift Modal
 * Allows user to select and send virtual gifts
 */
const QuickGiftModal: React.FC<QuickGiftModalProps> = ({
  visible,
  onClose,
  onSend,
}) => {
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);

  const handleSend = () => {
    if (selectedGift) {
      onSend(selectedGift);
      setSelectedGift(null);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Tặng quà nhanh</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#424242" />
            </TouchableOpacity>
          </View>

          {/* Info Text */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Số tiền đi kèm món quà sẽ được chuyển thẳng vào tài khoản của
              người nhận
            </Text>
          </View>

          {/* Gift Grid */}
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.giftGrid}>
              {GIFTS.map(gift => (
                <TouchableOpacity
                  key={gift.id}
                  style={[
                    styles.giftItem,
                    selectedGift?.id === gift.id && styles.giftItemSelected,
                  ]}
                  onPress={() => setSelectedGift(gift)}
                >
                  <View style={styles.giftIconContainer}>
                    <Text style={styles.giftEmoji}>{gift.emoji}</Text>
                  </View>
                  <Text style={styles.giftPrice}>
                    {gift.price.toLocaleString('vi-VN')}đ
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Send Button */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              !selectedGift && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!selectedGift}
          >
            <Text style={styles.sendButtonText}>
              {selectedGift
                ? `Tặng quà ${selectedGift.price.toLocaleString('vi-VN')}đ`
                : 'Chọn món quà'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  closeButton: {
    padding: 4,
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#E3F2FD',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1976D2',
    textAlign: 'center',
  },
  giftGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 16,
    gap: 12,
  },
  giftItem: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  giftItemSelected: {
    borderColor: '#09a0a5',
    backgroundColor: '#E0F7F8',
  },
  giftIconContainer: {
    marginBottom: 8,
  },
  giftEmoji: {
    fontSize: 40,
  },
  giftPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#424242',
    textAlign: 'center',
  },
  sendButton: {
    backgroundColor: '#09a0a5',
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QuickGiftModal;
