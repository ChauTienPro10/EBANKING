import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getAvatarColor, getAvatarText } from '../utils/avatarUtils';

interface ChatHeaderProps {
  otherUserName?: string;
  otherUserId?: string;
  isConnected: boolean;
  onBackPress: () => void;
}

/**
 * Chat conversation header component
 * Displays user avatar, name, and online status
 */
const ChatHeader: React.FC<ChatHeaderProps> = ({
  otherUserName,
  otherUserId,
  isConnected,
  onBackPress,
}) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: getAvatarColor(
              otherUserId || otherUserName || '?',
            ),
          },
        ]}
      >
        <Text style={styles.avatarText}>{getAvatarText(otherUserName)}</Text>
      </View>
      <View>
        <Text style={styles.userName}>{otherUserName || otherUserId}</Text>
        <Text style={styles.status}>
          {isConnected ? 'Đang hoạt động' : 'Ngoại tuyến'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  status: {
    fontSize: 12,
    color: '#E0F7F8',
  },
});

export default ChatHeader;
