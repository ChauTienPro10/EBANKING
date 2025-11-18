import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import GText from '../../../components/GText';
import QRColors from '../styles/colors';

interface SimpleHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
  showBack?: boolean;
}

const SimpleHeader: React.FC<SimpleHeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightIcon,
  onRightPress,
  showBack = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Left - Back button */}
        <View style={styles.left}>
          {showBack && onBack && (
            <TouchableOpacity
              onPress={onBack}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <Icon name="arrow-left" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Center - Title */}
        <View style={styles.center}>
          <GText type="systemBold_18" color="#FFFFFF" style={styles.title}>
            {title}
          </GText>
          {subtitle && (
            <GText
              type="systemLight_12"
              color="rgba(255,255,255,0.85)"
              style={styles.subtitle}
            >
              {subtitle}
            </GText>
          )}
        </View>

        {/* Right - Action button */}
        <View style={styles.right}>
          {rightIcon && onRightPress && (
            <TouchableOpacity
              onPress={onRightPress}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <Icon name={rightIcon} size={22} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: QRColors.primary,
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    width: 40,
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  right: {
    width: 40,
    alignItems: 'flex-end',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  subtitle: {
    marginTop: 2,
    opacity: 0.9,
  },
});

export default SimpleHeader;
