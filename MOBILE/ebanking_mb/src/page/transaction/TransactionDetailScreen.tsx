import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootStackParamList } from '../../navigation/types';
import Colors from '../../constants/color';
import { useTransactionDetail } from './hooks/useTransactionDetail';
import TransactionSummaryCard from './components/TransactionSummaryCard';
import TransferInfoSection from './components/TransferInfoSection';
import ActionButtons from './components/ActionButtons';

type TransactionDetailRouteProp = RouteProp<
  RootStackParamList,
  'TransactionDetail'
>;

const TransactionDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<TransactionDetailRouteProp>();
  const { transaction, currentAccountNumber } = route.params;

  const {
    isIncoming,
    timeStr,
    dateStr,
    iconConfig,
    statusBadge,
    displayTitle,
    bankName,
    handleCopyTransactionId,
    handleSupport,
    handleNewTransaction,
    handleTransferMore,
  } = useTransactionDetail({
    transaction,
    currentAccountNumber,
    navigation,
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.main_bule} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi Tiết Giao Dịch</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => (navigation as any).navigate('Home')}
        >
          <MaterialCommunityIcons name="home-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Transaction Summary Card */}
        <TransactionSummaryCard
          transaction={transaction}
          displayTitle={displayTitle}
          bankName={bankName}
          iconConfig={iconConfig}
          isIncoming={isIncoming}
          currentAccountNumber={currentAccountNumber}
          statusBadge={statusBadge}
          timeStr={timeStr}
          dateStr={dateStr}
          onCopyTransactionId={handleCopyTransactionId}
        />

        {/* Transfer Info Section */}
        <TransferInfoSection
          transaction={transaction}
          isIncoming={isIncoming}
          displayTitle={displayTitle}
          bankName={bankName}
        />

        {/* Note for saving receiver - only for outgoing transfers */}
        {transaction.transactionType === 'TRANSFER' && !isIncoming && (
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              Lưu người nhận để tìm lại nhanh hơn vào lần sau.
            </Text>
          </View>
        )}

        {/* Bottom Action Buttons */}
        <ActionButtons
          transactionType={transaction.transactionType}
          isIncoming={isIncoming}
          onSupport={handleSupport}
          onTransferMore={handleTransferMore}
          onNewTransaction={handleNewTransaction}
        />
      </ScrollView>
    </View>
  );
};

export default TransactionDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    height: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: Colors.main_bule,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  headerButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  noteBox: {
    backgroundColor: '#E8F5E9',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  noteText: {
    fontSize: 13,
    color: '#2E7D32',
    textAlign: 'center',
  },
});
