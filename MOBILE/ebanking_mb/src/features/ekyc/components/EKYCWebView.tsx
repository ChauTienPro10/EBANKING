/**
 * eKYC WebView Component
 * Main WebView component for FPT AI eKYC SDK
 */

import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import GText from '../../../components/GText';
import ToastService from '../../../components/ToastService';
import Colors from '../../../constants/color';
import { EKYCWebViewProps } from '../types';
import { useEKYCSession } from '../hooks/useEKYCSession';
import { useEKYCWebView } from '../hooks/useEKYCWebView';
import EKYCLoadingOverlay from './EKYCLoadingOverlay';
import { getEKYCInjectedScript } from '../utils/ekycInjectedScript';

const EKYCWebView: React.FC<EKYCWebViewProps> = ({
  userId,
  onClose,
  onSuccess,
  onError,
}) => {
  const { t } = useTranslation();

  // Initialize session and SDK
  const {
    sessionId,
    sdkConfig,
    loading,
    error,
    currentStep: sessionStep,
  } = useEKYCSession(userId, onError);

  // Handle WebView messages
  const {
    webViewReady,
    currentStep: webViewStep,
    handleWebViewMessage,
  } = useEKYCWebView(sessionId, onSuccess, onError);

  // Generate WebView URL
  const getEKYCWebURL = (): string => {
    if (!sdkConfig) return '';

    const params = new URLSearchParams({
      apiKey: sdkConfig.apiKey,
      sessionId: sdkConfig.sessionId,
      sessionToken: sdkConfig.sessionToken,
      baseUrl: sdkConfig.baseUrl,
      language: sdkConfig.language,
      callbackUrl: sdkConfig.callbackUrl,
    });

    const url = `https://ekyc-sdk.fpt.ai/?${params.toString()}`;
    console.log('🌐 Loading eKYC URL:', url);
    return url;
  };

  // Show loading/error state
  if (loading || error) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="eKYC Verification" showBackButton={true} />
        <View style={styles.centerContainer}>
          {loading ? (
            <>
              <ActivityIndicator size="large" color={Colors.main_bule} />
              <GText type="system_16" style={styles.text}>
                {sessionStep}
              </GText>
            </>
          ) : (
            <GText type="system_14" color={Colors.red} style={styles.errorText}>
              {error}
            </GText>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="eKYC Verification" showBackButton={true} />

      <EKYCLoadingOverlay visible={!webViewReady} currentStep={webViewStep} />

      <View
        style={[styles.webViewContainer, { opacity: webViewReady ? 1 : 0 }]}
      >
        <WebView
          source={{ uri: getEKYCWebURL() }}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
          allowFileAccess={true}
          geolocationEnabled={true}
          cacheEnabled={false}
          mixedContentMode="always"
          originWhitelist={['*']}
          allowFileAccessFromFileURLs={true}
          allowUniversalAccessFromFileURLs={true}
          androidLayerType="hardware"
          androidHardwareAccelerationDisabled={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          injectedJavaScript={getEKYCInjectedScript()}
          onError={syntheticEvent => {
            const { nativeEvent } = syntheticEvent;
            console.error('❌ WebView error:', nativeEvent);
            ToastService.error('Lỗi', 'Không thể tải trang eKYC');
          }}
          onHttpError={syntheticEvent => {
            const { nativeEvent } = syntheticEvent;
            console.error(
              '❌ HTTP error:',
              nativeEvent.statusCode,
              nativeEvent.url,
            );
          }}
          onLoadStart={() => {
            console.log('🔵 WebView loading FPT AI eKYC...');
          }}
          onLoadEnd={() => {
            console.log('✅ WebView loaded successfully');
          }}
          style={styles.webView}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 16,
    textAlign: 'center',
    color: Colors.grey3,
  },
  errorText: {
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  webView: {
    flex: 1,
    backgroundColor: Colors.white,
  },
});

export default EKYCWebView;
