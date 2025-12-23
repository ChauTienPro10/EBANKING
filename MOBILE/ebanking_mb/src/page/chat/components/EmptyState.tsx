import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EmptyStateProps {
  message?: string;
  submessage?: string;
}

/**
 * Empty state component for chat when no messages exist
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'Chưa có tin nhắn',
  submessage = 'Bắt đầu cuộc trò chuyện!',
}) => {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>{message}</Text>
      <Text style={styles.emptySubtext}>{submessage}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default EmptyState;
