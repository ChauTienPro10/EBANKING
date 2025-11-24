import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import GText from './GText';
import Colors from '../constants/color';
import HomeIcon from './icon/HomeIcon';
import GridIcon from './icon/GridIcon';
import CardIcon from './icon/CardIcon';
import SearchIcon from './icon/SearchIcon';
import SettingsIcon from './icon/SettingsIcon';
import HelpCircleIcon from './icon/HelpCircleIcon';
import QrCodeIcon from './icon/QrCodeIcon';

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface BottomNavigationProps {
  activeTab: string;
  tabs: Tab[];
  onChange: (tabId: string) => void;
  onQRPress?: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  tabs,
  onChange,
  onQRPress,
}) => {
  // Animation for QR button pulse
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation for QR button
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  const getIconComponent = (iconName: string, isActive: boolean) => {
    const iconSize = isActive ? 26 : 24;
    const iconProps = {
      size: iconSize,
      color: isActive ? Colors.main_bule : Colors.grey3,
    };

    switch (iconName) {
      case 'home':
        return <HomeIcon {...iconProps} />;
      case 'grid':
        return <GridIcon {...iconProps} />;
      case 'card':
        return <CardIcon {...iconProps} />;
      case 'search':
        return <SearchIcon {...iconProps} />;
      case 'settings':
        return <SettingsIcon {...iconProps} />;
      case 'help-circle':
        return <HelpCircleIcon {...iconProps} />;
      default:
        return <HomeIcon {...iconProps} />;
    }
  };

  const renderTab = (tab: Tab) => {
    const isActive = activeTab === tab.id;

    return (
      <TouchableOpacity
        key={tab.id}
        style={styles.tab}
        onPress={() => onChange(tab.id)}
        activeOpacity={0.6}
      >
        <View style={[styles.tabContent, isActive && styles.tabContentActive]}>
          <View style={styles.iconContainer}>
            {getIconComponent(tab.icon, isActive)}
          </View>
          <GText
            type={isActive ? 'systemMedium_12' : 'systemLight_12'}
            color={isActive ? Colors.main_bule : Colors.grey3}
            style={styles.tabLabel}
          >
            {tab.label}
          </GText>
        </View>
        {isActive && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>{tabs.map(renderTab)}</View>

      {/* QR Button - Always visible */}
      <Animated.View
        style={[
          styles.qrButtonWrapper,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.qrButton}
          onPress={onQRPress}
          activeOpacity={0.8}
        >
          <View style={styles.qrButtonGradient}>
            <QrCodeIcon size={28} color={Colors.white} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.grey2,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 64,
    minHeight: 48,
    backgroundColor: 'transparent',
  },
  tabContentActive: {
    backgroundColor: 'rgba(9, 160, 165, 0.08)',
  },
  iconContainer: {
    marginBottom: 2,
  },
  tabLabel: {
    marginTop: 2,
    textAlign: 'center',
    fontSize: 11,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -16,
    width: 32,
    height: 3,
    backgroundColor: Colors.main_bule,
    borderRadius: 2,
  },
  qrButtonWrapper: {
    position: 'absolute',
    top: -28,
    left: '50%',
    marginLeft: -28,
    width: 56,
    height: 56,
  },
  qrButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
    borderWidth: 4,
    borderColor: Colors.white,
  },
  qrButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.main_bule,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.main_bule,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default BottomNavigation;
