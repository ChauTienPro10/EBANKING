import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface PaymentReminderModalProps {
  visible: boolean;
  onClose: () => void;
  onSend: (amount: string, message: string) => void;
}

const QUICK_MESSAGES = [
  '🍔 Tiền ăn uống nha!',
  '🎨 Mình nhắc bạn!',
  '☕ Tiền cà phê!',
];

/**
 * Payment Reminder Modal
 * Allows user to send a payment reminder with amount and message
 */
const PaymentReminderModal: React.FC<PaymentReminderModalProps> = ({
  visible,
  onClose,
  onSend,
}) => {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('👉 Mình nhắc bạn!');

  // Format number with thousand separators
  const formatCurrency = (value: string): string => {
    if (!value) return '';
    // Remove all non-digit characters
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    // Format with thousand separators
    return parseInt(numericValue, 10).toLocaleString('vi-VN');
  };

  // Get raw numeric value
  const getRawAmount = (formattedValue: string): string => {
    return formattedValue.replace(/\D/g, '');
  };

  const handleAmountChange = (text: string) => {
    // Remove all non-digit characters and format
    const numericValue = text.replace(/\D/g, '');
    setAmount(numericValue);
  };

  const handleSend = () => {
    if (amount.trim()) {
      onSend(amount, message);
      // Reset form
      setAmount('');
      setMessage('👉 Mình nhắc bạn!');
      onClose();
    }
  };

  const handleQuickMessage = (quickMsg: string) => {
    setMessage(quickMsg);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Nhắc trả tiền</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#424242" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Card Container for Amount, Message, and Quick Messages */}
            <View style={styles.cardContainer}>
              {/* Amount Display/Input */}
              <View style={styles.amountDisplaySection}>
                <TextInput
                  style={styles.amountDisplay}
                  value={formatCurrency(amount) + (amount ? 'đ' : '')}
                  onChangeText={handleAmountChange}
                  placeholder="0đ"
                  placeholderTextColor="#CCCCCC"
                  keyboardType="numeric"
                  textAlign="center"
                />
                {/* Underline */}
                {/* <View style={styles.amountUnderline} /> */}
              </View>

              {/* Message Input */}
              <View style={styles.inputSection}>
                <Text style={styles.label}>
                  Lời nhắn ({message.length}/200)
                </Text>
                <View style={styles.messageInputContainer}>
                  <TextInput
                    style={styles.messageInput}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Nhập lời nhắn..."
                    placeholderTextColor="#999999"
                    multiline
                    maxLength={200}
                  />
                </View>
              </View>

              {/* Quick Message Suggestions */}
              <View style={styles.quickMessagesContainer}>
                {QUICK_MESSAGES.map((msg, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickMessageButton}
                    onPress={() => handleQuickMessage(msg)}
                  >
                    <Text style={styles.quickMessageText}>{msg}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Send Button */}
            <TouchableOpacity
              style={[
                styles.sendButton,
                !amount.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!amount.trim()}
            >
              <Text style={styles.sendButtonText}>Nhắc trả tiền</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  cardContainer: {
    backgroundColor: '#F5F5F5',
    marginHorizontal: 14,
    marginTop: 14,
    marginBottom: 14,
    borderRadius: 14,
    padding: 14,
  },
  amountDisplaySection: {
    alignItems: 'center',
  },
  amountDisplay: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#212121',
  },
  // amountUnderline: {
  //   height: 3,
  //   backgroundColor: '#09a0a5',
  //   width: 100,
  //   borderRadius: 2,
  // },

  inputSection: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  messageInputContainer: {
    borderWidth: 1,
    borderColor: '#09a0a5',
    borderRadius: 12,
    padding: 12,
    minHeight: 50,
  },
  messageInput: {
    fontSize: 16,
    color: '#212121',
    textAlignVertical: 'top',
  },
  quickMessagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 0,
    gap: 8,
  },
  quickMessageButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  quickMessageText: {
    fontSize: 14,
    color: '#424242',
  },

  sendButton: {
    backgroundColor: '#09a0a5',
    marginHorizontal: 20,
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

export default PaymentReminderModal;
