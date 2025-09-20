import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import CustomButton from '../components/CustomButton';
import Colors from '../constants/color';
import GText from '../components/GText';
import { RootStackParamList } from '../navigation/types';
import { RouteProp } from '@react-navigation/native';
import fetch from '../utils/fetch';
import { API } from '../constants/api';
import ToastService from '../components/ToastService';

type OTPPageRouteProp = RouteProp<RootStackParamList, 'OTPPage'>;
type OTPPageNavigationProp = StackNavigationProp<RootStackParamList, 'OTPPage'>;

const OtpPage: React.FC = () => {

    const route = useRoute<OTPPageRouteProp>();
    const navigation = useNavigation<OTPPageNavigationProp>();
    const { username } = route.params;

    const { t } = useTranslation();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [countDown, setCountDown] = useState(90);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const otpRefs = useRef<TextInput[]>([]);

    useEffect(() => {
        startTimer();
    }, []);


    const handleOtpChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);
        if (text && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleVerifyCode = async () => {
        const otpString = otp.join('');
        
        const handlePostRequest = async (otp: string) => {
            try {
                const data = await fetch.post(API.REGISTER_VERIFY_OTP, {username: username, otpValue: otp}, false);
                ToastService.success("Đăng nhập thành công", "Chào mừng bạn đến với EBANKING");
                navigation.navigate("SignIn");
            } catch (error) {
                ToastService.error('Login failed:', (error as Error).message || String(error));
                return;
            }

        };
        if (otpString.length === 6) {
            setIsLoading(true);
            await handlePostRequest(otpString)
            setIsLoading(false);
        }
    };

    const handleOtpKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace') {
            const newOtp = [...otp];

            if (otp[index]) {
                newOtp[index] = '';
                setOtp(newOtp);
                if (index > 0) {
                    otpRefs.current[index - 1]?.focus();
                }
            } else if (index > 0) {
                newOtp[index - 1] = '';
                setOtp(newOtp);
                otpRefs.current[index - 1]?.focus();
            }
        }
    };

    const handleOtpFocus = (index: number) => {
        const lastFilledIndex = getLastFilledIndex(otp);

        if (index > lastFilledIndex + 1) {
            const nextIndex = Math.min(lastFilledIndex + 1, otp.length - 1);
            otpRefs.current[nextIndex]?.focus();
        }
    };

    const getLastFilledIndex = (arr: string[]): number => {
        for (let i = arr.length - 1; i >= 0; i--) {
            if (arr[i] !== '') {
                return i;
            }
        }
        return -1;
    };

    const startTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        setCountDown(90);
        timerRef.current = setInterval(() => {
            setCountDown(prev => {
                if (prev === 1) {
                    clearInterval(timerRef.current!);
                    stopTimer();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const renderCodeStep = () => (
        <>

            <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(ref) => {
                            if (ref) otpRefs.current[index] = ref;
                        }}
                        style={[
                            styles.otpInput,
                            digit ? styles.otpInputFilled : styles.otpInputEmpty
                        ]}
                        value={digit}
                        onChangeText={(text) => handleOtpChange(text, index)}
                        onKeyPress={(e) => handleOtpKeyPress(e, index)}
                        keyboardType="number-pad"
                        onFocus={() => handleOtpFocus(index)}
                        maxLength={1}
                        textAlign="center"
                        selectTextOnFocus
                    />
                ))}
            </View>

            <View style={styles.resendContainer}>
                <GText type='systemLight_14' color={Colors.grey1}>{t('sign_in.text_not_get_otp')}</GText>
                <TouchableOpacity disabled={countDown !== 0} onPress={async () => { await setCountDown(90); startTimer() }}>
                    <GText type='systemLight_14' color={countDown === 0 ? Colors.main_bule : Colors.grey1}>{' '}{t('sign_in.text_send_again')}</GText>
                </TouchableOpacity>
            </View>

            <CustomButton
                title={t('sign_in.text_auth')}
                onPress={handleVerifyCode}
                loading={isLoading}
                disabled={otp.join('').length !== 6}
                containerStyle={styles.verifyButton}
            />
            {countDown !== 0 && <GText type='systemLight_14' color={Colors.black} style={{
                width: '100%',
                textAlign: 'center',
            }}>{countDown}{'(s)'}</GText>}

        </>

    );

    return (
        <View style={styles.containerMaster}>
            <View style={styles.containerTitle}>
                <GText type='systemLight_14' color={Colors.black}>
                    {t('sign_in.otp_was_send')}
                    <GText type='systemLight_14' color={Colors.main_bule}>
                        {` ${username}`}
                    </GText>
                </GText>
            </View>

            {renderCodeStep()}
        </View>
    );
}

const styles = StyleSheet.create({

    containerMaster: {
        flexDirection: 'column',
        paddingHorizontal: 16,
        paddingVertical: 100
    },

    containerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },

    container: {
        paddingTop: 50,
        flex: 1,
        backgroundColor: Colors.white
    },


    header: {
        marginTop: 20,
        marginBottom: 40,
    },


    content: {
        flex: 1,
        alignItems: 'center',
    },

    otpInputEmpty: {
        borderColor: Colors.grey1,
        backgroundColor: Colors.grey1,
    },

    form: {
        width: '100%',
        marginBottom: 40,
    },

    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 24
    },
    otpInput: {
        width: 50,
        height: 60,
        borderRadius: 12,
        borderWidth: 2,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.white,
    },


    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#6B7280',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },

    verifyButton: {
        marginBottom: 24,
    },

    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },

    otpInputFilled: {
        borderColor: Colors.main_bule,
        backgroundColor: Colors.main_bule,
    },
});


export default OtpPage;