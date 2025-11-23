import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Colors from '../../constants/color';
import GText from '../../components/GText';
import { API } from '../../constants/api';
import fetch from '../../utils/fetch';
import {
  ChatbubbleIcon,
  ChevronBackIcon,
  MessageSquareIcon,
  PhoneIcon,
} from '../../components/icon';
import { RootStackParamList } from '../../navigation/types';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
};

const ChatScreen: React.FC = () => {
  type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);

  const flatListRef = useRef<FlatList<Message>>(null);
  const botReplyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loginResponse = useSelector((state: RootState) => state.app.loginResponse);

  const quickReplies = useMemo(
    () => [
      { id: 'transfer', label: t('chatbot.suggestions.transfer'), payload: t('chatbot.prompts.transfer') },
      { id: 'card', label: t('chatbot.suggestions.card'), payload: t('chatbot.prompts.card') },
      { id: 'promotion', label: t('chatbot.suggestions.promotion'), payload: t('chatbot.prompts.promotion') },
      { id: 'limit', label: t('chatbot.suggestions.limit'), payload: t('chatbot.prompts.limit') },
      { id: 'qr', label: t('chatbot.suggestions.qr'), payload: t('chatbot.prompts.qr') },
    ],
    [t],
  );

  useEffect(() => {
    setMessages([
      createMessage(t('chatbot.responses.greeting'), 'bot'),
      createMessage(t('chatbot.responses.helper'), 'bot'),
    ]);

    return () => {
      if (botReplyTimeout.current) {
        clearTimeout(botReplyTimeout.current);
      }
    };
  }, [t]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  useEffect(() => {
    if (messages.length) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  const getBotResponse = useCallback(
    async (text: string) => {
      const normalized = text.toLowerCase();

      const matcher =  (keywords: string[]) =>
        keywords.some((keyword) => normalized.includes(keyword));

      if (matcher(['transfer', 'chuyển', 'gửi tiền'])) {
        return t('chatbot.responses.transfer');
      }

      if (matcher(['card', 'thẻ'])) {
        return t('chatbot.responses.card');
      }

      if (matcher(['promo', 'ưu đãi', 'khuyến mãi'])) {
        return t('chatbot.responses.promotion');
      }

      if (matcher(['limit', 'hạn mức'])) {
        return t('chatbot.responses.limit');
      }

      if (matcher(['qr', 'scan', 'quét'])) {
        return t('chatbot.responses.qr');
      }

      // return t('chatbot.responses.default');
      const url = API.ASK;
      try {
        const res = await fetch.post(url, {
          username: loginResponse?.username,
          text,
        }, false);

        if (res && res.answer) {
          return res.answer;
        }

        return 'Xin lỗi hiện hệ thống đang gặp sự cố, vui lòng quay lại sau';
      } catch (error) {
        return 'Lỗi xử lý yêu cầu';
      }
    },
    [t],
  );

  const handleSend = useCallback(
    (presetMessage?: string) => {
      const trimmed = (presetMessage ?? inputValue).trim();
      if (!trimmed) {
        return;
      }

      const userMessage = createMessage(trimmed, 'user');
      setMessages((prev) => [...prev, userMessage]);
      setInputValue('');
      setIsBotTyping(true);

      if (botReplyTimeout.current) {
        clearTimeout(botReplyTimeout.current);
      }

      botReplyTimeout.current = setTimeout(async () => {
        const response = await getBotResponse(trimmed);
        setMessages((prev) => [...prev, createMessage(response, 'bot')]);
        setIsBotTyping(false);
      }, 0);
    },
    [getBotResponse, inputValue],
  );

  const handleQuickReply = useCallback(
    (payload?: string) => {
      if (!payload) {
        return;
      }
      handleSend(payload);
    },
    [handleSend],
  );

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';

    return (
      <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowBot]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
          <GText
            type="systemLight_14"
            color={isUser ? Colors.white : Colors.textPrimary}
          >
            {item.text}
          </GText>
          <GText
            type="systemLight_12"
            color={isUser ? 'rgba(255,255,255,0.8)' : Colors.textSecondary}
            style={styles.timestamp}
          >
            {formatTime(item.timestamp)}
          </GText>
        </View>
      </View>
    );
  };

  const renderAssistantCard = () => (
    <View style={styles.assistantCard}>
      <View style={styles.assistantAvatar}>
        <ChatbubbleIcon size={24} color={Colors.white} />
      </View>
      <View style={styles.assistantInfo}>
        <GText type="systemMedium_16" color={Colors.white}>
          {t('chatbot.welcome_title')}
        </GText>
        <GText
          type="systemLight_12"
          color="rgba(255,255,255,0.8)"
          style={styles.assistantSubtitle}
        >
          {t('chatbot.welcome_subtitle')}
        </GText>
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <GText type="systemLight_12" color="rgba(255,255,255,0.9)">
            {t('chatbot.status_online')}
          </GText>
        </View>
      </View>
      <TouchableOpacity
        style={styles.hotlineButton}
        onPress={() => console.log('Hotline pressed')}
        activeOpacity={0.7}
      >
        <PhoneIcon size={20} color={Colors.main_bule} />
      </TouchableOpacity>
    </View>
  );

  const renderTypingIndicator = () => {
    if (!isBotTyping) {
      return null;
    }

    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <View style={styles.typingDots}>
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
          </View>
          <GText type="systemLight_12" color={Colors.textSecondary}>
            {t('chatbot.typing')}
          </GText>
        </View>
      </View>
    );
  };

  const keyboardVerticalOffset = Platform.select({
    ios: 90,
    android: 0,
    default: 0,
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <ChevronBackIcon size={22} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <GText type="systemBold_20" color={Colors.white}>
              {t('chatbot.title')}
            </GText>
            <GText type="systemLight_12" color="rgba(255,255,255,0.8)" style={styles.headerSubtitle}>
              {t('chatbot.subtitle')}
            </GText>
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          <View style={styles.chatArea}>
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messageList}
              ListHeaderComponent={renderAssistantCard}
              ListFooterComponent={renderTypingIndicator}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <GText type="systemMedium_16" color={Colors.textPrimary}>
                    {t('chatbot.empty_state_title')}
                  </GText>
                  <GText
                    type="systemLight_14"
                    color={Colors.textSecondary}
                    style={styles.emptyStateSubtitle}
                  >
                    {t('chatbot.empty_state_description')}
                  </GText>
                </View>
              }
              onContentSizeChange={scrollToBottom}
            />
          </View>

          <View style={styles.quickRepliesWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickRepliesContainer}
            >
              {quickReplies.map((reply) => (
                <TouchableOpacity
                  key={reply.id}
                  style={styles.quickReplyChip}
                  onPress={() => handleQuickReply(reply.payload)}
                  activeOpacity={0.8}
                >
                  <GText type="systemLight_14" color={Colors.textPrimary}>
                    {reply.label}
                  </GText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder={t('chatbot.placeholder')}
              placeholderTextColor={Colors.textSecondary}
              value={inputValue}
              onChangeText={setInputValue}
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => handleSend()}
              activeOpacity={0.8}
            >
              <MessageSquareIcon size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const createMessage = (text: string, sender: Message['sender']): Message => ({
  id: `${sender}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
  text,
  sender,
  timestamp: new Date().toISOString(),
});

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.main_bule,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.main_bule,
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerSubtitle: {
    marginTop: 4,
  },
  flex: {
    flex: 1,
  },
  chatArea: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  assistantCard: {
    backgroundColor: Colors.main_bule,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  assistantAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assistantInfo: {
    flex: 1,
  },
  assistantSubtitle: {
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.main_green,
    marginRight: 6,
  },
  hotlineButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowBot: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: Colors.main_bule,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },
  timestamp: {
    marginTop: 6,
  },
  typingContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  typingBubble: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignSelf: 'flex-start',
  },
  typingDots: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.grey3,
    marginRight: 6,
  },
  quickRepliesWrapper: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  quickRepliesContainer: {
    paddingHorizontal: 16,
  },
  quickReplyChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    marginRight: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textInput: {
    flex: 1,
    maxHeight: 80,
    color: Colors.textPrimary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.main_bule,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyStateSubtitle: {
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ChatScreen;