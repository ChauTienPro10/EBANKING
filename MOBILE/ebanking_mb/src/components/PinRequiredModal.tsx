import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/color';
import { useTranslation } from 'react-i18next';

interface PinRequiredModalProps {
    visible: boolean;
    onClose: () => void;
    onGoToSetPin: () => void;
}

const PinRequiredModal: React.FC<PinRequiredModalProps> = ({
    visible,
    onClose,
    onGoToSetPin,
}) => {
    const { t } = useTranslation();
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <Icon name="key-outline" size={50} color={Colors.white} />
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>{t('pin_modal.title')}</Text>

                    {/* Message */}
                    <Text style={styles.message}>
                        {t('pin_modal.message')}
                    </Text>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={onClose}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.secondaryButtonText}>{t('pin_modal.go_home')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={onGoToSetPin}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.primaryButtonText}>{t('pin_modal.set_now')}</Text>
                            <Icon name="arrow-forward" size={18} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default PinRequiredModal;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: width - 60,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.main_bule,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: Colors.main_bule,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    secondaryButton: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#666',
    },
    primaryButton: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: Colors.main_bule,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        shadowColor: Colors.main_bule,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    primaryButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFF',
    },
});
