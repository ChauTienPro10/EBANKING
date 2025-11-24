import React, { useState } from 'react';
import { StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '../../constants/color';
import BottomNavigation from '../../components/BottomNavigation';
import Header from '../../components/Header';
import { CreditCard, CardLimitSection, TransactionList } from './components';
import { useCardActions } from './hooks/useCardActions';
import { useCardNavigation } from './hooks/useCardNavigation';
import {
  mockCardData,
  mockTransactions,
  filterTransactions,
} from './mockCardData';

type FilterType = 'all' | 'sent' | 'received';

const CardScreen: React.FC = () => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Custom hooks
  const { isCardNumberVisible, toggleCardNumberVisibility, copyCardNumber } =
    useCardActions();
  const { activeTab, handleBackPress, handleTabChange, handleQRPress } =
    useCardNavigation();

  // Card data
  const fullCardNumber = '1237689076545678';
  const maskedCardNumber = '1237 •••• •••• 5678';
  const displayCardNumber = '1237 6890 7654 5678';

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

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={t('card.title')}
        showBackButton
        onBackPress={handleBackPress}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <CreditCard
          bankName=".Pay"
          cardNumber={displayCardNumber}
          isNumberVisible={isCardNumberVisible}
          maskedNumber={maskedCardNumber}
          holderName="Lê Tất Thắng"
          expiryMonth={mockCardData.expiryMonth}
          expiryYear={mockCardData.expiryYear}
          onNumberPress={toggleCardNumberVisibility}
          onNumberLongPress={() => copyCardNumber(fullCardNumber)}
        />

        <CardLimitSection
          spentAmount={mockCardData.spentAmount}
          cardLimit={mockCardData.cardLimit}
        />

        <TransactionList
          transactions={filteredTransactions}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
});

export default CardScreen;
