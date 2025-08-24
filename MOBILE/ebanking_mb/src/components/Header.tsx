import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import GText from './GText';
import Colors from '../constants/color';

interface HeaderProps {
    title: string;
    showBackButton?: boolean;

}

const Header: React.FC<HeaderProps> = ({ title, showBackButton = true }) => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            {showBackButton ? (
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="chevron-back" size={24} style={styles.iconStyle} />
                </TouchableOpacity>
            ) : (
                <View style={styles.placeholder} />
            )}

            <GText type="systemBold_24" color={Colors.white} style={styles.title}>
                {title}
            </GText>

            <View style={styles.placeholder} />
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

    iconStyle: {
        color: Colors.white,
    }
});

export default Header;
