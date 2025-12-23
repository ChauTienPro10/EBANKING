import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  onPress: () => void;
}

interface QuickActionsBarProps {
  onTransferPress: () => void;
  onPaymentReminderPress: () => void;
  onQuickGiftPress: () => void;
}

/**
 * Quick action buttons bar for chat
 * Displays three action buttons: Transfer, Payment Reminder, Quick Gift
 */
const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  onTransferPress,
  onPaymentReminderPress,
  onQuickGiftPress,
}) => {
  const actions: QuickAction[] = [
    {
      id: 'transfer',
      label: 'Chuyển tiền',
      icon: '💸',
      onPress: onTransferPress,
    },
    {
      id: 'reminder',
      label: 'Nhắc trả tiền',
      icon: '💰',
      onPress: onPaymentReminderPress,
    },
    {
      id: 'gift',
      label: 'Tặng quà',
      icon: '🎁',
      onPress: onQuickGiftPress,
    },
  ];

  return (
    <View style={styles.container}>
      {actions.map(action => (
        <TouchableOpacity
          key={action.id}
          style={styles.actionButton}
          onPress={action.onPress}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{action.icon}</Text>
          </View>
          <Text style={styles.label}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 12,
    color: '#424242',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default QuickActionsBar;
