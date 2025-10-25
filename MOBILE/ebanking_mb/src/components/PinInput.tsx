import React, { useState, useRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/color';

interface PinInputProps {
    length?: number;
    onComplete: (pin: string) => void;
    hasBiometric?: boolean;
}

const PinInput: React.FC<PinInputProps> = ({ length = 4, onComplete }) => {
    const [pin, setPin] = useState<string[]>(Array(length).fill(''));
    const inputsRef = useRef<Array<TextInput | null>>([]);

    const handleChange = (text: string, index: number) => {
        if (!/^\d$/.test(text) && text !== '') return; // chỉ cho phép số 0-9

        const newPin = [...pin];
        newPin[index] = text;
        setPin(newPin);

        // focus ô tiếp theo nếu có
        if (text && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }

        // gọi onComplete khi nhập đầy đủ
        if (newPin.every((digit) => digit !== '')) {
            onComplete(newPin.join(''));
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && pin[index] === '' && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    return (
        <View style={styles.containerMaster}>
            <View style={styles.container}>
                {pin.map((digit, index) => (
                    <TextInput
                        key={index}
                        style={styles.input}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={digit}
                        onChangeText={(text) => handleChange(text, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        ref={(ref) => { inputsRef.current[index] = ref; }} // fix ref type
                        secureTextEntry={true}
                    />
                ))}
            </View>
            <View style={styles.biometricComponent}>
                <TouchableOpacity style={styles.button}>
                    <Icon name="finger-print" size={20} color={Colors.red} />;
                    <Text style={styles.buttonText}>Xác thực bằng sinh trắc học</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default PinInput;

const styles = StyleSheet.create({

    containerMaster: {
        width: "100%"
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginVertical: 20,
    },
    input: {
        width: 50,
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 20,
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
