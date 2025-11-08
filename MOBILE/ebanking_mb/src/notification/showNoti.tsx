import React from 'react';
import { View, Text, StyleSheet, Platform, StatusBar } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Header } from '../components';

type ShowNotificationScreenRouteProp = RouteProp<
    { params: { title: string; body: string } },
    'params'
>;

const ShowNotificationScreen: React.FC = () => {
    const route = useRoute<ShowNotificationScreenRouteProp>();
    const { title, body } = route.params;

    return (
        <View style={styles.container}>
            <Header title={title} />
            <View style={styles.content}>
                <Text style={styles.body}>{body}</Text>
            </View>
        </View>
    );
};

export default ShowNotificationScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    body: {
        fontSize: 16,
        lineHeight: 22,
    },
    content: {
        padding: 20
    }
});
