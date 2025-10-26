import React from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header, Avatar, GText } from '../../../components';
import Colors from '../../../constants/color';

interface ProfileHeaderProps {
  isEditing: boolean;
  onEditToggle: () => void;
  onSelectFromGallery: () => void;
  onTakePhoto: () => void;
  headerHeight: Animated.Value;
  avatarOpacity: Animated.Value;
  avatarScale: Animated.Value;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  isEditing,
  onEditToggle,
  onSelectFromGallery,
  onTakePhoto,
  headerHeight,
  avatarOpacity,
  avatarScale,
}) => {
  const { t } = useTranslation();

  return (
    <Animated.View style={[styles.unifiedHeader, { height: headerHeight }]}>
      {/* Top Navigation - Always visible */}
      <View style={styles.topNavigation}>
        <Header
          title={t('profile.title')}
          showBackButton={true}
          showNotification={false}
        />
        <TouchableOpacity
          onPress={onEditToggle}
          style={styles.modernEditButton}
        >
          <View style={styles.editButtonContent}>
            <GText
              type="systemMedium_14"
              color={Colors.white}
              style={styles.editButtonText}
            >
              {isEditing ? t('common.cancel') : t('profile.edit')}
            </GText>
          </View>
        </TouchableOpacity>
      </View>

      {/* Avatar Section with Animation */}
      <Animated.View
        style={[
          styles.integratedAvatarSection,
          {
            opacity: avatarOpacity,
            transform: [{ scale: avatarScale }],
          },
        ]}
      >
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarContainer}>
            <Avatar
              src="https://i.pravatar.cc/150?img=12"
              size={100}
              onPress={onSelectFromGallery}
            />
            <TouchableOpacity
              style={styles.modernCameraButton}
              onPress={onTakePhoto}
            >
              <View style={styles.cameraIconWrapper}>
                <View style={styles.plusIcon}>
                  <View style={styles.plusHorizontal} />
                  <View style={styles.plusVertical} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  unifiedHeader: {
    backgroundColor: Colors.main_bule,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1000,
    minHeight: 80,
  },
  topNavigation: {
    position: 'relative',
    paddingTop: 10,
    zIndex: 1001,
  },
  modernEditButton: {
    position: 'absolute',
    top: 15,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 1002,
  },
  editButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  integratedAvatarSection: {
    alignItems: 'center',
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    bottom: 0,
  },
  avatarWrapper: {
    alignItems: 'center',
  },

  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },

  modernCameraButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#FF6B6B',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cameraIconWrapper: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusHorizontal: {
    width: 12,
    height: 2,
    backgroundColor: Colors.white,
    borderRadius: 1,
    position: 'absolute',
  },
  plusVertical: {
    width: 2,
    height: 12,
    backgroundColor: Colors.white,
    borderRadius: 1,
    position: 'absolute',
  },
});

export default ProfileHeader;
