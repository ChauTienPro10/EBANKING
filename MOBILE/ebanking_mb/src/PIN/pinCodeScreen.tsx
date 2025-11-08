import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, StatusBar } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { GText, Header } from '../components';
import PinInput from '../components/PinInput';
import Colors from '../constants/color';

const setPinCodeScreen: React.FC = () => {


    return (
        <View style={styles.container}>
            <Header title='PIN' />

            <View style={styles.pin_container}>

                <PinInput length={4} onComplete={() => {  }} create={true} hasBiometric={false} />
            </View>

        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    pin_container: {
        flex: 1,
        paddingTop: 100
    },
    text: {
    }
});
export default setPinCodeScreen;