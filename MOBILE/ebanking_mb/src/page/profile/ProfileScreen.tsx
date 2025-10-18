import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useCommonUI } from '../../hooks/useCommonUI';
import { Header, CustomButton } from '../../components';
import Colors from '../../constants/color';
import TextStyles from '../../constants/textStyle';
import ProfileHeader from './components/ProfileHeader';
import UserInfoCard from './components/UserInfoCard';
import PersonalInfoSection from './components/PersonalInfoSection';
import ContactInfoSection from './components/ContactInfoSection';
import { useProfileAnimations } from './hooks/useProfileAnimations';

const { width: screenWidth } = Dimensions.get('window');

const ProfileScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const language = useSelector((state: RootState) => state.app.language);
  const { notificationCount } = useCommonUI();

  useEffect(() => {
    if (language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  const [profile, setProfile] = useState({
    fullName: 'Lê Thắng',
    dateOfBirth: '15/03/1995',
    cccd: '123456789012',
    gender: 'Nam',
    address: 'Quận 10, TP. Hồ Chí Minh',
    email: 'thangle@gmail.com',
    phone: '+84-123-456-789',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Use animation hooks
  const {
    scrollY,
    headerHeight,
    avatarOpacity,
    avatarScale,
    cardOpacity,
    createScrollHandler,
  } = useProfileAnimations();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!profile.fullName.trim()) {
      newErrors.fullName = t('profile.validation.full_name_required');
    }

    if (!profile.dateOfBirth.trim()) {
      newErrors.dateOfBirth = t('profile.validation.date_of_birth_required');
    }

    if (!profile.cccd.trim()) {
      newErrors.cccd = t('profile.validation.cccd_required');
    } else if (profile.cccd.length !== 12) {
      newErrors.cccd = t('profile.validation.cccd_invalid');
    }

    if (!profile.email.trim()) {
      newErrors.email = t('profile.validation.email_required');
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = t('profile.validation.email_invalid');
    }

    if (!profile.phone.trim()) {
      newErrors.phone = t('profile.validation.phone_required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
      console.log('Profile saved:', profile);
      // TODO: Call actual API here
      // const response = await api.updateProfile(profile);

      // Exit edit mode after successful save
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle scroll animations
  const handleScroll = createScrollHandler(isCollapsed, setIsCollapsed);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    // Clear errors when entering edit mode
    if (!isEditing) {
      setErrors({});
    }
  };

  const handleSelectFromGallery = () => {
    if (!isEditing) return; // Only allow upload in edit mode
    console.log('Select from gallery clicked');
    // TODO: Implement image picker from gallery
  };

  const handleTakePhoto = () => {
    if (!isEditing) return; // Only allow camera in edit mode
    console.log('Take photo clicked');
    // TODO: Implement camera capture
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Profile Header with Animation */}
      <ProfileHeader
        headerHeight={headerHeight}
        avatarOpacity={avatarOpacity}
        avatarScale={avatarScale}
        isEditing={isEditing}
        onEditToggle={handleEditToggle}
        onSelectFromGallery={handleSelectFromGallery}
        onTakePhoto={handleTakePhoto}
      />

      {/* User Info Card with Animation */}
      <UserInfoCard cardOpacity={cardOpacity} fullName={profile.fullName} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Personal Information Section */}
        <PersonalInfoSection
          profile={profile}
          errors={errors}
          isEditing={isEditing}
          onInputChange={handleInputChange}
        />

        {/* Contact Information Section */}
        <ContactInfoSection
          profile={profile}
          errors={errors}
          isEditing={isEditing}
          onInputChange={handleInputChange}
        />

        {/* Save Button - Only show when editing */}
        {isEditing && (
          <View style={styles.buttonContainer}>
            <CustomButton
              title={isLoading ? 'Loading...' : 'Save Changes'}
              onPress={handleSave}
              variant="primary"
              size="large"
              containerStyle={styles.saveButton}
              disabled={isLoading}
              loading={isLoading}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  // Button styling
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  saveButton: {
    borderRadius: 16,
    shadowColor: Colors.main_bule,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default ProfileScreen;
