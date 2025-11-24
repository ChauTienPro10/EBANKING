import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import Colors from '../../constants/color';
import BottomNavigation from '../../components/BottomNavigation';
import {
  ArrowLeftIcon,
  MenuIcon,
  TransferIcon,
  CashIcon,
  UserIcon,
  CardIcon,
  PhoneIcon,
  ChevronDownIcon,
} from '../../components/icon';
import {
  mockCardData,
  mockTransactions,
  filterTransactions,
  formatCurrency,
  Transaction,
} from './mockCardData';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

type FilterType = 'all' | 'sent' | 'received';
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Card'>;

const CardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('card');

  const filteredTransactions = filterTransactions(
    mockTransactions,
    activeFilter,
  );

  const bottomTabs = [
    { id: 'home', label: t('bottom_navigation.home'), icon: 'home' },
    { id: 'card', label: t('bottom_navigation.card'), icon: 'card' },
    {
      id: 'settings',
      label: t('bottom_navigation.settings'),
      icon: 'settings',
    },
    {
      id: 'support',
      label: t('bottom_navigation.support'),
      icon: 'help-circle',
    },
  ];

  const handleTabChange = (tabId: string) => {
    if (tabId !== activeTab) {
      setActiveTab(tabId);

      switch (tabId) {
        case 'home':
          navigation.navigate('Home' as never);
          break;
        case 'card':
          break;
        case 'settings':
          navigation.navigate('Settings' as never);
          break;
        case 'support':
          navigation.navigate('Support' as never);
          break;
        default:
          console.log('Unknown tab:', tabId);
      }
    }
  };

  const handleScanSuccess = (value: string) => {
    console.log('QR Code scanned:', value);
  };

  const handleQRPress = () => {
    navigation.navigate('ScannerScreen', { onScanSuccess: handleScanSuccess });
  };

  const getTransactionIcon = (iconName: string) => {
    const iconProps = { size: 24, color: Colors.white };

    switch (iconName) {
      case 'cart':
        return <CardIcon {...iconProps} />;
      case 'phone':
        return <PhoneIcon {...iconProps} />;
      case 'user':
        return <UserIcon {...iconProps} />;
      case 'transfer':
        return <TransferIcon {...iconProps} />;
      case 'cash':
        return <CashIcon {...iconProps} />;
      default:
        return <CardIcon {...iconProps} />;
    }
  };

  const renderCard = () => {
    const spentPercentage =
      (mockCardData.spentAmount / mockCardData.cardLimit) * 100;

    return (
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          {/* Card gradient background effect */}
          <View style={styles.cardGradient}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardNumber}>
                ●●●● {mockCardData.cardNumber}
              </Text>
              <Text style={styles.visaLogo}>VISA</Text>
            </View>

            {/* Card Type */}
            <Text style={styles.cardType}>
              {mockCardData.cardType === 'Credit Card'
                ? t('card.credit_card')
                : t('card.debit_card')}
            </Text>

            {/* Card Footer */}
            <View style={styles.cardFooter}>
              <View style={styles.cardBalance}>
                <Text style={styles.balanceAmount}>
                  {formatCurrency(mockCardData.balance)}
                </Text>
              </View>
              <View style={styles.cardExpiry}>
                <Text style={styles.expiryText}>
                  {mockCardData.expiryMonth}/{mockCardData.expiryYear}
                </Text>
              </View>
            </View>

            {/* Chip Icon */}
            <View style={styles.chipIcon}>
              <View style={styles.chip} />
            </View>
          </View>
        </View>

        {/* Card Indicator Dots */}
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>
    );
  };

  const renderCardLimit = () => {
    const spentPercentage =
      (mockCardData.spentAmount / mockCardData.cardLimit) * 100;

    return (
      <View style={styles.cardLimitContainer}>
        {/* Limit Labels */}
        <View style={styles.limitLabels}>
          <Text style={styles.limitText}>
            {formatCurrency(mockCardData.spentAmount)}
          </Text>
          <Text style={styles.limitText}>
            {formatCurrency(mockCardData.cardLimit)}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[styles.progressBarFill, { width: `${spentPercentage}%` }]}
            />
          </View>
        </View>

        {/* Spent Info */}
        <Text style={styles.spentInfo}>
          {formatCurrency(mockCardData.spentAmount)} {t('card.spent')}{' '}
          {t('card.of')} {formatCurrency(mockCardData.cardLimit)}{' '}
          {t('card.card_limit')}
        </Text>

        {/* View Details */}
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => setIsDetailsExpanded(!isDetailsExpanded)}
          activeOpacity={0.7}
        >
          <Text style={styles.viewDetailsText}>{t('card.view_details')}</Text>
          <ChevronDownIcon size={20} color={Colors.grey3} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderTransactionItem = (transaction: Transaction) => {
    const isReceived = transaction.type === 'received';
    const amountColor = isReceived ? Colors.main_green : Colors.orange;
    const amountPrefix = isReceived ? '+' : '-';

    return (
      <TouchableOpacity
        key={transaction.transactionId}
        style={styles.transactionItem}
        activeOpacity={0.7}
      >
        <View style={styles.transactionLeft}>
          <View
            style={[
              styles.transactionIcon,
              {
                backgroundColor: isReceived
                  ? Colors.main_green
                  : Colors.main_bule,
              },
            ]}
          >
            {getTransactionIcon(transaction.merchantIcon)}
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.merchantName}>{transaction.merchantName}</Text>
            <Text style={styles.transactionDate}>
              {transaction.date} • {transaction.time}
            </Text>
          </View>
        </View>
        <Text style={[styles.transactionAmount, { color: amountColor }]}>
          {amountPrefix} {formatCurrency(transaction.amount)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTransactionHistory = () => {
    return (
      <View style={styles.transactionHistoryContainer}>
        <Text style={styles.transactionTitle}>{t('card.transactions')}</Text>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === 'all' && styles.activeFilterTab,
            ]}
            onPress={() => setActiveFilter('all')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === 'all' && styles.activeFilterTabText,
              ]}
            >
              {t('card.all')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === 'sent' && styles.activeFilterTab,
            ]}
            onPress={() => setActiveFilter('sent')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === 'sent' && styles.activeFilterTabText,
              ]}
            >
              {t('card.sent')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === 'received' && styles.activeFilterTab,
            ]}
            onPress={() => setActiveFilter('received')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === 'received' && styles.activeFilterTabText,
              ]}
            >
              {t('card.received')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transaction List */}
        <View style={styles.transactionList}>
          {filteredTransactions.map(renderTransactionItem)}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeftIcon size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{t('card.title')}</Text>

        <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
          <MenuIcon size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Card Display */}
        {renderCard()}

        {/* Card Limit */}
        {renderCardLimit()}

        {/* Transaction History */}
        {renderTransactionHistory()}
      </ScrollView>

      <BottomNavigation
        activeTab={activeTab}
        tabs={bottomTabs}
        onChange={handleTabChange}
        onQRPress={handleQRPress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },

  // Card Styles
  cardContainer: {
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  cardGradient: {
    flex: 1,
    backgroundColor: Colors.main_bule,
    padding: 20,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
    letterSpacing: 2,
  },
  visaLogo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    fontStyle: 'italic',
  },
  cardType: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: 30,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardBalance: {
    flex: 1,
  },
  balanceAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.white,
  },
  cardExpiry: {
    alignItems: 'flex-end',
  },
  expiryText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '600',
  },
  chipIcon: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  chip: {
    width: 40,
    height: 30,
    backgroundColor: Colors.yellow,
    borderRadius: 6,
    opacity: 0.9,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.grey2,
  },
  activeDot: {
    backgroundColor: Colors.main_bule,
    width: 24,
  },

  // Card Limit Styles
  cardLimitContainer: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  limitLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  limitText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: Colors.grey2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.main_bule,
    borderRadius: 4,
  },
  spentInfo: {
    fontSize: 13,
    color: Colors.grey3,
    marginBottom: 12,
    textAlign: 'center',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.grey3,
    marginRight: 4,
  },

  // Transaction History Styles
  transactionHistoryContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  transactionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeFilterTab: {
    backgroundColor: Colors.main_bule,
    borderColor: Colors.main_bule,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.grey3,
  },
  activeFilterTabText: {
    color: Colors.white,
  },
  transactionList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: Colors.grey3,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
});

export default CardScreen;
