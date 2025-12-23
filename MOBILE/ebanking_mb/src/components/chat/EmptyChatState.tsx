import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface EmptyChatStateProps {
  onRefresh?: () => void;
}

const EmptyChatState: React.FC<EmptyChatStateProps> = ({ onRefresh }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon name="chatbubbles-outline" size={80} color="#CCCCCC" />
      </View>

      <Text style={styles.title}>Chưa có cuộc trò chuyện</Text>
      <Text style={styles.subtitle}>
        Tin nhắn sẽ xuất hiện khi bạn chat{'\n'}hoặc chuyển tiền cho người khác
      </Text>

      {onRefresh && (
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Icon name="refresh" size={20} color="#4CAF50" />
          <Text style={styles.refreshText}>Làm mới</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  refreshText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default EmptyChatState;
