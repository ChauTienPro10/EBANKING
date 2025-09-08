import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '../constants/color';
import TextStyles from '../constants/textStyle';
import { EyeIcon, EyeOffIcon, TrendingUpIcon, CardIcon, HomeIcon } from './icon';

const { width } = Dimensions.get('window');

interface AccountCardProps {
  accountNumber: string;
  accountName: string;
  availableBalance: number;
  ledgerBalance?: number;
  pendingBalance?: number;
  currency?: string;
  onPress?: () => void;
  showMaskToggle?: boolean;
  cardType?: 'primary' | 'savings' | 'credit';
}

const AccountCard: React.FC<AccountCardProps> = ({
  accountNumber,
  accountName,
  availableBalance,
  ledgerBalance,
  pendingBalance,
  currency = 'VND',
  onPress,
  showMaskToggle = true,
  cardType = 'primary',
}) => {
  const { t } = useTranslation();
  const [isMasked, setIsMasked] = useState(true); // Mặc định ẩn thông tin
  const [showDetails, setShowDetails] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleMaskToggle = () => {
    setIsMasked(!isMasked);
  };

  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else if (!isAuthenticated) {
      
        Alert.prompt(
          t('mock_data.messages.pin_auth'),
          t('mock_data.messages.pin_prompt'),
          [
            { text: t('mock_data.messages.cancel'), style: 'cancel' },
            { 
              text: t('mock_data.messages.pin_confirm'), 
              onPress: (pin?: string) => {
                if (pin === t('ui.default_pin')) {
                  setIsAuthenticated(true);
                  setIsMasked(false);
                  setShowDetails(true);
                } else {
                  Alert.alert(t('mock_data.messages.pin_error'), t('mock_data.messages.pin_incorrect'));
                }
              }
            }
          ],
          'secure-text'
        );
    } else {
      setShowDetails(!showDetails);
    }
  };

  const formatAccountNumber = (account: string): string => {
    if (isMasked) {
      return `**** **** **** ${account.slice(-4)}`;
    }
    // Format as 4 groups of 4 digits
    const cleaned = account.replace(/\D/g, '');
    return cleaned.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');
  };

  const formatCurrency = (amount: number): string => {
    if (isMasked) {
      return '••••••••';
    }
    
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCardStyle = () => {
    switch (cardType) {
      case 'savings':
        return styles.savingsCard;
      case 'credit':
        return styles.creditCard;
      default:
        return styles.primaryCard;
    }
  };

  const getCardColor = () => {
    switch (cardType) {
      case 'savings':
        return '#4CAF50';
      case 'credit':
        return '#FF9800';
      default:
        return '#2196F3';
    }
  };

  const getCardIcon = () => {
    const iconProps = { size: 20, color: Colors.white };
    switch (cardType) {
      case 'savings':
        return <TrendingUpIcon {...iconProps} />;
      case 'credit':
        return <CardIcon {...iconProps} />;
      default:
        return <HomeIcon {...iconProps} />;
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, getCardStyle()]} 
      onPress={handleCardPress}
      activeOpacity={0.8}
      accessibilityLabel={`Tài khoản ${accountName}`}
      accessibilityHint="Nhấn để xem chi tiết số dư"
    >
      <View
        style={[styles.gradient, { backgroundColor: getCardColor() }]}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.bankInfo}>
            <Text style={styles.bankName}>{t('ui.bank_name')}</Text>
            {isAuthenticated && <Text style={styles.cardBrand}>{t('ui.card_brand')}</Text>}
          </View>
          
          {showMaskToggle && isAuthenticated && (
            <TouchableOpacity 
              onPress={handleMaskToggle}
              style={styles.maskButton}
              accessibilityLabel={isMasked ? "Hiện số dư" : "Ẩn số dư"}
            >
              {isMasked ? <EyeOffIcon size={18} color={Colors.white} /> : <EyeIcon size={18} color={Colors.white} />}
            </TouchableOpacity>
          )}
        </View>

        {/* Card Type & Icon */}
        <View style={styles.cardTypeSection}>
          <View style={styles.cardTypeContainer}>
            {getCardIcon()}
            <Text style={styles.cardType}>{accountName}</Text>
          </View>
        </View>

        {/* Card Number */}
        <View style={styles.cardNumberContainer}>
          <Text style={styles.cardNumber}>
            {formatAccountNumber(accountNumber)}
          </Text>
        </View>

        {/* Balance Section */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>{t('labels.available_balance')}</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(availableBalance)}
          </Text>
        </View>

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          {isAuthenticated && (
            <>
              <View style={styles.chipContainer}>
                <View style={styles.chip} />
                <View style={styles.chipLines} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.validThru}>{t('ui.valid_thru')}</Text>
                <Text style={styles.expiryDate}>{t('ui.expiry_date')}</Text>
              </View>
            </>
          )}
          {!isAuthenticated && (
            <View style={styles.tapToViewContainer}>
              <Text style={styles.tapToViewText}>{t('ui.tap_to_view')}</Text>
            </View>
          )}
        </View>

        {/* Details Section */}
        {showDetails && (ledgerBalance !== undefined || pendingBalance !== undefined) && (
          <View style={styles.detailsContainer}>
            <View style={styles.detailsRow}>
              <Text style={styles.detailLabel}>{t('labels.ledger_balance')}</Text>
              <Text style={styles.detailAmount}>
                {isMasked ? t('ui.masked_text') : formatCurrency(ledgerBalance || 0)}
              </Text>
            </View>
            {pendingBalance !== undefined && (
              <View style={styles.detailsRow}>
                <Text style={styles.detailLabel}>{t('labels.pending_balance')}</Text>
                <Text style={styles.detailAmount}>
                  {isMasked ? t('ui.masked_text') : formatCurrency(pendingBalance)}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 20,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryCard: {
    // Primary card specific styles
  },
  savingsCard: {
    // Savings card specific styles
  },
  creditCard: {
    // Credit card specific styles
  },
  gradient: {
    borderRadius: 20,
    padding: 24,
    minHeight: 220,
    justifyContent: 'space-between',
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    ...TextStyles.h3,
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  cardBrand: {
    ...TextStyles.h2,
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
    opacity: 0.9,
  },
  cardTypeSection: {
    marginBottom: 20,
  },
  cardTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardType: {
    ...TextStyles.body2,
    color: Colors.white,
    opacity: 0.9,
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  maskButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardNumberContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  cardNumber: {
    ...TextStyles.h1,
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 22,
    letterSpacing: 3,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  balanceSection: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  balanceLabel: {
    ...TextStyles.body2,
    color: Colors.white,
    opacity: 0.8,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  balanceAmount: {
    ...TextStyles.h1,
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 28,
    letterSpacing: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    width: 40,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  chipLines: {
    position: 'absolute',
    left: 8,
    top: 6,
    width: 24,
    height: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 2,
  },
  cardInfo: {
    alignItems: 'flex-end',
  },
  validThru: {
    ...TextStyles.caption,
    color: Colors.white,
    opacity: 0.7,
    fontSize: 10,
    marginBottom: 2,
  },
  expiryDate: {
    ...TextStyles.body2,
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  tapToViewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapToViewText: {
    ...TextStyles.body2,
    color: Colors.white,
    opacity: 0.8,
    fontSize: 14,
    fontStyle: 'italic',
  },
  detailsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    ...TextStyles.caption,
    color: Colors.white,
    opacity: 0.8,
    fontSize: 12,
  },
  detailAmount: {
    ...TextStyles.caption,
    color: Colors.white,
    fontWeight: '600',
    fontSize: 12,
  },
});

export default AccountCard;
