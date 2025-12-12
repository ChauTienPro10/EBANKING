import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../constants/color';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

interface Props {
    visible: boolean;
    onClose: () => void;
}

const LanguagePopup = ({ visible, onClose }: Props) => {
    const { t } = useTranslation();

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.popup}>
                    <Text style={styles.title}>{t('settings.select_language')}</Text>

                    <TouchableOpacity
                        style={[styles.option, i18n.language === 'vi' && styles.activeOption]}
                        onPress={() => changeLanguage('vi')}
                    >
                        <Text style={[styles.text, i18n.language === 'vi' && styles.activeText]}>
                            {t('settings.vi')}
                        </Text>
                        {i18n.language === 'vi' && <Text style={styles.check}>✓</Text>}
                    </TouchableOpacity>

                    <View style={styles.separator} />

                    <TouchableOpacity
                        style={[styles.option, i18n.language === 'en' && styles.activeOption]}
                        onPress={() => changeLanguage('en')}
                    >
                        <Text style={[styles.text, i18n.language === 'en' && styles.activeText]}>
                            {t('settings.en')}
                        </Text>
                        {i18n.language === 'en' && <Text style={styles.check}>✓</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                        <Text style={styles.cancelText}>{t('common.cancel')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default LanguagePopup;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popup: {
        backgroundColor: 'white',
        width: '80%',
        padding: 20,
        borderRadius: 16,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: Colors.black,
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    activeOption: {
        backgroundColor: '#F0F5FF',
    },
    text: {
        fontSize: 16,
        color: '#333',
    },
    activeText: {
        color: Colors.main_bule,
        fontWeight: '600',
    },
    check: {
        color: Colors.main_bule,
        fontSize: 18,
        fontWeight: 'bold',
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 4,
    },
    cancelButton: {
        marginTop: 20,
        alignItems: 'center',
        padding: 10,
    },
    cancelText: {
        color: '#666',
        fontSize: 14,
    }
});
