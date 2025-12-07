import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../../constants/color';

interface ActionButtonsProps {
  transactionType: string;
  isIncoming: boolean;
  onSupport: () => void;
  onTransferMore: () => void;
  onNewTransaction: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  transactionType,
  isIncoming,
  onSupport,
  onTransferMore,
  onNewTransaction,
}) => {
  return (
    <View style={styles.actionButtons}>
      <TouchableOpacity style={styles.supportButton} onPress={onSupport}>
        <MaterialCommunityIcons
          name="headset"
          size={20}
          color={Colors.main_bule}
        />
        <Text style={styles.supportButtonText}>Liên hệ hỗ trợ</Text>
      </TouchableOpacity>

      <View style={styles.bottomRow}>
        {transactionType === 'TRANSFER' && !isIncoming && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onTransferMore}
          >
            <Text style={styles.secondaryButtonText}>Chuyển thêm</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onNewTransaction}
        >
          <Text style={styles.primaryButtonText}>Giao dịch mới</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ActionButtons;

const styles = StyleSheet.create({
  actionButtons: {
    padding: 16,
    paddingBottom: 24,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.main_bule,
  },
  supportButtonText: {
    fontSize: 15,
    color: Colors.main_bule,
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.main_bule,
  },
  secondaryButtonText: {
    fontSize: 15,
    color: Colors.main_bule,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.main_bule,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    color: '#FFF',
    fontWeight: '600',
  },
});
