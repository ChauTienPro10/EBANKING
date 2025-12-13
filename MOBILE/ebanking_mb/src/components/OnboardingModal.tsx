import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import Colors from '../constants/color';

interface OnboardingModalProps {
  visible: boolean;
  onClose: () => void;
  ekycCompleted: boolean;
  pinCompleted: boolean;
  onNavigateToEKYC: () => void;
  onNavigateToPIN: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({
  visible,
  onClose,
  ekycCompleted,
  pinCompleted,
  onNavigateToEKYC,
  onNavigateToPIN,
}) => {
  const { t } = useTranslation();

  // Don't show modal if both are completed
  if (ekycCompleted && pinCompleted) {
    return null;
  }

  const pendingTasks = [
    {
      id: 'ekyc',
      completed: ekycCompleted,
      icon: 'shield-checkmark',
      iconBg: '#E8F5E9',
      iconColor: Colors.success,
      gradientStart: '#4CAF50',
      gradientEnd: '#66BB6A',
      title: t('onboarding.ekyc_title'),
      description: t('onboarding.ekyc_description'),
      action: onNavigateToEKYC,
      buttonText: t('onboarding.ekyc_button'),
    },
    {
      id: 'pin',
      completed: pinCompleted,
      icon: 'keypad',
      iconBg: '#E3F2FD',
      iconColor: Colors.main_bule,
      gradientStart: Colors.main_bule,
      gradientEnd: Colors.cardGradientEnd,
      title: t('onboarding.pin_title'),
      description: t('onboarding.pin_description'),
      action: onNavigateToPIN,
      buttonText: t('onboarding.pin_button'),
    },
  ].filter(task => !task.completed);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar backgroundColor="transparent" barStyle="light-content" />
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={e => e.stopPropagation()}
        >
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeIcon}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Icon name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIconContainer}>
              <Icon name="rocket" size={32} color={Colors.main_bule} />
            </View>
            <Text style={styles.headerTitle}>
              {t('onboarding.header_title')}
            </Text>
            <Text style={styles.headerSubtitle}>
              {t('onboarding.header_subtitle')}
            </Text>
          </View>

          {/* Tasks List */}
          <ScrollView
            style={styles.tasksList}
            showsVerticalScrollIndicator={false}
          >
            {pendingTasks.map((task, index) => (
              <View
                key={task.id}
                style={[
                  styles.taskCard,
                  index === pendingTasks.length - 1 && styles.taskCardLast,
                ]}
              >
                {/* Task Icon */}
                <View
                  style={[
                    styles.taskIconContainer,
                    { backgroundColor: task.iconBg },
                  ]}
                >
                  <Icon name={task.icon} size={28} color={task.iconColor} />
                </View>

                {/* Task Content */}
                <View style={styles.taskContent}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskDescription}>{task.description}</Text>

                  {/* Action Button */}
                  <TouchableOpacity
                    style={[
                      styles.taskButton,
                      { backgroundColor: task.gradientStart },
                    ]}
                    onPress={task.action}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.taskButtonText}>{task.buttonText}</Text>
                    <Icon name="arrow-forward" size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.laterButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.laterButtonText}>
                {t('onboarding.later_button')}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default OnboardingModal;

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: width - 40,
    maxWidth: 400,
    maxHeight: height * 0.8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingTop: 20,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  closeIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  tasksList: {
    paddingHorizontal: 20,
    maxHeight: height * 0.45,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  taskCardLast: {
    marginBottom: 0,
  },
  taskIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  taskContent: {
    flex: 1,
    justifyContent: 'center',
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  taskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
    alignSelf: 'flex-start',
    shadowColor: Colors.main_bule,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  taskButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    marginTop: 16,
  },
  laterButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  laterButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
