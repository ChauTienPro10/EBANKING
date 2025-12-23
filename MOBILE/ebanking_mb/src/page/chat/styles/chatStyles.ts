import { StyleSheet, Dimensions } from 'react-native';

/**
 * Centralized styles for ChatConversationScreen
 */

export const chatStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    padding: 8,
    flexGrow: 1,
  },
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
  // STATE 1: SENT - White circle with colored checkmark
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
  // STATE 2: DELIVERED - Filled circle with white checkmark
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
  // STATE 3: SEEN - Recipient avatar
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
  badgeTextReceive: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  badgeTextSend: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
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
  transactionBalance: {
    fontSize: 13,
    color: '#757575',
  },
  transactionTime: {
    fontSize: 11,
    color: '#9E9E9E',
  },

  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#09a0a5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
  },
});
