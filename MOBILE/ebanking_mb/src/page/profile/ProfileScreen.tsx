import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useCommonUI } from '../../hooks/useCommonUI';
import { CustomButton } from '../../components';
import Colors from '../../constants/color';
import ProfileHeader from './components/ProfileHeader';
import UserInfoCard from './components/UserInfoCard';
import PersonalInfoSection from './components/PersonalInfoSection';
import ContactInfoSection from './components/ContactInfoSection';
import { useProfileAnimations } from './hooks/useProfileAnimations';
import fetch from '../../utils/fetch';
import { API } from '../../constants/api';
import PasswordPopup from '../../popups/RequirePassword';
import LoadingPopup from '../../popups/LoadingPopup';
import { AppDispatch, store } from '../../store';
import { fetchUserInfo } from '../../store/fetchAPI/UserInfoFetch';
import Toast from 'react-native-toast-message';

const ProfileScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const language = useSelector((state: RootState) => state.app.language);
  const userInfo = useSelector((state: RootState) => state.app.userInfoData);
  const loginResponse = useSelector((State: RootState) => State.app.loginResponse);
  const dispatch: AppDispatch = store.dispatch;

  useEffect(() => {
    if (language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  useEffect(() => {
    setProfile({
      fullName: userInfo?.fullName ? userInfo.fullName.toUpperCase() : '---',
      dateOfBirth: userInfo?.birthday ? userInfo.birthday : '---',
      cccd: userInfo?.citizenId ? userInfo.citizenId : '---',
      gender: userInfo?.isMale === 'true' ? 'Nam' : 'Nữ',
      address: userInfo?.address ? userInfo.address : '---',
      email: userInfo?.email ? userInfo.email : '---',
      phone: userInfo?.phone ? userInfo.phone : '---',
    });
    console.log('mmmm', userInfo, profile.gender)

  }, [userInfo])

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

  const onSubmitUpdate = async (password: string) => {
    const payload = {
      fullName: profile.fullName !== '---' ? profile.fullName : '',
      email: profile.email !== '---' ? profile.email : '',
      phone: profile.phone !== '---' ? profile.phone : '',
      address: profile.address !== '---' ? profile.address : '',
      birthday: profile.dateOfBirth !== '---' ? profile.dateOfBirth : '',
      isMale: profile.gender === "Nam" ? true : false,
      username: loginResponse?.username,
      password: password

    }
    const data = await fetch.post(API.UPDATE_USER_INFO, payload, true);
    if (loginResponse?.id !== undefined) {
      dispatch(fetchUserInfo(loginResponse.id));
      Toast.show({
        type: 'info',
        text1: 'Thông báo',
        text2: 'Cập nhật thông tin thành công'
      });
    }
  }

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
        text1: 'Lỗi',
        text2: 'Update thất bại, Hãy kiểm tra lại thông tin'
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
    let newValue = value;

    if (field === 'dateOfBirth') {
      let digits = value.replace(/\D/g, '');
      if (digits.length > 2 && digits.length <= 4) {
        digits = digits.slice(0, 2) + '-' + digits.slice(2);
      } else if (digits.length > 4) {
        digits = digits.slice(0, 2) + '-' + digits.slice(2, 4) + '-' + digits.slice(4, 8);
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

      <LoadingPopup visible={isLoading} message="Đang xử lý..." />

      <PasswordPopup
        visible={showPasswordPopup}
        message="Vui lòng nhập mật khẩu để tiếp tục"
        onClose={() => setShowPasswordPopup(false)}
        onSubmit={(password) => {
          handleSave(password)
          setShowPasswordPopup(false);
        }}
      />

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
              onPress={() => setShowPasswordPopup(true)}
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
