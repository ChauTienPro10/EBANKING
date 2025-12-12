import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SearchIcon, BellIcon, UserIcon } from '../../../components/icon';
import { Avatar } from '../../../components';
import Colors from '../../../constants/color';
import NotificationButton from '../../../components/NotificationButton';

interface HomeHeaderProps {
  bankName: string;
  userName: string;
  userAvatarUrl?: string;
  notificationCount: number;
  onNotificationPress: () => void;
  headerPaddingBottom: Animated.Value;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
  bankName,
  userName,
  userAvatarUrl,
  notificationCount,
  onNotificationPress,
  headerPaddingBottom,
}) => {
  return (
    <>
      <Animated.View
        style={[styles.headerContainer, { paddingBottom: headerPaddingBottom }]}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>{bankName}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton}>
              <SearchIcon size={20} color={Colors.white} />
            </TouchableOpacity>
            <NotificationButton
              count={notificationCount}
              onPress={onNotificationPress}
              iconSize={20}
              badgeSize={16}
              badgeColor={Colors.orange}
            />
          </View>
        </View>
      </Animated.View>

      <View style={styles.profileSectionWrapper}>
        <View style={styles.profileSection}>
          <View style={styles.profileContainer}>
            {userAvatarUrl ? (
              <Avatar src={userAvatarUrl} size={50} showBorder={false} />
            ) : (
              <View style={styles.avatarContainer}>
                <UserIcon size={24} color={Colors.white} />
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.profileGreeting}>{userName}</Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.main_bule,
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    padding: 8,
    marginLeft: 8,
    position: 'relative',
  },
  profileSectionWrapper: {
    backgroundColor: Colors.main_bule,
    paddingHorizontal: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileGreeting: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default HomeHeader;
