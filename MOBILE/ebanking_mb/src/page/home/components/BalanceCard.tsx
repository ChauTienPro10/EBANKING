import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { EyeIcon, EyeOffIcon, CardIcon } from '../../../components/icon';
import Colors from '../../../constants/color';

interface BalanceCardProps {
  account: any;
  isBalanceVisible: boolean;
  onToggleBalance: () => void;
  onOpenCard: () => void;
  balanceCardScale: Animated.Value;
  balanceCardOpacity: Animated.Value;
  balanceCardTranslateY: Animated.Value;
  balanceCardHeight: Animated.Value;
  totalBalanceLabel: string;
  noCardLabel: string;
  openAccountLabel: string;
  cardManagementLabel: string;
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  account,
  isBalanceVisible,
  onToggleBalance,
  onOpenCard,
  balanceCardScale,
  balanceCardOpacity,
  balanceCardTranslateY,
  balanceCardHeight,
  totalBalanceLabel,
  noCardLabel,
  openAccountLabel,
  cardManagementLabel,
}) => {
  return (
    // Outer View: Handles height animation (JS thread) to remove white space
    <Animated.View
      style={[
        styles.balanceCardWrapper,
        {
          height: balanceCardHeight,
        },
      ]}
    >
      {/* Inner View: Handles transform + opacity (Native thread) for smooth animation */}
      <Animated.View
        style={[
          styles.balanceCardInner,
          {
            opacity: balanceCardOpacity,
            transform: [
              { scaleY: balanceCardScale },
              { translateY: balanceCardTranslateY },
            ],
          },
        ]}
        renderToHardwareTextureAndroid={true}
        shouldRasterizeIOS={true}
      >
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            {account != null && (
              <Text style={styles.balanceTitle}>{totalBalanceLabel}</Text>
            )}
            {account === null && (
              <Text style={styles.balanceTitle}>{noCardLabel}</Text>
            )}
          </View>

          <View style={styles.balanceAmount}>
            {isBalanceVisible ? (
              <Text style={styles.balanceText}>
                {account?.balance.toLocaleString('en-US') + ' VND'}
              </Text>
            ) : (
              <TouchableOpacity onPress={onOpenCard}>
                <Text style={styles.balanceTextOpenAccount}>
                  {account === null
                    ? openAccountLabel.toUpperCase()
                    : '*,***,***'}
                </Text>
              </TouchableOpacity>
            )}

            {account != null && (
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={onToggleBalance}
              >
                {isBalanceVisible ? (
                  <EyeOffIcon size={20} color={Colors.white} />
                ) : (
                  <EyeIcon size={20} color={Colors.white} />
                )}
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.balanceFooter}>
            <Text style={styles.balanceFooterText}>{cardManagementLabel}</Text>
            <CardIcon size={16} color={Colors.white} />
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  balanceCardWrapper: {
    overflow: 'hidden',
    backgroundColor: Colors.main_bule,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  balanceCardInner: {
    flex: 1,
  },
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    flex: 1,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  balanceAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  balanceText: {
    color: Colors.main_green,
    fontSize: 24,
    fontWeight: 'bold',
  },
  eyeButton: {
    padding: 4,
  },
  balanceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceFooterText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  balanceTextOpenAccount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.main_green,
  },
});

export default BalanceCard;
