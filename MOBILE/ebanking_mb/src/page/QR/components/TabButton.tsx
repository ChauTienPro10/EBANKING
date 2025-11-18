import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import QRColors from '../styles/colors';
import TextStyles from '../../../constants/textStyle';

interface TabButtonProps {
  iconName: string;
  label: string;
  active: boolean;
  onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({
  iconName,
  label,
  active,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.7}
    >
      <Icon
        name={iconName}
        size={24}
        color={active ? QRColors.primary : QRColors.textLight}
      />
      <Text
        style={[
          styles.label,
          active ? styles.labelActive : styles.labelInactive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 80,
  },
  label: {
    ...TextStyles.systemLight_12,
    marginTop: 4,
    textAlign: 'center',
  },
  labelActive: {
    color: QRColors.primary,
    fontWeight: '600',
  },
  labelInactive: {
    color: QRColors.textLight,
  },
});

export default TabButton;
