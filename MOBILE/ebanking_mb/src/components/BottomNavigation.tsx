import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import GText from './GText';
import Colors from '../constants/color';
import HomeIcon from './icon/HomeIcon';
import GridIcon from './icon/GridIcon';
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
  onQRPress 
}) => {
  const getIconComponent = (iconName: string, isActive: boolean) => {
    const iconProps = { 
      size: 24, 
      color: isActive ? Colors.main_bule : Colors.grey3 
    };
    
    switch (iconName) {
      case 'home': return <HomeIcon {...iconProps} />;
      case 'grid': return <GridIcon {...iconProps} />;
      case 'search': return <SearchIcon {...iconProps} />;
      case 'settings': return <SettingsIcon {...iconProps} />;
      case 'help-circle': return <HelpCircleIcon {...iconProps} />;
      default: return <HomeIcon {...iconProps} />;
    }
  };

  const renderTab = (tab: Tab) => {
    const isActive = activeTab === tab.id;
    
    return (
      <TouchableOpacity
        key={tab.id}
        style={styles.tab}
        onPress={() => onChange(tab.id)}
        activeOpacity={0.7}
      >
        <View style={styles.tabContent}>
          {getIconComponent(tab.icon, isActive)}
          <GText 
            type="systemLight_12" 
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
      <View style={styles.tabsContainer}>
        {tabs.map(renderTab)}
      </View>
      
      {/* QR Code Button in Center */}
      <TouchableOpacity 
        style={styles.qrButton}
        onPress={onQRPress}
        activeOpacity={0.7}
      >
        <View style={styles.qrButtonContent}>
          <QrCodeIcon size={28} color={Colors.white} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.grey2,
    paddingBottom: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  tabContent: {
    alignItems: 'center',
  },
  tabLabel: {
    marginTop: 4,
    textAlign: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -15,
    width: 30,
    height: 3,
    backgroundColor: Colors.main_bule,
    borderRadius: 2,
  },
  qrButton: {
    position: 'absolute',
    top: -20,
    left: '50%',
    marginLeft: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.main_bule,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  qrButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BottomNavigation;
