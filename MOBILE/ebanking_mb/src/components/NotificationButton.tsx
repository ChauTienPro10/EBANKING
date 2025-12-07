import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { BellIcon } from './icon';
import GText from './GText';
import Colors from '../constants/color';

interface NotificationButtonProps {
  count: number;
  onPress: () => void;
  iconSize?: number;
  badgeSize?: number;
  badgeColor?: string;
  iconColor?: string;
}

const NotificationButton: React.FC<NotificationButtonProps> = ({
  count,
  onPress,
  iconSize = 20,
  badgeSize = 16,
  badgeColor = Colors.orange,
  iconColor = Colors.white,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.7}
    >
      <BellIcon size={iconSize} color={iconColor} />
      {count > 0 && (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: badgeColor,
              minWidth: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
            },
          ]}
        >
          <GText
            type="systemBold_10"
            color={Colors.white}
            style={styles.badgeText}
          >
            {count > 99 ? '99+' : count}
          </GText>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default NotificationButton;
