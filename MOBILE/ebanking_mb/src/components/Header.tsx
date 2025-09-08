import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GText from './GText';
import Colors from '../constants/color';
import { BellIcon, ChevronBackIcon } from './icon';

interface HeaderProps {
    title: string;
    showBackButton?: boolean;
    showNotification?: boolean;
    notificationCount?: number;
    onNotificationPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    title, 
    showBackButton = true, 
    showNotification = false, 
    notificationCount = 0,
    onNotificationPress 
}) => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            {showBackButton ? (
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronBackIcon size={24} color={Colors.white} />
                </TouchableOpacity>
            ) : (
                <View style={styles.placeholder} />
            )}

            <GText type="systemBold_24" color={Colors.white} style={styles.title}>
                {title}
            </GText>

            {showNotification ? (
                <TouchableOpacity 
                    onPress={onNotificationPress} 
                    style={styles.notificationButton}
                    activeOpacity={0.7}
                >
                    <BellIcon size={24} color={Colors.white} />
                    {notificationCount > 0 && (
                        <View style={styles.badge}>
                            <GText type="systemBold_10" color={Colors.white} style={styles.badgeText}>
                                {notificationCount > 99 ? '99+' : notificationCount}
                            </GText>
                        </View>
                    )}
                </TouchableOpacity>
            ) : (
                <View style={styles.placeholder} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.main_bule,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    backButton: {
        padding: 4,
    },
    title: {
        flex: 1,
        textAlign: 'center',
    },
    placeholder: {
        width: 24,
    },

    notificationButton: {
        padding: 4,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: Colors.red,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    }
});

export default Header;
