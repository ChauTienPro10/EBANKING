import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
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
    fullName: 'Lê Văn Thắng',
    dateOfBirth: '15/03/1995',
    cccd: '123456789012',
    gender: 'Nam',
    address: 'Quận 10, TP. Hồ Chí Minh',
    email: 'thangle@gmail.com',
    phone: '+84-123-456-789',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

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
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadImage = () => {
    console.log('Upload image clicked');
    // TODO: Implement image picker
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
      <Header
        title={t('profile.title')}
        showBackButton={true}
        showNotification={true}
        notificationCount={notificationCount}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo Section */}
        <View style={styles.photoSection}>
          <GText
            type="systemLight_12"
            color={Colors.grey3}
            style={styles.sectionLabel}
          >
            {t('profile.photo_label')}
          </GText>
          <View style={styles.avatarContainer}>
            <Avatar
              src="https://i.pravatar.cc/150?img=12"
              size={100}
              onPress={handleUploadImage}
            />
          </View>
          <TouchableOpacity onPress={handleUploadImage}>
            <GText
              type="systemLight_14"
              color={Colors.main_bule}
              style={styles.uploadText}
            >
              {t('profile.upload_photo')}
            </GText>
          </TouchableOpacity>
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <GText
            type="systemBold_18"
            color={Colors.main_bule}
            style={styles.sectionTitle}
          >
            {t('profile.personal_info')}
          </GText>

          <View style={styles.formContainer}>
            {/* Full Name Input */}
            <View style={styles.inputGroup}>
              <CustomInput
                label={t('profile.full_name')}
                value={profile.fullName}
                onChangeText={(text: string) =>
                  handleInputChange('fullName', text)
                }
                placeholder={t('profile.full_name_placeholder')}
                error={errors.fullName}
              />
            </View>

            {/* Date of Birth Input */}
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
              />
            </View>

            {/* CCCD Input */}
            <View style={styles.inputGroup}>
              <CustomInput
                label={t('profile.cccd')}
                value={profile.cccd}
                onChangeText={(text: string) => handleInputChange('cccd', text)}
                placeholder={t('profile.cccd_placeholder')}
                keyboardType="numeric"
                maxLength={12}
                error={errors.cccd}
              />
            </View>

            {/* Gender Selection */}
            <View style={styles.inputGroup}>
              <GText
                type="systemLight_14"
                color={Colors.grey3}
                style={styles.inputLabel}
              >
                {t('profile.gender')}
              </GText>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    profile.gender === 'Nam' && styles.genderOptionSelected,
                  ]}
                  onPress={() => handleInputChange('gender', 'Nam')}
                >
                  <GText
                    type="systemLight_14"
                    color={
                      profile.gender === 'Nam' ? Colors.white : Colors.grey3
                    }
                  >
                    {t('profile.male')}
                  </GText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    profile.gender === 'Nữ' && styles.genderOptionSelected,
                  ]}
                  onPress={() => handleInputChange('gender', 'Nữ')}
                >
                  <GText
                    type="systemLight_14"
                    color={
                      profile.gender === 'Nữ' ? Colors.white : Colors.grey3
                    }
                  >
                    {t('profile.female')}
                  </GText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    profile.gender === 'Khác' && styles.genderOptionSelected,
                  ]}
                  onPress={() => handleInputChange('gender', 'Khác')}
                >
                  <GText
                    type="systemLight_14"
                    color={
                      profile.gender === 'Khác' ? Colors.white : Colors.grey3
                    }
                  >
                    {t('profile.other')}
                  </GText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Address Input */}
            <View style={styles.inputGroup}>
              <CustomInput
                label={t('profile.address')}
                value={profile.address}
                onChangeText={(text: string) =>
                  handleInputChange('address', text)
                }
                placeholder={t('profile.address_placeholder')}
                error={errors.address}
              />
            </View>
          </View>
        </View>

        {/* Contact Information Section */}
        <View style={styles.section}>
          <GText
            type="systemBold_18"
            color={Colors.main_bule}
            style={styles.sectionTitle}
          >
            {t('profile.contact_info')}
          </GText>

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
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <CustomButton
          title={isLoading ? t('common.loading') : t('profile.save_button')}
          onPress={handleSave}
          variant="primary"
          size="large"
          containerStyle={styles.saveButton}
          disabled={isLoading}
          loading={isLoading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  photoSection: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionLabel: {
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  avatarContainer: {
    marginVertical: 15,
  },
  uploadText: {
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: 0,
    marginBottom: 20,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    marginBottom: 8,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  genderOptionSelected: {
    backgroundColor: Colors.main_bule,
    borderColor: Colors.main_bule,
    shadowColor: Colors.main_bule,
    shadowOpacity: 0.3,
    elevation: 3,
  },
  saveButton: {
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 40,
  },
});

export default ProfileScreen;
