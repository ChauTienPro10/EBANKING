import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GText from './GText';
import Colors from '../constants/color';
import { ChevronBackIcon } from './icon';
import NotificationButton from './NotificationButton';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  showNotification?: boolean;
  notificationCount?: number;
  onNotificationPress?: () => void;
  onBackPress?: () => void;
  iconSize?: number;
  badgeSize?: number;
  badgeColor?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = true,
  showNotification = false,
  notificationCount = 0,
  onNotificationPress,
  onBackPress,
  iconSize = 24,
  badgeSize = 20,
  badgeColor = Colors.red,
}) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.navigate('Home' as never);
    }
  };

  return (
    <View style={styles.container}>
      {showBackButton ? (
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ChevronBackIcon size={24} color={Colors.white} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      <GText type="systemBold_20" color={Colors.white} style={styles.title}>
        {title}
      </GText>

      {showNotification ? (
        <NotificationButton
          count={notificationCount}
          onPress={onNotificationPress || (() => {})}
          iconSize={iconSize}
          badgeSize={badgeSize}
          badgeColor={badgeColor}
        />
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.main_bule,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    alignItems: 'center',
    textAlign: 'center',
  },
  placeholder: {
    width: 24,
  },
});

export default Header;
