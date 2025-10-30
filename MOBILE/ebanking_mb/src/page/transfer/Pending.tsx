import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Header } from '../../components';
import Colors from '../../constants/color';

type Props = NativeStackScreenProps<RootStackParamList, 'PendingTransactionScreen'>;

const PendingTransactionScreen: React.FC<Props> = ({ navigation, route }) => {
    const { amount, content, date, receiverName } = route.params || {};

    const formatDateTime = (date?: string | Date) => {
        const d = date ? new Date(date) : new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');

        const month = pad(d.getMonth() + 1);
        const day = pad(d.getDate());
        const year = d.getFullYear();

        const hours = pad(d.getHours());
        const minutes = pad(d.getMinutes());
        const seconds = pad(d.getSeconds());

        return `${month}-${day}-${year} ${hours}:${minutes}:${seconds}`;
    };

    return (
        <View style={styles.containerMaster}>
            <Header title='' />
            <View style={styles.container}>
                {/* Icon thành công */}
                <Image
                    source={require('../../../assets/icons8-process-24.png')} // ảnh trong thư mục assets
                    style={styles.image}
                />

                {/* Tiêu đề */}
                <Text style={styles.title}>Đang xử lý</Text>

                {/* Thông tin giao dịch */}
                <View style={styles.infoBox}>
                    <Text style={styles.label}>Số tiền:</Text>
                    <Text style={styles.value}>{amount}</Text>

                    <Text style={styles.label}>Người nhận:</Text>
                    <Text style={styles.value}>{receiverName}</Text>

                    <Text style={styles.label}>Thời gian:</Text>
                    <Text style={styles.value}>
                         {formatDateTime(date)}
                    </Text>

                    <Text style={styles.label}>Nội dung:</Text>
                    <Text style={styles.value}>
                        {content || new Date().toLocaleString('vi-VN')}
                    </Text>
                </View>

                {/* Nút quay lại hoặc về trang chủ */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.buttonText}>{'Về trang chủ'.toUpperCase()}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default PendingTransactionScreen;

// 🎨 StyleSheet
const styles = StyleSheet.create({
    containerMaster: {
        flexDirection: 'column',
    },
    container: {
        //   flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingHorizontal: 24,
        height: '100%'
    },
    image: {
        width: 50,
        height: 50,
        marginVertical: 50,
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        color: Colors.main_bule,
        marginBottom: 20,
    },
    infoBox: {
        width: '100%',
        backgroundColor: '#f7f7f7',
        borderRadius: 12,
        padding: 16,
        marginBottom: 30,
    },
    label: {
        fontSize: 16,
        color: '#666',
        marginTop: 6,
    },
    value: {
        fontSize: 17,
        fontWeight: 'medium',
        color: Colors.grey1,
        alignSelf: 'flex-end',  // căn sát mép phải
        textAlign: 'right',     // chữ nằm bên phải
    },
    button: {
        backgroundColor: Colors.main_bule,
        width: '100%',
        alignItems: 'center',
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 40,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
