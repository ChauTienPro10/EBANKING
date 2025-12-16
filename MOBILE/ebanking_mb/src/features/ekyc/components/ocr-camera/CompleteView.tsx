import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '../../../../constants/color';
import ProgressHeader from '../shared/ProgressHeader';

interface CompleteViewProps {
  frontImage: string;
  backImage: string;
  onContinue: () => void;
  onRetake: () => void;
}

const CompleteView: React.FC<CompleteViewProps> = ({
  frontImage,
  backImage,
  onContinue,
  onRetake,
}) => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <ProgressHeader currentStep={1} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.completeContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>CMND/CCCD</Text>
        <View style={styles.imageGrid}>
          <View style={styles.imageCard}>
            <Text style={styles.imageLabel}>
              {t('ekyc_flow.complete.front_label')}
            </Text>
            <Image source={{ uri: frontImage }} style={styles.thumbnail} />
          </View>
          <View style={styles.imageCard}>
            <Text style={styles.imageLabel}>
              {t('ekyc_flow.complete.back_label')}
            </Text>
            <Image source={{ uri: backImage }} style={styles.thumbnail} />
          </View>
        </View>
        <TouchableOpacity style={styles.primaryButton} onPress={onContinue}>
          <Text style={styles.primaryButtonText}>
            {t('ekyc_flow.complete.continue_button')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={onRetake}>
          <Text style={styles.secondaryButtonText}>
            {t('ekyc_flow.complete.retake_all_button')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  completeContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    marginLeft: 4,
  },
  imageGrid: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 16,
  },
  imageCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  thumbnail: {
    width: '100%',
    height: 185,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  primaryButton: {
    backgroundColor: Colors.main_bule,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: Colors.main_bule,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CompleteView;
