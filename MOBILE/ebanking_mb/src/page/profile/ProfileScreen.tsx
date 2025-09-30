import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useCommonUI } from '../../hooks/useCommonUI';
import {
  Header,
  CustomInput,
  CustomButton,
  Avatar,
  GText,
} from '../../components';
import Colors from '../../constants/color';
import TextStyles from '../../constants/textStyle';

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
      <View style={styles.headerContainer}>
        <Header
          title={t('profile.title')}
          showBackButton={true}
          showNotification={false}
        />
        <TouchableOpacity onPress={handleEditToggle} style={styles.editButton}>
          <GText
            type="systemMedium_14"
            color={Colors.white}
            style={styles.editButtonText}
          >
            {isEditing ? t('common.cancel') : t('profile.edit')}
          </GText>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Photo Section */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Avatar
                src="https://i.pravatar.cc/150?img=12"
                size={120}
                onPress={handleSelectFromGallery}
              />
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={handleTakePhoto}
              >
                <View style={styles.plusIcon}>
                  <View style={styles.plusHorizontal} />
                  <View style={styles.plusVertical} />
                </View>
              </TouchableOpacity>
            </View>
            <GText
              type="systemBold_18"
              color={Colors.main_bule}
              style={styles.userName}
            >
              {profile.fullName}
            </GText>
          </View>
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <GText
              type="systemBold_18"
              color={Colors.main_bule}
              style={styles.sectionTitle}
            >
              {t('profile.personal_info')}
            </GText>
          </View>

          <View style={styles.formContainer}>
            {/* Row 1: Full Name */}
            <View style={styles.inputGroup}>
              <CustomInput
                label={t('profile.full_name')}
                value={profile.fullName}
                onChangeText={(text: string) =>
                  handleInputChange('fullName', text)
                }
                placeholder={t('profile.full_name_placeholder')}
                error={errors.fullName}
                editable={isEditing}
              />
            </View>

            {/* Row 2: Date of Birth */}
            <View style={styles.inputGroup}>
              <CustomInput
                label={t('profile.date_of_birth')}
                value={profile.dateOfBirth}
                onChangeText={(text: string) =>
                  handleInputChange('dateOfBirth', text)
                }
                placeholder="DD/MM/YYYY"
                keyboardType="numeric"
                error={errors.dateOfBirth}
                editable={isEditing}
              />
            </View>

            {/* Row 3: Gender Selection */}
            <View style={styles.inputGroup}>
              <GText style={styles.genderLabel}>{t('profile.gender')}</GText>
              <View
                style={[
                  styles.genderInputContainer,
                  !isEditing && styles.genderInputDisabled,
                ]}
              >
                {['Nam', 'Nữ', 'Khác'].map((gender, index) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.genderOption,
                      profile.gender === gender && styles.genderOptionSelected,
                      index === 0 && styles.genderOptionFirst,
                      index === 2 && styles.genderOptionLast,
                    ]}
                    onPress={() =>
                      isEditing && handleInputChange('gender', gender)
                    }
                    disabled={!isEditing}
                  >
                    <GText
                      type="systemLight_14"
                      color={
                        profile.gender === gender ? Colors.white : '#6B7280'
                      }
                      style={styles.genderOptionText}
                    >
                      {gender === 'Nam'
                        ? t('profile.male')
                        : gender === 'Nữ'
                        ? t('profile.female')
                        : t('profile.other')}
                    </GText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Row 4: CCCD */}
            <View style={styles.inputGroup}>
              <CustomInput
                label={t('profile.cccd')}
                value={profile.cccd}
                onChangeText={(text: string) => handleInputChange('cccd', text)}
                placeholder={t('profile.cccd_placeholder')}
                keyboardType="numeric"
                maxLength={12}
                error={errors.cccd}
                editable={isEditing}
              />
            </View>

            {/* Row 5: Address */}
            <View style={styles.inputGroup}>
              <CustomInput
                label={t('profile.address')}
                value={profile.address}
                onChangeText={(text: string) =>
                  handleInputChange('address', text)
                }
                placeholder={t('profile.address_placeholder')}
                error={errors.address}
                multiline={true}
                numberOfLines={2}
                editable={isEditing}
              />
            </View>
          </View>
        </View>

        {/* Contact Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <GText
              type="systemBold_18"
              color={Colors.main_bule}
              style={styles.sectionTitle}
            >
              {t('profile.contact_info')}
            </GText>
          </View>

          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <CustomInput
                label={t('profile.email')}
                value={profile.email}
                onChangeText={(text: string) =>
                  handleInputChange('email', text)
                }
                placeholder={t('profile.email_placeholder')}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                editable={isEditing}
              />
            </View>

            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <CustomInput
                label={t('profile.phone')}
                value={profile.phone}
                onChangeText={(text: string) =>
                  handleInputChange('phone', text)
                }
                placeholder={t('profile.phone_placeholder')}
                keyboardType="phone-pad"
                error={errors.phone}
                editable={isEditing}
              />
            </View>
          </View>
        </View>

        {/* Save Button - Only show when editing */}
        {isEditing && (
          <View style={styles.buttonContainer}>
            <CustomButton
              title={isLoading ? t('common.loading') : t('profile.save_button')}
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
    backgroundColor: Colors.background,
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
    paddingBottom: 40,
  },
  // New modern profile header
  profileHeader: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  cameraButton: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: Colors.main_bule,
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.white,
    shadowColor: Colors.main_bule,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  plusIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusHorizontal: {
    width: 16,
    height: 3,
    backgroundColor: Colors.white,
    borderRadius: 2,
    position: 'absolute',
  },
  plusVertical: {
    width: 3,
    height: 16,
    backgroundColor: Colors.white,
    borderRadius: 2,
    position: 'absolute',
  },
  userName: {
    marginBottom: 8,
    textAlign: 'center',
  },
  // Enhanced sections
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 0,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  // Enhanced form layouts
  inputGroup: {
    marginBottom: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  halfWidth: {
    flex: 1,
  },
  inputLabel: {
    marginBottom: 8,
  },
  // New gender selection (CustomInput style)
  genderLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  genderInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: Colors.grey2,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 56,
  },
  genderInputDisabled: {
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.grey2,
    backgroundColor: 'transparent',
  },
  genderOptionFirst: {
    // No additional styles needed
  },
  genderOptionLast: {
    borderRightWidth: 0,
  },
  genderOptionSelected: {
    backgroundColor: Colors.main_bule,
  },
  genderOptionText: {
    fontSize: 16,
    textAlign: 'center',
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
