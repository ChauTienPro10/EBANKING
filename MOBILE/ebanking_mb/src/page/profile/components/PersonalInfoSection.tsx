import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomInput, GText } from '../../../components';
import Colors from '../../../constants/color';
import LockIcon from '../../../components/icon/LockIcon';


interface PersonalInfoSectionProps {
  profile: {
    fullName: string;
    dateOfBirth: string;
    cccd: string;
    gender: string;
    address: string;
  };
  errors: Record<string, string>;
  isEditing: boolean;
  onInputChange: (field: string, value: string) => void;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  profile,
  errors,
  isEditing,
  onInputChange,
}) => {
  const { t } = useTranslation();

  return (
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
        {/* Full Name */}
        <View style={styles.inputGroup}>
          <CustomInput
            label={t('profile.full_name')}
            value={profile.fullName}
            onChangeText={(text: string) => onInputChange('fullName', text)}
            placeholder={t('profile.full_name_placeholder')}
            error={errors.fullName}
            editable={isEditing}
          />
        </View>

        {/* Date of Birth */}
        <View style={styles.inputGroup}>
          <CustomInput
            label={t('profile.date_of_birth')}
            value={profile.dateOfBirth}
            onChangeText={(text: string) => onInputChange('dateOfBirth', text)}
            placeholder="DD-MM-YYYY"
            keyboardType="numeric"
            error={errors.dateOfBirth}
            editable={isEditing}
          />
        </View>

        {/* Gender Selection */}
        <View style={styles.inputGroup}>
          <GText style={styles.genderLabel}>{t('profile.gender')}</GText>
          <View
            style={[
              styles.genderInputContainer,
              !isEditing && styles.genderInputDisabled,
            ]}
          >
            {['Nam', 'Nữ'].map((gender, index) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.genderOption,
                  profile.gender === gender && styles.genderOptionSelected,
                  index === 0 && styles.genderOptionFirst,
                  index === 1 && styles.genderOptionLast,
                ]}
                onPress={() => isEditing && onInputChange('gender', gender)}
                disabled={!isEditing}
              >
                <GText
                  type="systemLight_14"
                  color={profile.gender === gender ? Colors.white : '#6B7280'}
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

        {/* CCCD */}
        <View style={styles.inputGroupHasIcon}>
          <CustomInput
            label={t('profile.cccd')}
            value={profile.cccd}
            onChangeText={(text: string) => onInputChange('cccd', text)}
            placeholder={t('profile.cccd_placeholder')}
            keyboardType="numeric"
            maxLength={12}
            error={errors.cccd}
            editable={false}
          />
          <LockIcon size={20} color={Colors.grey3} style={styles.iconRight}/>
        </View>

        {/* Address */}
        <View style={styles.inputGroup}>
          <CustomInput
            label={t('profile.address')}
            value={profile.address}
            onChangeText={(text: string) => onInputChange('address', text)}
            placeholder={t('profile.address_placeholder')}
            error={errors.address}
            multiline={true}
            numberOfLines={2}
            editable={isEditing}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  inputGroup: {
    marginBottom: 20,
  },
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
  genderOptionFirst: {},
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
  inputGroupHasIcon: {
    marginBottom: 20,
    position: 'relative', // để icon absolute bên trong
    width: '100%',
  },

  iconRight: {
    position: 'absolute',
    right: 10, // khoảng cách từ mép phải
    top: '70%',
    transform: [{ translateY: -15 }], // căn giữa theo chiều dọc (nếu icon 20px)
  },
});

export default PersonalInfoSection;
