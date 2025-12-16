import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../components/Header';
import SuccessModal from '../../components/SuccessModal';
import ErrorModal from '../../components/ErrorModal';
import Colors from '../../constants/color';
import { RootState } from '../../store';
import { authService } from '../../services/AuthService';

interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
}

const ChangePasswordScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const loginResponse = useSelector(
    (state: RootState) => state.app.loginResponse,
  );

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalTitle, setErrorModalTitle] = useState('');
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Calculate password strength
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    if (!password) {
      return { score: 0, label: '', color: Colors.grey3 };
    }

    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    if (checks.length) score++;
    if (checks.uppercase) score++;
    if (checks.lowercase) score++;
    if (checks.number) score++;
    if (checks.special) score++;

    const strengthMap: { [key: number]: PasswordStrength } = {
      0: { score: 0, label: '', color: Colors.grey3 },
      1: {
        score: 1,
        label: t('change_password.strength_weak'),
        color: Colors.error,
      },
      2: {
        score: 2,
        label: t('change_password.strength_weak'),
        color: Colors.error,
      },
      3: {
        score: 3,
        label: t('change_password.strength_medium'),
        color: Colors.orange,
      },
      4: {
        score: 4,
        label: t('change_password.strength_strong'),
        color: '#4CAF50',
      },
      5: {
        score: 5,
        label: t('change_password.strength_very_strong'),
        color: '#2E7D32',
      },
    };

    return strengthMap[score] || strengthMap[0];
  };

  const passwordStrength = calculatePasswordStrength(newPassword);

  // Validate password requirements
  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    return requirements;
  };

  const requirements = validatePassword(newPassword);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!currentPassword) {
      newErrors.currentPassword = t(
        'change_password.validation.current_password_required',
      );
    }

    if (!newPassword) {
      newErrors.newPassword = t(
        'change_password.validation.new_password_required',
      );
    } else if (newPassword.length < 8) {
      newErrors.newPassword = t(
        'change_password.validation.password_too_short',
      );
    } else if (!requirements.uppercase) {
      newErrors.newPassword = t(
        'change_password.validation.password_no_uppercase',
      );
    } else if (!requirements.lowercase) {
      newErrors.newPassword = t(
        'change_password.validation.password_no_lowercase',
      );
    } else if (!requirements.number) {
      newErrors.newPassword = t(
        'change_password.validation.password_no_number',
      );
    } else if (!requirements.special) {
      newErrors.newPassword = t(
        'change_password.validation.password_no_special',
      );
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = t('change_password.validation.same_as_old');
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t(
        'change_password.validation.confirm_password_required',
      );
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = t(
        'change_password.validation.password_mismatch',
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    if (!loginResponse?.username || !loginResponse?.jwt) {
      setErrorModalTitle(t('change_password.error_title'));
      setErrorModalMessage(t('err.user_not_found'));
      setShowErrorModal(true);
      return;
    }

    setLoading(true);

    try {
      const response = await authService.changePassword(
        {
          username: loginResponse.username,
          oldPassword: currentPassword,
          password: newPassword,
        },
        loginResponse.jwt,
      );

      setLoading(false);

      if (response.status) {
        setShowSuccessModal(true);
      } else {
        // Handle specific error messages from backend
        let errorMessage = t('change_password.error_update_failed');
        if (response.description === 'password_invalid') {
          errorMessage = t('change_password.error_current_password_incorrect');
        }
        setErrorModalTitle(t('change_password.error_title'));
        setErrorModalMessage(errorMessage);
        setShowErrorModal(true);
      }
    } catch (error) {
      setLoading(false);
      console.error('Change password error:', error);
      setErrorModalTitle(t('change_password.error_title'));
      setErrorModalMessage(t('change_password.error_update_failed'));
      setShowErrorModal(true);
    }
  };

  const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
    <View style={styles.requirementItem}>
      <Icon
        name={met ? 'checkmark-circle' : 'ellipse-outline'}
        size={16}
        color={met ? '#4CAF50' : Colors.grey3}
      />
      <Text style={[styles.requirementText, met && styles.requirementMet]}>
        {text}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title={t('change_password.title')}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.subtitle}>{t('change_password.subtitle')}</Text>

        {/* Current Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {t('change_password.current_password')}
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={text => {
                setCurrentPassword(text);
                if (errors.currentPassword) {
                  setErrors({ ...errors, currentPassword: undefined });
                }
              }}
              placeholder={t('change_password.current_password_placeholder')}
              secureTextEntry={!showCurrentPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              style={styles.eyeIcon}
            >
              <Icon
                name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={Colors.grey3}
              />
            </TouchableOpacity>
          </View>
          {errors.currentPassword && (
            <Text style={styles.errorText}>{errors.currentPassword}</Text>
          )}
        </View>

        {/* New Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('change_password.new_password')}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={text => {
                setNewPassword(text);
                if (errors.newPassword) {
                  setErrors({ ...errors, newPassword: undefined });
                }
              }}
              placeholder={t('change_password.new_password_placeholder')}
              secureTextEntry={!showNewPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={styles.eyeIcon}
            >
              <Icon
                name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={Colors.grey3}
              />
            </TouchableOpacity>
          </View>
          {errors.newPassword && (
            <Text style={styles.errorText}>{errors.newPassword}</Text>
          )}

          {/* Password Strength Indicator */}
          {newPassword.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBar}>
                <View
                  style={[
                    styles.strengthFill,
                    {
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      backgroundColor: passwordStrength.color,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.strengthLabel,
                  { color: passwordStrength.color },
                ]}
              >
                {passwordStrength.label}
              </Text>
            </View>
          )}
        </View>

        {/* Confirm Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {t('change_password.confirm_password')}
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={text => {
                setConfirmPassword(text);
                if (errors.confirmPassword) {
                  setErrors({ ...errors, confirmPassword: undefined });
                }
              }}
              placeholder={t('change_password.confirm_password_placeholder')}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Icon
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={Colors.grey3}
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}
        </View>

        {/* Password Requirements */}
        <View style={styles.requirementsBox}>
          <Text style={styles.requirementsTitle}>
            {t('change_password.requirements_title')}
          </Text>
          <RequirementItem
            met={requirements.length}
            text={t('change_password.requirement_length')}
          />
          <RequirementItem
            met={requirements.uppercase}
            text={t('change_password.requirement_uppercase')}
          />
          <RequirementItem
            met={requirements.lowercase}
            text={t('change_password.requirement_lowercase')}
          />
          <RequirementItem
            met={requirements.number}
            text={t('change_password.requirement_number')}
          />
          <RequirementItem
            met={requirements.special}
            text={t('change_password.requirement_special')}
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>
              {t('change_password.cancel_button')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.saveButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.saveButtonText}>
                {t('change_password.save_button')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title={t('change_password.success_title')}
        message={t('change_password.success_message')}
        buttonText={t('common.ok')}
        onClose={() => {
          setShowSuccessModal(false);
          navigation.goBack();
        }}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        title={errorModalTitle}
        message={errorModalMessage}
        buttonText={t('common.ok')}
        onClose={() => setShowErrorModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.grey3,
    marginBottom: 24,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  eyeIcon: {
    padding: 14,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 6,
    marginLeft: 4,
  },
  strengthContainer: {
    marginTop: 12,
  },
  strengthBar: {
    height: 4,
    backgroundColor: Colors.grey2,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  requirementsBox: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 13,
    color: Colors.grey3,
    marginLeft: 8,
  },
  requirementMet: {
    color: Colors.textPrimary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  saveButton: {
    backgroundColor: Colors.main_bule,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default ChangePasswordScreen;
