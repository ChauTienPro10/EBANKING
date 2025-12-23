import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { getAvatarColor, getAvatarText } from '../utils/avatarUtils';
import { formatTime } from '../utils/timeUtils';

interface MessageBubbleProps {
  message: any;
  isMyMessage: boolean;
  isSystemMessage: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  hasReplied: boolean;
  otherUserId?: string;
  otherUserName?: string;
  deliveredMessageIds: Set<string | number>;
  selectedMessageId: string | null;
  onMessagePress: (messageId: string) => void;
}

/**
 * Regular text message bubble component
 * Handles display of text messages with avatars, timestamps, and delivery status
 */
const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMyMessage,
  isSystemMessage,
  isFirstInGroup,
  isLastInGroup,
  hasReplied,
  otherUserId,
  otherUserName,
  deliveredMessageIds,
  selectedMessageId,
  onMessagePress,
}) => {
  // Get avatar text for other user (left side avatar)
  const avatarText = () => {
    if (message.senderId === otherUserId) {
      return getAvatarText(otherUserName);
    }
    return '?';
  };

  // Get avatar text for recipient (seen indicator)
  const recipientAvatarText = () => {
    return getAvatarText(otherUserName);
  };

  return (
    <View
      style={[
        styles.messageRow,
        isMyMessage ? styles.myMessageRow : styles.otherMessageRow,
      ]}
    >
      {/* Avatar or spacer for other user messages */}
      {!isMyMessage &&
        (isFirstInGroup ? (
          <View
            style={[
              styles.messageAvatar,
              {
                backgroundColor: getAvatarColor(
                  otherUserId || otherUserName || '?',
                ),
              },
            ]}
          >
            <Text style={styles.messageAvatarText}>{avatarText()}</Text>
          </View>
        ) : (
          <View style={styles.avatarSpacer} />
        ))}

      {/* Message bubble with tap to show timestamp */}
      <View>
        {/* Bubble and indicator in flex row - indicator aligns with bubble bottom */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              onMessagePress(selectedMessageId === message.id ? '' : message.id)
            }
            style={[
              styles.messageBubble,
              { maxWidth: Dimensions.get('window').width * 0.75 },
              isMyMessage ? styles.myMessage : styles.otherMessage,
              isSystemMessage && styles.systemMessage,
            ]}
          >
            <Text
              style={[styles.messageText, isMyMessage && styles.myMessageText]}
            >
              {message.content}
            </Text>
          </TouchableOpacity>

          {/* Seen status indicator for my messages - aligned with bubble bottom */}
          {isMyMessage && isLastInGroup && !hasReplied && (
            <View style={styles.seenIndicator}>
              {message.isRead ? (
                // STATE 3: SEEN - Show recipient avatar
                <View style={styles.seenAvatar}>
                  <Text style={styles.seenAvatarText}>
                    {recipientAvatarText()}
                  </Text>
                </View>
              ) : deliveredMessageIds.has(message.id) ? (
                // STATE 2: DELIVERED - Filled circle with white checkmark
                <View style={styles.deliveredIndicator}>
                  <Text style={styles.deliveredCheckmark}>✓</Text>
                </View>
              ) : (
                // STATE 1: SENT - White circle with colored checkmark
                <View style={styles.sentIndicator}>
                  <Text style={styles.sentCheckmark}>✓</Text>
                </View>
              )}
            </View>
          )}

          {/* Invisible spacer for alignment when indicator is not shown */}
          {isMyMessage && (!isLastInGroup || hasReplied) && (
            <View style={{ width: 20 }} />
          )}
        </View>

        {/* Timestamp - show below bubble when selected */}
        {selectedMessageId === message.id && (
          <Text
            style={[
              styles.messageTime,
              isMyMessage ? styles.myMessageTime : styles.otherMessageTime,
            ]}
          >
            {formatTime(message.createdAt)}
          </Text>
        )}
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
  messageBubble: {
    maxWidth: '75%',
    padding: 8,
    borderRadius: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#09a0a5',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: '#E0E0E0',
  },
  messageText: {
    fontSize: 16,
    color: '#333333',
    flexWrap: 'wrap',
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 11,
    color: '#999999',
  },
  myMessageTime: {
    textAlign: 'left',
  },
  otherMessageTime: {
    textAlign: 'left',
  },
  seenIndicator: {
    marginLeft: 6,
    marginBottom: 4,
    alignSelf: 'flex-end',
  },
  sentIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#09a0a5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sentCheckmark: {
    fontSize: 6,
    color: '#09a0a5',
    fontWeight: 'bold',
  },
  deliveredIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#09a0a5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveredCheckmark: {
    fontSize: 6,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  seenAvatar: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00BCD4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seenAvatarText: {
    color: '#FFFFFF',
    fontSize: 6,
    fontWeight: 'bold',
  },
});

export default MessageBubble;
