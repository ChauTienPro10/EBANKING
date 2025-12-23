import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

interface ChatInputBarProps {
  inputText: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  sending: boolean;
}

/**
 * Chat input bar component with text input and send button
 */
const ChatInputBar: React.FC<ChatInputBarProps> = ({
  inputText,
  onChangeText,
  onSend,
  sending,
}) => {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={inputText}
        onChangeText={onChangeText}
        placeholder="Nhập tin nhắn..."
        placeholderTextColor="#999999"
        multiline
        maxLength={500}
      />
      <TouchableOpacity
        style={[
          styles.sendButton,
          (!inputText.trim() || sending) && styles.sendButtonDisabled,
        ]}
        onPress={onSend}
        disabled={!inputText.trim() || sending}
      >
        <Text style={styles.sendButtonText}>{sending ? '...' : '➤'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default ChatInputBar;
