import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '../../../../constants/color';
import ProgressHeader from '../shared/ProgressHeader';

interface GuidelinesViewProps {
  onStart: () => void;
}

const GuidelinesView: React.FC<GuidelinesViewProps> = ({ onStart }) => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.whiteContainer}>
      <ProgressHeader currentStep={2} />
      <View style={styles.guidelinesContainer}>
        <Text style={styles.guidelinesTitle}>
          {t('ekyc_flow.liveness.guidelines_title')}
        </Text>
        <View style={styles.guidelinesList}>
          <View style={styles.guidelineItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.guidelineText}>
              {t('ekyc_flow.liveness.guideline_2')}
            </Text>
          </View>
          <View style={styles.guidelineItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.guidelineText}>
              {t('ekyc_flow.liveness.guideline_1')}
            </Text>
          </View>
          <View style={styles.guidelineItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.guidelineText}>
              {t('ekyc_flow.liveness.guideline_1')}
            </Text>
          </View>
          <View style={styles.guidelineItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.guidelineText}>
              {t('ekyc_flow.liveness.guideline_3')}
            </Text>
          </View>
          <View style={styles.guidelineItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.guidelineText}>
              {t('ekyc_flow.liveness.guideline_5')}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.startButton} onPress={onStart}>
          <Text style={styles.startButtonText}>
            {t('ekyc_flow.liveness.start_button')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  whiteContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  guidelinesContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  guidelinesTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  guidelinesList: {
    marginBottom: 32,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.main_bule,
    marginTop: 6,
    marginRight: 12,
  },
  guidelineText: {
    fontSize: 16,
    color: '#4B5563',
    flex: 1,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: Colors.main_bule,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: Colors.main_bule,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default GuidelinesView;
