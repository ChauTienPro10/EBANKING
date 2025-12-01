import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Colors from '../../../constants/color';
import { EMVChip, ContactlessIcon } from './CardIcons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

interface CreditCardProps {
  bankName: string;
  cardNumber: string;
  isNumberVisible: boolean;
  maskedNumber: string;
  holderName: any;
  expiryMonth: string;
  expiryYear: string;
  onNumberPress: () => void;
  onNumberLongPress: () => void;
  isLocked?: boolean;
}

export const CreditCard: React.FC<CreditCardProps> = ({
  bankName,
  cardNumber,
  isNumberVisible,
  maskedNumber,
  holderName,
  expiryMonth,
  expiryYear,
  onNumberPress,
  onNumberLongPress,
  isLocked = false,
}) => {
  return (
    <View style={styles.cardContainer}>
      <View style={[styles.card, isLocked && styles.cardLocked]}>
        {/* Gradient Background Layers */}
        <View
          style={[
            styles.cardGradientBase,
            isLocked && styles.cardGradientLocked,
          ]}
        />
        <View
          style={[
            styles.cardGradientOverlay,
            isLocked && styles.cardGradientLocked,
          ]}
        />

        {/* Locked Overlay */}
        {isLocked && (
          <View style={styles.lockedOverlay}>
            <View style={styles.lockedIconContainer}>
              <Text style={styles.lockedIcon}>🔒</Text>
            </View>
          </View>
        )}

        <View style={styles.cardContent}>
          {/* Top Row: Logo*/}
          <View style={styles.cardTopRow}>
            <Text style={styles.bankLogo}>{bankName}</Text>
          </View>
          <View
            style={[styles.statusBadge, isLocked && styles.statusBadgeLocked]}
          >
            <Text
              style={[styles.statusText, isLocked && styles.statusTextLocked]}
            >
              {isLocked ? 'LOCKED' : 'ACTIVE'}
            </Text>
          </View>

          {/* EMV Chip*/}
          <View style={styles.chipRow}>
            <View style={styles.chipContainer}>
              <EMVChip />
            </View>
            <ContactlessIcon />
          </View>

          {/* Card Number - Interactive */}
          <TouchableOpacity
            onPress={onNumberPress}
            onLongPress={onNumberLongPress}
            activeOpacity={0.8}
            delayLongPress={500}
          >
            <Text style={styles.cardNumber}>
              {isNumberVisible ? cardNumber : maskedNumber}
            </Text>
          </TouchableOpacity>

          {/* Bottom Row: Name and Expiry */}
          <View style={styles.cardBottomRow}>
            <View style={styles.cardholderSection}>
              <Text style={styles.cardLabel}>Name</Text>
              <Text style={styles.cardholderName}>{holderName}</Text>
            </View>

            <View style={styles.expirySection}>
              <Text style={styles.cardLabel}>Expired Date</Text>
              <Text style={styles.expiryDate}>
                {expiryMonth}/{expiryYear}
              </Text>
            </View>
          </View>

          {/* Visa Logo - Absolute Position */}
          <View style={styles.visaLogoContainer}>
            <View style={styles.visaCircle}>
              <Text style={styles.visaText}>VISA</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    paddingTop: 24,
    paddingBottom: 12,
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 15,
    position: 'relative',
  },
  cardGradientBase: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.cardGradientStart,
  },
  cardGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.main_bule,
    opacity: 0.85,
  },
  cardContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankLogo: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  chipContainer: {
    // EMV chip container
  },
  cardNumber: {
    fontSize: 23,
    fontWeight: '500',
    color: Colors.white,
    letterSpacing: 2.8,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 70,
  },
  cardholderSection: {
    flex: 1,
    marginRight: 16,
  },
  cardLabel: {
    fontSize: 10,
    color: Colors.white,
    opacity: 0.8,
    marginBottom: 4,
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  cardholderName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  expirySection: {
    alignItems: 'flex-start',
  },
  expiryDate: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  visaLogoContainer: {
    position: 'absolute',
    bottom: -18,
    right: 12,
  },
  visaCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLocked: {
    opacity: 0.7,
  },
  cardGradientLocked: {
    backgroundColor: Colors.grey3,
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    zIndex: 10,
  },
  lockedIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedIcon: {
    fontSize: 32,
  },
  statusBadge: {
    position: 'absolute',
    top: 24,
    right: 24,
    backgroundColor: 'rgba(76, 175, 80, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  statusBadgeLocked: {
    backgroundColor: 'rgba(244, 67, 54, 0.25)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statusTextLocked: {
    color: Colors.white,
  },
  visaText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
    fontStyle: 'italic',
    letterSpacing: 1.3,
  },
});
