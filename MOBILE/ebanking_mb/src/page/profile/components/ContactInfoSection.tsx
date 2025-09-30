import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomInput, GText } from '../../../components';
import Colors from '../../../constants/color';

interface ContactInfoSectionProps {
  profile: {
    email: string;
    phone: string;
  };
  errors: Record<string, string>;
  isEditing: boolean;
  onInputChange: (field: string, value: string) => void;
}

const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({
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
          {t('profile.contact_info')}
        </GText>
      </View>

      <View style={styles.formContainer}>
        {/* Email Input */}
        <View style={styles.inputGroup}>
          <CustomInput
            label={t('profile.email')}
            value={profile.email}
            onChangeText={(text: string) => onInputChange('email', text)}
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
            onChangeText={(text: string) => onInputChange('phone', text)}
            placeholder={t('profile.phone_placeholder')}
            keyboardType="phone-pad"
            error={errors.phone}
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
});

export default ContactInfoSection;
