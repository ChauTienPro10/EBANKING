import React, { useState, useRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/color';
import Toast from 'react-native-toast-message';
import GText from './GText';

interface PinInputProps {
    length?: number;
    onComplete: (pin: string) => void;
    create: boolean;
    hasBiometric?: boolean;
}

const PinInput: React.FC<PinInputProps> = ({ length = 4, onComplete, create, hasBiometric }) => {
    const [pin, setPin] = useState<string[]>(Array(length).fill(''));
    const inputsRef = useRef<Array<TextInput | null>>([]);
    const [confirmPin, setConfirmPin] = useState('');

    const handleChange = (text: string, index: number) => {
        if (!/^\d$/.test(text) && text !== '') return;

        const newPin = [...pin];
        newPin[index] = text;
        setPin(newPin);

        // focus ô tiếp theo nếu có
        if (text && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }

        // gọi onComplete khi nhập đầy đủ
        if (newPin.every((digit) => digit !== '')) {
            const pinString = newPin.join('');
            if (create) {
                if (confirmPin === pinString) {
                    // call api tạo pin
                } else {
                    if (confirmPin.length === length) {
                        Toast.show({
                            type: 'error',
                            text1: "Lỗi",
                            text2: "Mã PIN không khớp!"
                        });
                        return;
                    }
                    setConfirmPin(pinString);
                    // reset pin để nhập lại
                    setPin(Array(length).fill(''));
                    inputsRef.current[0]?.focus();
                }
            } else {
                onComplete(pinString);
            }
        }
    };

    const handleFocus = (index: number) => {
        const firstEmptyIndex = pin.findIndex((v) => v === '');

        if (firstEmptyIndex !== -1 && index > firstEmptyIndex) {
            inputsRef.current[firstEmptyIndex]?.focus();
        }
    };


    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace') {
            if (pin[index] === '' && index > 0) {
                const newPin = [...pin];
                newPin[index - 1] = '';
                setPin(newPin);
                inputsRef.current[index - 1]?.focus();
            }
        }
    };


    return (
        <View style={styles.containerMaster}>
            <GText color={Colors.grey1} style={{
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                marginTop: 60
            }}>
                {confirmPin.length === length ? 'Nhập lại mã PIN' : 'Nhập mã PIN 4 số'}
            </GText>
            <View style={styles.container}>
                {pin.map((digit, index) => (
                    <TextInput
                        key={index}
                        style={styles.input}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={digit}
                        onFocus={() => handleFocus(index)}
                        onChangeText={(text) => handleChange(text, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        ref={(ref) => { inputsRef.current[index] = ref; }} // fix ref type
                        secureTextEntry={true}
                    />
                ))}
            </View>
            {hasBiometric &&
                <View style={styles.biometricComponent}>
                    <TouchableOpacity style={styles.button}>
                        <Icon name="finger-print" size={20} color={Colors.red} />;
                        <Text style={styles.buttonText}>Xác thực bằng sinh trắc học</Text>
                    </TouchableOpacity>
                </View>
            }
        </View>
    );
};

export default PinInput;

const styles = StyleSheet.create({

    containerMaster: {
        width: "100%",
        justifyContent: 'center',
        alignItems: 'center'
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '60%',
        marginVertical: 20,
    },
    input: {
        width: 50,
        height: 50,
        borderWidth: 1,
        borderColor: Colors.grey1,
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 20,
        color: Colors.black
    },
    biometricComponent: {
        marginTop: 20,
        alignItems: 'center',
        flexDirection: 'row'
    },

    title: {
        fontSize: 16,
        color: '#555',
        marginBottom: 10,
    },
    button: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    buttonText: {
        marginLeft: 8,
        color: Colors.grey1,
        fontWeight: '200',
        fontSize: 16,

    },
});
