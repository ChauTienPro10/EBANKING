import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated,
  BackHandler,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useCommonUI } from '../../hooks/useCommonUI';
import { CustomButton } from '../../components';
import AvatarUploadModal from '../../components/AvatarUploadModal';
import Colors from '../../constants/color';
import ProfileHeader from './components/ProfileHeader';
import UserInfoCard from './components/UserInfoCard';
import PersonalInfoSection from './components/PersonalInfoSection';
import ContactInfoSection from './components/ContactInfoSection';
import { useProfileAnimations } from './hooks/useProfileAnimations';
import { useAvatarUpload } from '../../hooks/useAvatarUpload';
import fetch from '../../utils/fetch';
import { API } from '../../constants/api';
import PasswordPopup from '../../popups/RequirePassword';
import LoadingPopup from '../../popups/LoadingPopup';
import { AppDispatch, store } from '../../store';
import { fetchUserInfo } from '../../store/fetchAPI/UserInfoFetch';
import Toast from 'react-native-toast-message';

const { width: screenWidth } = Dimensions.get('window');

import { isEkycExpired } from '../../utils/ekycUtils';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const language = useSelector((state: RootState) => state.app.language);
  const userInfo = useSelector((state: RootState) => state.app.userInfoData);
  const loginResponse = useSelector(
    (State: RootState) => State.app.loginResponse,
  );
  const dispatch: AppDispatch = store.dispatch;

  // Check if eKYC is expired
  const ekycExpired =
    userInfo?.ekycStatus === 'VERIFIED' &&
    isEkycExpired(userInfo?.ekycVerifiedAt);

  // Refresh user info when screen is focused (e.g., after completing eKYC)
  useFocusEffect(
    useCallback(() => {
      if (loginResponse?.id) {
        console.log('📱 ProfileScreen focused - refreshing user info');
        dispatch(fetchUserInfo(loginResponse.id));
      }
    }, [loginResponse?.id, dispatch]),
  );

  // Handle hardware back button - navigate to Home instead of going back
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Navigate to Home tab
        navigation.navigate('Home' as never);
        return true; // Prevent default back behavior
      };

      // Add event listener (returns subscription)
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      // Cleanup using subscription.remove()
      return () => subscription.remove();
    }, [navigation]),
  );

  useEffect(() => {
    const formatBirthday = (birthday: any): string => {
      if (!birthday) return '---';
      try {
        const timestamp =
          typeof birthday === 'string' ? parseInt(birthday) : birthday;
        if (!isNaN(timestamp)) {
          const date = new Date(timestamp);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        }
      } catch (e) {
        console.error('Error formatting birthday:', e);
      }
      return String(birthday);
    };

    const parseGender = (isMale: any): string => {
      if (isMale === undefined || isMale === null) return '---';
      if (typeof isMale === 'boolean') return isMale ? 'Nam' : 'Nữ';
      if (typeof isMale === 'string') {
        return isMale === 'true' || isMale.toLowerCase() === 'nam'
          ? 'Nam'
          : 'Nữ';
      }
      return '---';
    };

    setProfile({
      fullName: userInfo?.fullName ? userInfo.fullName.toUpperCase() : '---',
      dateOfBirth: formatBirthday(userInfo?.birthday),
      cccd: userInfo?.citizenId ? userInfo.citizenId : '---',
      gender: parseGender(userInfo?.isMale),
      address: userInfo?.address ? userInfo.address : '---',
      email: userInfo?.email ? userInfo.email : '---',
      phone: userInfo?.phone ? userInfo.phone : '---',
    });
  }, [userInfo]);

  const [profile, setProfile] = useState({
    fullName: '---',
    dateOfBirth: '---',
    cccd: '---',
    gender: '---',
    address: '---',
    email: '---',
    phone: '---',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Avatar upload hook
  const { isUploading, handleSelectFromGallery, handleTakePhoto } =
    useAvatarUpload();

  const onSubmitUpdate = async (password: string) => {
    const payload = {
      fullName: profile.fullName !== '---' ? profile.fullName : '',
      email: profile.email !== '---' ? profile.email : '',
      phone: profile.phone !== '---' ? profile.phone : '',
      address: profile.address !== '---' ? profile.address : '',
      birthday: profile.dateOfBirth !== '---' ? profile.dateOfBirth : '',
      isMale: profile.gender === 'Nam' ? true : false,
      username: loginResponse?.username,
      password: password,
    };
    const data = await fetch.post(API.UPDATE_USER_INFO, payload, true);
    if (loginResponse?.id !== undefined) {
      dispatch(fetchUserInfo(loginResponse.id));
      Toast.show({
        type: 'info',
        text1: t('profile.update_success_title'),
        text2: t('profile.update_success_message'),
      });
    }
  };

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

  const handleSave = async (password: string) => {
    setIsLoading(true);
    if (!validateForm()) {
      return;
    }
    try {
      await onSubmitUpdate(password);
      if (loginResponse?.id !== undefined) {
        dispatch(fetchUserInfo(loginResponse.id));
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      Toast.show({
        type: 'error',
        text1: t('profile.update_error_title'),
        text2: t('profile.update_error_message'),
      });
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

  const handleAvatarPress = () => {
    setShowAvatarModal(true);
  };

  const handleInputChange = (field: string, value: string) => {
    let newValue = value;

    if (field === 'dateOfBirth') {
      let digits = value.replace(/\D/g, '');
      if (digits.length > 2 && digits.length <= 4) {
        digits = digits.slice(0, 2) + '-' + digits.slice(2);
      } else if (digits.length > 4) {
        digits =
          digits.slice(0, 2) +
          '-' +
          digits.slice(2, 4) +
          '-' +
          digits.slice(4, 8);
      }
      newValue = digits;
    }

    setProfile(prev => ({ ...prev, [field]: newValue }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LoadingPopup
        visible={isLoading || isUploading}
        message={
          isUploading
            ? t('profile.uploading_avatar')
            : t('profile.loading_message')
        }
      />

      <PasswordPopup
        visible={showPasswordPopup}
        message={t('profile.password_prompt')}
        onClose={() => setShowPasswordPopup(false)}
        onSubmit={password => {
          handleSave(password);
          setShowPasswordPopup(false);
        }}
      />

      <AvatarUploadModal
        visible={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        onSelectGallery={handleSelectFromGallery}
        onTakePhoto={handleTakePhoto}
      />

      {/* Profile Header with Animation */}
      <ProfileHeader
        headerHeight={headerHeight}
        avatarOpacity={avatarOpacity}
        avatarScale={avatarScale}
        isEditing={isEditing}
        onEditToggle={handleEditToggle}
        onAvatarPress={handleAvatarPress}
      />

      {/* User Info Card with Animation */}
      <UserInfoCard cardOpacity={cardOpacity} fullName={profile.fullName} />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={120}
        keyboardShouldPersistTaps="handled"
      >
        {/* eKYC Verification Section */}
        {userInfo?.ekycStatus === 'VERIFIED' ? (
          <View style={styles.ekycSection}>
            <View style={styles.ekycHeader}>
              <Ionicons
                name={ekycExpired ? 'warning' : 'shield-checkmark'}
                size={24}
                color={ekycExpired ? Colors.warning : Colors.success}
              />
              <Text style={styles.ekycTitle}>
                {t('profile.ekyc_section_title')}
              </Text>
            </View>

            <View
              style={ekycExpired ? styles.ekycBadgeWarning : styles.ekycBadge}
            >
              <Ionicons
                name={ekycExpired ? 'alert-circle' : 'checkmark-circle'}
                size={20}
                color={ekycExpired ? Colors.warning : Colors.success}
              />
              <Text
                style={
                  ekycExpired
                    ? styles.ekycNotVerifiedText
                    : styles.ekycVerifiedText
                }
              >
                {ekycExpired ? 'Đã hết hạn' : t('profile.ekyc_verified')}
              </Text>
            </View>

            <Text style={styles.ekycDate}>
              {t('profile.ekyc_verified_date')}:{' '}
              {userInfo.ekycVerifiedAt
                ? new Date(userInfo.ekycVerifiedAt).toLocaleDateString('vi-VN')
                : '---'}
            </Text>

            <TouchableOpacity
              style={styles.ekycDetailButton}
              onPress={() => navigation.navigate('EKYCDetail' as never)}
            >
              <Text style={styles.ekycDetailButtonText}>
                {t('profile.ekyc_view_details')}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.main_bule}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.ekycSection}>
            <View style={styles.ekycHeader}>
              <Ionicons name="shield-outline" size={24} color={Colors.grey3} />
              <Text style={styles.ekycTitle}>
                {t('profile.ekyc_section_title')}
              </Text>
            </View>

            <View style={styles.ekycBadgeWarning}>
              <Ionicons name="alert-circle" size={20} color={Colors.warning} />
              <Text style={styles.ekycNotVerifiedText}>
                {t('profile.ekyc_not_verified')}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.ekycVerifyButton}
              onPress={() => navigation.navigate('EKYC' as never)}
            >
              <Text style={styles.ekycVerifyButtonText}>
                {t('profile.ekyc_verify_now')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

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
              title={isLoading ? t('common.loading') : t('profile.save_button')}
              onPress={() => setShowPasswordPopup(true)}
              variant="primary"
              size="large"
              containerStyle={styles.saveButton}
              disabled={isLoading}
              loading={isLoading}
            />
          </View>
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  // Header with edit button
  headerContainer: {
    position: 'relative',
  },
  editButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
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
  // eKYC Section
  ekycSection: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  ekycHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ekycTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: Colors.textPrimary,
  },
  ekycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  ekycVerifiedText: {
    color: Colors.success,
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
  ekycBadgeWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  ekycNotVerifiedText: {
    color: Colors.warning,
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
  ekycDate: {
    fontSize: 13,
    color: Colors.grey3,
    marginBottom: 12,
  },
  ekycDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  ekycDetailButtonText: {
    fontSize: 15,
    color: Colors.main_bule,
    fontWeight: '500',
  },
  ekycVerifyButton: {
    backgroundColor: Colors.main_bule,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  ekycVerifyButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ProfileScreen;
