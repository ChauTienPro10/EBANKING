import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Colors from '../constants/color';
import PinInput from '../components/PinInput';

interface ConfirmTransferModalProps {
    visible: boolean;
    data: Record<string, string>;
    onConfirm: (pin: string) => void;
    onCancel: () => void;
}

const ConfirmTransferModal: React.FC<ConfirmTransferModalProps> = ({
    visible,
    data,
    onConfirm,
    onCancel,
}) => {

    const [pinAuth, setPinAuth] = useState(false);
    const handleComplete = (pin: string) => {
        onConfirm(pin);
    };
    return (
        <Modal
            animationType="fade"
            transparent
            visible={visible}
            onRequestClose={onCancel}
        >
            {pinAuth ? <View style={styles.screenPIN}>
                <Text style={styles.titlePIN}>Nhập mã PIN 4 số</Text>

                <View>
                    <PinInput length={4} onComplete={handleComplete} create={false} hasBiometric={true} />
                </View>
            </View> :
                <View style={styles.overlay}>
                    <View style={styles.container}>
                        <Text style={styles.title}>Xác nhận giao dịch</Text>
                        <ScrollView style={styles.dataContainer}>
                            {Object.entries(data).map(([key, value]) => (
                                <View style={styles.row} key={key}>
                                    <Text style={styles.label}>{key}</Text>
                                    <Text style={styles.value}>{value}</Text>
                                </View>
                            ))}
                        </ScrollView>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                                <Text style={styles.buttonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmButton} onPress={() => setPinAuth(true)}>
                                <Text style={styles.buttonText}>Xác nhận</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>}
        </Modal>
    );
};

export default ConfirmTransferModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: 320,
        padding: 20,
        borderRadius: 12,
        backgroundColor: 'white',
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    dataContainer: {
        maxHeight: 200,
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    label: {
        fontWeight: '500',
        color: '#555',
    },
    value: {
        fontWeight: '600',
        color: '#000',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        marginRight: 10,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#ccc',
        borderRadius: 6,
    },
    confirmButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: Colors.main_bule,
        borderRadius: 6,
    },
    buttonText: {
        color: 'white',
        fontWeight: '500',
    },

    screenPIN: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        paddingHorizontal: 20,
    },
    titlePIN: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
        color: '#333',
    },
    pinWrapperPIN: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
});
