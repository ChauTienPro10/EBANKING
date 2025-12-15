import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootState, AppDispatch } from '../../store';
import { fetchTransactionHistory } from '../../store/fetchAPI/TransactionHistory';
import { useSuspiciousTransactions } from './hooks/useSuspiciousTransactions';
import { SuspiciousTransaction } from './types/suspiciousTypes';
import SuspiciousTransactionCard from './components/SuspiciousTransactionCard';
import SuspiciousTransactionDetailModal from './components/SuspiciousTransactionDetailModal';
import Colors from '../../constants/color';

const SuspiciousTransactionsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<SuspiciousTransaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useState(new Animated.Value(0))[0];

  const username = useSelector(
    (state: RootState) => state.app.loginResponse?.username,
  );
  const currentAccountNumber = useSelector(
    (state: RootState) => state.app.accountTransResponse?.accountNumber,
  );

  const { analysis, suspiciousCount, allSuspicious, loading, hasData } =
    useSuspiciousTransactions();

  const onRefresh = () => {
    setRefreshing(true);
    if (username && currentAccountNumber) {
      dispatch(
        fetchTransactionHistory({
          username,
          sender: currentAccountNumber,
          page: 1,
          limit: 20,
        }),
      ).finally(() => setRefreshing(false));
    } else {
      setRefreshing(false);
    }
  };

  const handleTransactionPress = (transaction: SuspiciousTransaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleReportFraud = (transaction: SuspiciousTransaction) => {
    // TODO: Implement report fraud API call
  };

  const handleConfirmSafe = (transaction: SuspiciousTransaction) => {
    // TODO: Implement confirm safe API call
  };

  const handleFlipCard = () => {
    Animated.timing(flipAnimation, {
      toValue: isFlipped ? 0 : 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Flippable Summary Card */}
      {hasData && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleFlipCard}
          style={styles.flipCardContainer}
        >
          {/* Front Side - Summary */}
          <Animated.View
            style={[
              styles.summaryCard,
              {
                transform: [{ rotateY: frontInterpolate }],
                backfaceVisibility: 'hidden',
              },
            ]}
          >
            <View style={styles.summaryIcon}>
              <MaterialCommunityIcons
                name="shield-alert"
                size={28}
                color="#FF9500"
              />
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryTitle} numberOfLines={1}>
                {t('suspicious_transactions.summary_title')}
              </Text>
              <Text
                style={styles.summaryMessage}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {t('suspicious_transactions.summary_message', {
                  count: suspiciousCount,
                  days: 7,
                })}
              </Text>
            </View>
            <View style={styles.tapIconContainer}>
              <MaterialCommunityIcons
                name="flip-to-front"
                size={20}
                color="#FF9500"
              />
            </View>
          </Animated.View>

          {/* Back Side - Risk Stats */}
          <Animated.View
            style={[
              styles.statsCard,
              {
                transform: [{ rotateY: backInterpolate }],
                backfaceVisibility: 'hidden',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
              },
            ]}
          >
            <View style={styles.statsRow}>
              {analysis.highRisk.length > 0 && (
                <View style={[styles.statBadge, styles.statBadgeHigh]}>
                  <Text style={styles.statBadgeCount}>
                    {analysis.highRisk.length}
                  </Text>
                  <Text style={styles.statBadgeLabel}>
                    {t('suspicious_transactions.risk_level_high')}
                  </Text>
                </View>
              )}
              {analysis.mediumRisk.length > 0 && (
                <View style={[styles.statBadge, styles.statBadgeMedium]}>
                  <Text style={styles.statBadgeCount}>
                    {analysis.mediumRisk.length}
                  </Text>
                  <Text style={styles.statBadgeLabel}>
                    {t('suspicious_transactions.risk_level_medium')}
                  </Text>
                </View>
              )}
              {analysis.lowRisk.length > 0 && (
                <View style={[styles.statBadge, styles.statBadgeLow]}>
                  <Text style={styles.statBadgeCount}>
                    {analysis.lowRisk.length}
                  </Text>
                  <Text style={styles.statBadgeLabel}>
                    {t('suspicious_transactions.risk_level_low')}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.tapIconContainer}>
              <MaterialCommunityIcons
                name="flip-to-back"
                size={20}
                color="#8E8E93"
              />
            </View>
          </Animated.View>
        </TouchableOpacity>
      )}

      {hasData && (
        <Text style={styles.listTitle}>
          {t('suspicious_transactions.detail_title')}
        </Text>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <MaterialCommunityIcons name="shield-check" size={80} color="#34C759" />
      </View>
      <Text style={styles.emptyTitle}>
        {t('suspicious_transactions.empty_title')}
      </Text>
      <Text style={styles.emptyMessage}>
        {t('suspicious_transactions.empty_message')}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.main_bule} />

      {/* Header - Matching App Standard */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {t('suspicious_transactions.title')}
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Transaction List */}
      <FlatList
        data={allSuspicious}
        keyExtractor={item => `suspicious-${item.transactionId}`}
        renderItem={({ item }) => (
          <SuspiciousTransactionCard
            transaction={item}
            currentAccountNumber={currentAccountNumber || ''}
            onPress={handleTransactionPress}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.main_bule]}
            tintColor={Colors.main_bule}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Detail Modal */}
      <SuspiciousTransactionDetailModal
        visible={showDetailModal}
        transaction={selectedTransaction}
        currentAccountNumber={currentAccountNumber || ''}
        onClose={() => setShowDetailModal(false)}
        onReportFraud={handleReportFraud}
        onConfirmSafe={handleConfirmSafe}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  // Header - Matching App Standard (78px height, blue, rounded bottom)
  header: {
    height: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.main_bule,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  headerLeft: {
    width: 70,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    width: 70,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
  },
  headerContainer: {
    paddingTop: 16,
  },
  // Flip Card Container
  flipCardContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    height: 90,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FF9500',
    alignItems: 'center',
    height: 90,
  },
  summaryIcon: {
    marginRight: 12,
  },
  summaryContent: {
    flex: 1,
    marginRight: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  summaryMessage: {
    fontSize: 12,
    color: '#3C3C43',
    lineHeight: 20,
  },
  tapIconContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  // Stats Card (Back Side)
  statsCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    justifyContent: 'center',
    height: 90,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingRight: 32,
  },
  statBadge: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    marginHorizontal: 4,
  },
  statBadgeHigh: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FF3B30',
  },
  statBadgeMedium: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9500',
  },
  statBadgeLow: {
    backgroundColor: '#FFFBEA',
    borderColor: '#FFCC00',
  },
  statBadgeCount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  statBadgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#3C3C43',
    textTransform: 'uppercase',
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginHorizontal: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default SuspiciousTransactionsScreen;
