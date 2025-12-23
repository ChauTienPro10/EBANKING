import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getAvatarColor, getAvatarText } from '../utils/avatarUtils';
import { isFirstInGroup } from '../utils/messageUtils';

interface TransactionMessageBubbleProps {
  message: any;
  index: number;
  messages: any[];
  otherUserName?: string;
}

/**
 * Transaction notification message bubble component
 * Displays transaction details in a card format
 */
const TransactionMessageBubble: React.FC<TransactionMessageBubbleProps> = ({
  message,
  index,
  messages,
  otherUserName,
}) => {
  const metadata = message.metadata ? JSON.parse(message.metadata) : {};
  const isReceive = metadata.type === 'RECEIVE';

  // Check if this is first message in group (show avatar)
  const nextMessage = index > 0 ? messages[index - 1] : null;
  const isFirst = isFirstInGroup(message, nextMessage);

  // Get avatar text
  const avatarText = () => {
    if (isReceive) {
      const name = metadata.senderName || otherUserName;
      return getAvatarText(name);
    } else {
      const name = metadata.receiverName || otherUserName;
      return getAvatarText(name);
    }
  };

  return (
    <View
      style={[
        styles.messageRow,
        isReceive ? styles.otherMessageRow : styles.myMessageRow,
      ]}
    >
      {/* Avatar or spacer for received transactions */}
      {isReceive &&
        (isFirst ? (
          <View
            style={[
              styles.messageAvatar,
              {
                backgroundColor: getAvatarColor(
                  metadata.senderAccountNumber || otherUserName || '?',
                ),
              },
            ]}
          >
            <Text style={styles.messageAvatarText}>{avatarText()}</Text>
          </View>
        ) : (
          <View style={styles.avatarSpacer} />
        ))}

      {/* Transaction Card */}
      <View
        style={[
          styles.transactionBubble,
          {
            backgroundColor: isReceive ? '#E8F5E9' : '#FFEBEE',
          },
        ]}
      >
        {/* Header with badge and time */}
        <View style={styles.transactionHeader}>
          <View
            style={[
              styles.transactionBadge,
              { backgroundColor: isReceive ? '#4CAF50' : '#F44336' },
            ]}
          >
            <Ionicons
              name={isReceive ? 'arrow-down' : 'arrow-up'}
              size={14}
              color="#FFFFFF"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.badgeText}>
              {isReceive ? 'Đã nhận' : 'Đã gửi'}
            </Text>
          </View>
          <Text style={styles.transactionTime}>
            {new Date(message.createdAt).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}{' '}
            {new Date(message.createdAt).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* Amount */}
        <Text style={styles.transactionAmount}>
          {metadata.amount?.toLocaleString('vi-VN')}đ
        </Text>

        {/* Message content */}
        {metadata.message && (
          <Text style={styles.transactionDescription}>{metadata.message}</Text>
        )}

        {/* From/To user info */}
        {(isReceive ? metadata.senderName : metadata.receiverName) && (
          <Text style={styles.transactionUser}>
            {isReceive
              ? `Từ: ${metadata.senderName || metadata.senderAccountNumber}`
              : `Đến: ${
                  metadata.receiverName || metadata.receiverAccountNumber
                }`}
          </Text>
        )}
      </View>

      {/* Directional arrow indicator */}
      <View style={styles.seenIndicator}>
        <Text style={[styles.sentCheckmark, { fontSize: 16 }]}></Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  avatarSpacer: {
    width: 40,
  },
  transactionBubble: {
    width: 260,
    padding: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  transactionAmount: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 6,
  },
  transactionUser: {
    fontSize: 13,
    color: '#424242',
    marginBottom: 6,
  },
  transactionTime: {
    fontSize: 11,
    color: '#9E9E9E',
  },
  seenIndicator: {
    marginLeft: 6,
    marginBottom: 4,
    alignSelf: 'flex-end',
  },
  sentCheckmark: {
    fontSize: 6,
    color: '#09a0a5',
    fontWeight: 'bold',
  },
});

export default TransactionMessageBubble;
