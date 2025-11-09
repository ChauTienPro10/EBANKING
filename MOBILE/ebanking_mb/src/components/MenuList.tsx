import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import GText from './GText';
import Colors from '../constants/color';
import Toggle from './Toggle';
import { RootState } from '../store';
import { useDispatch, useSelector } from 'react-redux';
import fetch from '../utils/fetch';
import { API } from '../constants/api';
import { setPinStatus } from '../store/slices/appSlice';
import { useNavigation } from '@react-navigation/native';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  category?: string;
}

interface MenuListProps {
  items: MenuItem[];
  onSelect: (item: MenuItem) => void;
  showCategories?: boolean;
}

const MenuList: React.FC<MenuListProps> = ({
  items,
  onSelect,
  showCategories = true
}) => {
  const { t } = useTranslation();
  const loginResponse = useSelector((state: RootState) => state.app.loginResponse);
  const dispatch = useDispatch();
  const [pinStt, setPinStt] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPinStatus = async () => {
      try {
        const _pinStt = await fetch.get(
          API.GET_PIN_STT.replace('{username}', loginResponse?.username || ''),
          {},
          true
        );
        setPinStt(_pinStt);
        dispatch(setPinStatus(_pinStt));
      } catch (error) {
        console.error('Error fetching pin status:', error);
      }
    };

    fetchPinStatus();
  }, [loginResponse]);

  // Group items by category
  const groupedItems = showCategories
    ? items.reduce((acc, item) => {
      const category = item.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>)
    : { all: items };

  const getCategoryLabel = (category: string) => {
    return t(`categories.${category}`) || category;
  };

  const getIconComponent = (iconName: string) => {
    const iconProps = { size: 20, color: Colors.main_bule };

    switch (iconName) {
      case 'home': return <Icon name="home" {...iconProps} />;
      case 'card': return <Icon name="card" {...iconProps} />;
      case 'transfer': return <Icon name="swap-horizontal" {...iconProps} />;
      case 'cash': return <Icon name="cash" {...iconProps} />;
      case 'mobile': return <Icon name="phone-portrait" {...iconProps} />;
      case 'receipt': return <Icon name="receipt" {...iconProps} />;
      case 'trending-up': return <Icon name="trending-up" {...iconProps} />;
      case 'list': return <Icon name="list" {...iconProps} />;
      case 'people': return <Icon name="people" {...iconProps} />;
      case 'business': return <Icon name="business" {...iconProps} />;
      case 'shield': return <Icon name="shield" {...iconProps} />;
      case 'person': return <Icon name="person" {...iconProps} />;
      case 'settings': return <Icon name="settings" {...iconProps} />;
      case 'notifications': return <Icon name="notifications" {...iconProps} />;
      case 'help-circle': return <Icon name="help-circle" {...iconProps} />;
      case 'globe': return <Icon name="globe" {...iconProps} />;
      case 'lock': return <Icon name="lock-closed" {...iconProps} />;
      case 'fingerprint': return <Icon name="finger-print" {...iconProps} />;
      case 'information-circle': return <Icon name="information-circle" {...iconProps} />;
      case 'log-out': return <Icon name="log-out" {...iconProps} />;
      default: return <Icon name="person" {...iconProps} />;
    }
  };

  const renderMenuItem = (item: MenuItem, index: number, totalItems: number) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, index === totalItems - 1 && styles.menuItemLast]}
      onPress={() => onSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.iconContainer}>
          {getIconComponent(item.icon)}
        </View>
        <GText type="systemLight_16" style={styles.menuItemLabel}>
          {item.label}
        </GText>
      </View>
      {item.id === 'security' ? <Toggle
        value={pinStt}
        onChange={() => { navigation.navigate('SetPINCode' as never); }}
        label=""
      /> : <Icon name="chevron-forward" size={18} color={Colors.grey1} />
      }
    </TouchableOpacity>
  );

  const renderCategory = (category: string, items: MenuItem[]) => (
    <View key={category} style={styles.categoryContainer}>
      {showCategories && (
        <GText type="systemBold_14" color={Colors.grey1} style={styles.categoryLabel}>
          {getCategoryLabel(category).toUpperCase()}
        </GText>
      )}
      <View style={styles.menuItemsContainer}>
        {items.map((item, index) => renderMenuItem(item, index, items.length))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {Object.entries(groupedItems).map(([category, items]) =>
        renderCategory(category, items)
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryLabel: {
    marginBottom: 8,
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  menuItemsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey2,
    minHeight: 64,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.grey2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  menuItemLabel: {
    flex: 1,
    color: Colors.black,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
});

export default MenuList;
