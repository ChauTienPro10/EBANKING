import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import Colors from '../../constants/color';
import { Header } from '../../components';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LoadingPopup from '../../popups/LoadingPopup';
import fetch from '../../utils/fetch';
import { API } from '../../constants/api';
import AccountNumberPickerPopup from '../../popups/AccountNumberPickerPopup';
import Toast from 'react-native-toast-message';
import { AppDispatch, store } from '../../store';

type OpenCardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OpenCard'>;
type OpenCardRouteProp = RouteProp<RootStackParamList, 'OpenCard'>;

const OpenAccountScreen: React.FC = () => {
    const route = useRoute<OpenCardRouteProp>();
    const navigation = useNavigation<OpenCardNavigationProp>();
    const { userInfo } = route.params;
    const [loading, setLoading] = useState(false);
    const [popupVisible, setPopupVisible] = useState(false);
    const dispatch: AppDispatch = store.dispatch;

    const handleSubmit = async (code: string, type: string) => {
        setLoading(true);
        const url = API.OPEN_ACCOUNT_TRANSACTION;
        const payload = {
            accountNumber: code,
            accountType: type,
            userId: userInfo?.id
        }
        try {
            const response = await fetch.post(url, payload, true)
            Toast.show({
                type: 'success',       
                text1: 'Liên kết tài khoản thành công!',
                text2: 'Bạn có thể tiếp tục sử dụng dịch vụ.',
                visibilityTime: 2000,    
            });
            
            navigation.navigate('Home' as never);

        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Liên kết tài khoản thất bại.',
                text2: 'Vui long liên hệ tư vấn khách hàng để được hộ trợ',
                visibilityTime: 2000,    
            });
        } finally {
            setLoading(false);
        }
    };
    return (
        <View>
            <LoadingPopup visible={loading} message="Đang xử lý..." />
            <AccountNumberPickerPopup
                visible={popupVisible}
                onClose={() => setPopupVisible(false)}
                onSelect={(code, type) => handleSubmit(code, type)}
            />
            <Header title="Xác nhận thông tin" />
            <ScrollView contentContainerStyle={styles.container}>
                {/* <Text style={styles.title}>Mở tài khoản ngân hàng</Text> */}

                <TextInput
                    style={styles.input}
                    placeholder="Họ và tên"
                    value={userInfo?.fullName}
                    editable={false}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Số điện thoại"
                    keyboardType="phone-pad"
                    value={userInfo?.phone || 'Chưa cập nhật'}
                    editable={false}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Số CMND/CCCD"
                    keyboardType="numeric"
                    value={userInfo?.citizenId}
                    editable={false}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Email (tuỳ chọn)"
                    keyboardType="email-address"
                    value={userInfo?.email || 'Chưa cập nhật'}
                    editable={false}
                />

                <TextInput
                    style={[styles.input, { height: 80 }]}
                    placeholder="Địa chỉ liên hệ"
                    multiline
                    value={userInfo?.address}
                    editable={false}
                />

                <TouchableOpacity style={styles.button} onPress={() => { setPopupVisible(true) }}>
                    <Text style={styles.buttonText}>Mở tài khoản</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button_update} onPress={() => { navigation.navigate('Profile' as never) }}>
                    <Text style={styles.buttonText}>Sửa</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default OpenAccountScreen;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#f7f9fc',
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 20,
        color: Colors.grey1,
    },
    input: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 12,
        color: Colors.black
    },
    button: {
        backgroundColor: Colors.main_bule,
        paddingVertical: 14,
        borderRadius: 8,
        marginTop: 10,
    },

    button_update: {
        backgroundColor: Colors.orange,
        paddingVertical: 14,
        borderRadius: 8,
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 16,
    },
});
