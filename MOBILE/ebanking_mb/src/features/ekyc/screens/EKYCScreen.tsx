/**
 * eKYC Screen
 * Main screen for eKYC verification feature
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import EKYCWebView from '../components/EKYCWebView';
import ToastService from '../../../components/ToastService';
import { RootStackParamList } from '../../../navigation/types';
import Colors from '../../../constants/color';

type EKYCScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EKYC'>;

/**
 * eKYC Screen
 *
 * Flow:
 * 1. Initialize session with backend (/api/ekyc/sessions?userId=X)
 * 2. Get SDK configuration (/api/ekyc/sdk/init)
 * 3. Display WebView with FPT AI eKYC SDK
 * 4. User performs OCR, Liveness, Face Match
 * 5. Send callbacks to backend for each step
 * 6. When completed, show success message and navigate back
 */
const EKYCScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<EKYCScreenNavigationProp>();

  // TODO: Get userId from Redux store when implement user authentication
  // const userId = useSelector((state: RootState) => state.user?.id || 1);
  const userId = 1;

  const handleClose = () => {
    navigation.goBack();
  };

  const handleSuccess = (sessionId: string) => {
    console.log('✅ eKYC Success! Session ID:', sessionId);

    ToastService.success(t('ekyc.success_title'), t('ekyc.success_message'));

    // TODO: Update user verification status
    // await updateUserVerificationStatus(userId, sessionId);

    // TODO: Get eKYC result from backend
    // const ekycResult = await getEKYCResult(sessionId);
    // dispatch(setUserEKYCData(ekycResult));

    // Navigate back
    setTimeout(() => {
      navigation.goBack();
    }, 1000);
  };

  const handleError = (error: any) => {
    console.error('❌ eKYC Error:', error);

    ToastService.error(
      t('ekyc.error_title'),
      error?.message || t('ekyc.error_message'),
    );

    // TODO: Log error to analytics
    // logError('EKYC_ERROR', error);
  };

  return (
    <View style={styles.container}>
      <EKYCWebView
        userId={userId}
        onClose={handleClose}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});

export default EKYCScreen;
