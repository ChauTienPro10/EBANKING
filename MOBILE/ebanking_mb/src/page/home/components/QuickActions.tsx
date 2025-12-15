import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  TransferIcon,
  CashIcon,
  ReceiptIcon,
  MobileIcon,
  PersonIcon,
  BarChartIcon,
  AlertIcon,
} from '../../../components/icon';
import Colors from '../../../constants/color';

export interface ActionItemType {
  id: string;
  title: string;
  icon: string;
  color: string;
  tag: string | null;
}

interface QuickActionsProps {
  actions: ActionItemType[];
  onActionPress: (action: ActionItemType) => void;
  moreActionsLabel: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  onActionPress,
  moreActionsLabel,
}) => {
  const getIconComponent = (iconName: string, color: string) => {
    const iconProps = { size: 24, color: color };

    switch (iconName) {
      case 'transfer':
        return <TransferIcon {...iconProps} />;
      case 'cash':
        return <CashIcon {...iconProps} />;
      case 'receipt':
        return <ReceiptIcon {...iconProps} />;
      case 'mobile':
        return <MobileIcon {...iconProps} />;
      case 'person':
        return <PersonIcon {...iconProps} />;
      case 'bar-chart':
        return <BarChartIcon {...iconProps} />;
      case 'alert-circle':
        return <AlertIcon {...iconProps} />;
      default:
        return <TransferIcon {...iconProps} />;
    }
  };

  return (
    <View style={styles.quickActionsContainer}>
      <View style={styles.actionsGrid}>
        {actions.map(action => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionItem}
            onPress={() => onActionPress(action)}
            activeOpacity={0.7}
          >
            {action.tag && (
              <View
                style={[styles.actionTag, { backgroundColor: action.color }]}
              >
                <Text style={styles.actionTagText}>{action.tag}</Text>
              </View>
            )}
            <View style={styles.actionIconContainer}>
              {getIconComponent(action.icon, action.color)}
            </View>
            <Text style={styles.actionText}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.moreActionsIndicator}>
        <Text style={styles.moreActionsText}>{moreActionsLabel}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  quickActionsContainer: {
    padding: 20,
    backgroundColor: Colors.white,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  actionTag: {
    position: 'absolute',
    top: -8,
    right: -8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 1,
  },
  actionTagText: {
    color: Colors.white,
    fontSize: 8,
    fontWeight: 'bold',
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  moreActionsIndicator: {
    alignItems: 'center',
    marginTop: 10,
  },
  moreActionsText: {
    color: Colors.main_bule,
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default QuickActions;
