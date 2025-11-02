import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchTransactionHistory, TransferResponse } from '../../store/fetchAPI/TransactionHistory';
import Colors from '../../constants/color';
import { Header } from '../../components';

const TransactionHistoryScreen: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    const username = useSelector((state: RootState) => state.app.loginResponse?.username);
    const sender = useSelector((state: RootState) => state.app.accountTransResponse?.accountNumber);
    const transactions = useSelector((state: RootState) => state.transactionHistories.data);
    const loading = useSelector((state: RootState) => state.transactionHistories.loading);
    const error = useSelector((state: RootState) => state.transactionHistories.error);

    useEffect(() => {
        if (username && sender) {
            dispatch(fetchTransactionHistory({ username, sender, page: 1, limit: 20 }));
        }
    }, [username, sender, dispatch]);

    const renderItem = ({ item }: { item: TransferResponse }) => {
        const date = new Date(item.transactionAt).toLocaleString();

        return (
            <View style={styles.itemContainer}>
                <View style={styles.row}>
                    <Text style={styles.label}>Mã GD:</Text>
                    <Text style={styles.value}>{item.transactionId}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Người gửi:</Text>
                    <Text style={styles.value}>{item.senderAccountNumber}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Người nhận:</Text>
                    <Text style={styles.value}>{item.receiverAccountNumber}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Số tiền:</Text>
                    <Text style={styles.value}>{item.amount.toLocaleString()} {item.currency}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Trạng thái:</Text>
                    <Text style={styles.value}>{item.status}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Thời gian:</Text>
                    <Text style={styles.value}>{date}</Text>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.main_bule} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <Header title="Lịch sử giao dịch" />
            <FlatList
                data={transactions}
                keyExtractor={(item) => item.transactionId.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Text>Không có giao dịch nào</Text>
                    </View>
                }
            />
        </View>
    );
};

export default TransactionHistoryScreen;

const styles = StyleSheet.create({
    list: {
        padding: 16,
    },
    itemContainer: {
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    label: {
        fontWeight: '600',
        width: 110,
        color: '#333',
    },
    value: {
        flex: 1,
        color: '#555',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    error: {
        color: 'red',
    },
});
