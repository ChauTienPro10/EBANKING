import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomInput, GText } from '../../../components';
import Colors from '../../../constants/color';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import LockIcon from '../../../components/icon/LockIcon';

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

  const loginResponse = useSelector((state: RootState) => state.app.loginResponse);
  const userInfo = useSelector((state: RootState) => state.app.userInfoData);


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
        <View style={userInfo?.email !== loginResponse?.username ?
          styles.inputGroupHasIcon :
          styles.inputGroup}>
          <CustomInput
            label={t('profile.email')}
            value={profile.email}
            onChangeText={(text: string) => onInputChange('email', text)}
            placeholder={t('profile.email_placeholder')}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            editable={(isEditing && userInfo?.email !== loginResponse?.username)}
          />
          <LockIcon size={20} color={Colors.grey3} style={userInfo?.email !== loginResponse?.username ?
            styles.hide :
            styles.iconRight} />
        </View>

        {/* Phone Input */}
        <View style={userInfo?.phone !== loginResponse?.username ?
          styles.inputGroupHasIcon :
          styles.inputGroup}>
          <CustomInput
            label={t('profile.phone')}
            value={profile.phone}
            onChangeText={(text: string) => onInputChange('phone', text)}
            placeholder={t('profile.phone_placeholder')}
            keyboardType="phone-pad"
            error={errors.phone}
            editable={(isEditing && userInfo?.phone !== loginResponse?.username)}
          />
          <LockIcon size={20} color={Colors.grey3} style={userInfo?.phone !== loginResponse?.username ?
            styles.hide :
            styles.iconRight} />
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
  hide: {
    display: 'none'
  }
});

export default ContactInfoSection;
