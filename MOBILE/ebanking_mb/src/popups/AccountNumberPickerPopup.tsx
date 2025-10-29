import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
} from 'react-native';
import Toast from 'react-native-toast-message';


// Hàm gen mã 12 số
function generateRandomCode(length: number): string {
    let result = '';
    const characters = '0123456789';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}

// Gen 3 mã
const codes: string[] = Array.from({ length: 3 }, () => generateRandomCode(12));

const types = ["SAVINGS", "DEVTEST"];

type AccountNumberPickerPopupProps = {
    visible: boolean;
    onClose: () => void;
    onSelect: (accountNumber: string, accountType: string) => void;
};

const AccountNumberPickerPopup: React.FC<AccountNumberPickerPopupProps> = ({
    visible,
    onClose,
    onSelect,
}) => {
    const [selectedCode, setSelectedCode] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<string | null>(null);

    const handleConfirm = () => {
        if (selectedCode && selectedType) {
            onSelect(selectedCode, selectedType);
            onClose();
        } else {
            Toast.show({
                type: 'error',
                text1: 'Vui lòng chọn đủ thông tin',
                text2: '',
                props: {
                    style: { zIndex: 99999, elevation: 9999 },
                },
            });
        }
    };

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.popup}>
                    <Text style={styles.title}>Chọn số tài khoản</Text>

                    <Text style={styles.subtitle}>Số tài khoản:</Text>
                    <FlatList
                        data={codes}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.item,
                                    selectedCode === item && styles.selectedItem,
                                ]}
                                onPress={() => setSelectedCode(item)}
                            >
                                <Text style={styles.itemText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                    />

                    <Text style={styles.subtitle}>Loại tài khoản:</Text>
                    <FlatList
                        data={types}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.item,
                                    selectedType === item && styles.selectedItem,
                                ]}
                                onPress={() => setSelectedType(item)}
                            >
                                <Text style={styles.itemText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                    />

                    <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                        <Text style={styles.confirmText}>Xác nhận</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeText}>Đóng</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default AccountNumberPickerPopup;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popup: {
        width: 300,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
    },
    item: {
        paddingVertical: 12,
        borderBottomColor: '#ddd',
        borderBottomWidth: 1,
        borderRadius: 6,
    },
    selectedItem: {
        backgroundColor: '#D0E8FF',
    },
    itemText: {
        fontSize: 16,
        textAlign: 'center',
    },
    confirmButton: {
        marginTop: 15,
        padding: 10,
        backgroundColor: '#28a745',
        borderRadius: 8,
    },
    confirmText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    closeButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#007AFF',
        borderRadius: 8,
    },
    closeText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});
