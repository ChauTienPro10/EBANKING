import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import QRColors from '../styles/colors';
import TextStyles from '../../../constants/textStyle';

interface CountdownTimerProps {
  seconds: number;
  onRefresh: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  seconds,
  onRefresh,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Mã tự động cập nhật sau</Text>
      <Text style={styles.time}>{seconds}s</Text>
      <TouchableOpacity
        onPress={onRefresh}
        style={styles.refreshButton}
        activeOpacity={0.7}
      >
        <Icon name="refresh-cw" size={16} color={QRColors.primary} />
        <Text style={styles.refreshText}>Làm mới mã</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  label: {
    ...TextStyles.systemLight_14,
    color: QRColors.textSecondary,
    marginBottom: 8,
  },
  time: {
    ...TextStyles.systemBold_24,
    color: QRColors.primary,
    fontSize: 32,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  refreshText: {
    ...TextStyles.systemMedium_14,
    color: QRColors.primary,
  },
});

export default CountdownTimer;
