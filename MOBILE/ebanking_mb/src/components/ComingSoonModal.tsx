import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import Colors from '../constants/color';

interface ComingSoonModalProps {
  visible: boolean;
  onClose: () => void;
  featureName?: string;
}

const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  visible,
  onClose,
  featureName,
}) => {
  const { t } = useTranslation();

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
            <Icon name="close" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Icon Container */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <Icon name="rocket-outline" size={40} color={Colors.main_bule} />
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{t('coming_soon.title')}</Text>
            <Text style={styles.message}>
              {featureName
                ? t('coming_soon.message_with_feature', {
                    feature: featureName,
                  })
                : t('coming_soon.message')}
            </Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{t('coming_soon.button')}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default ComingSoonModal;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: width - 80,
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
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
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  iconContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.main_bule + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  button: {
    width: '100%',
    backgroundColor: Colors.main_bule,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.main_bule,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
