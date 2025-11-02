import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import Colors from '../../constants/color';
import { Header } from '../../components';
import { useTranslation } from 'react-i18next';

type Props = NativeStackScreenProps<RootStackParamList, 'TransactionFailedScreen'>;


const TransactionFailedScreen: React.FC<Props> = ({ navigation, route }) => {
    const { errorString } = route.params || {};

    const { t } = useTranslation();


    const handleRetry = () => {
        navigation.replace('Transfer');
    };

    const handleBackHome = () => {
        navigation.navigate('Home');
    };

    return (
        <View style={styles.containerMaster}>
            <Header title='Giao dich thất bại' />

            <View style={styles.container}>
                <Image
                    source={require('../../../assets/icons8-error-48.png')}
                    style={styles.icon}
                    resizeMode="contain"
                />

                <Text style={styles.title}>Giao dịch thất bại</Text>
                <Text style={styles.message}>
                    {t(`transfer.error.${errorString?.trim()}`) || 'Không thể thực hiện giao dịch. Vui lòng thử lại sau.'}
                </Text>

                <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                    <Text style={styles.retryText}>Thử lại</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.backButton} onPress={handleBackHome}>
                    <Text style={styles.backText}>Quay về trang chủ</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default TransactionFailedScreen;

const styles = StyleSheet.create({

    containerMaster: {
        flexDirection: 'column',
        alignItems: 'center'
    },
    container: {
        width: '90%',
        // flex: 1,
        marginVertical: 60,
        paddingVertical: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 24,

    },
    icon: {
        width: 80,
        height: 80,
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.yellow,
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginBottom: 30,
    },
    retryButton: {
        backgroundColor: Colors.yellow,
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 8,
        marginBottom: 12,
    },
    retryText: {
        color: Colors.black,
        fontSize: 16,
        fontWeight: '600',
    },
    backButton: {
        paddingVertical: 10,
        paddingHorizontal: 40,
    },
    backText: {
        color: '#333',
        fontSize: 15,
        textDecorationLine: 'underline',
    },
});
