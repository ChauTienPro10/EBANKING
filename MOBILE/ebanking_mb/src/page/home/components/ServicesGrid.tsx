import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  GameControllerIcon,
  WifiIcon,
  AirplaneIcon,
} from '../../../components/icon';
import Colors from '../../../constants/color';

export interface ServiceItemType {
  id: string;
  title: string;
  icon: string;
  color: string;
}

interface ServicesGridProps {
  services: ServiceItemType[];
  onServicePress: (service: ServiceItemType) => void;
  titleLabel: string;
}

const ServicesGrid: React.FC<ServicesGridProps> = ({
  services,
  onServicePress,
  titleLabel,
}) => {
  const getIconComponent = (iconName: string, color: string) => {
    const iconProps = { size: 24, color: color };

    switch (iconName) {
      case 'game-controller':
        return <GameControllerIcon {...iconProps} />;
      case 'wifi':
        return <WifiIcon {...iconProps} />;
      case 'airplane':
        return <AirplaneIcon {...iconProps} />;
      default:
        return <GameControllerIcon {...iconProps} />;
    }
  };

  return (
    <View style={styles.servicesContainer}>
      <Text style={styles.servicesTitle}>{titleLabel}</Text>
      <View style={styles.servicesGrid}>
        {services.map(service => (
          <TouchableOpacity
            key={service.id}
            style={styles.serviceItem}
            onPress={() => onServicePress(service)}
            activeOpacity={0.7}
          >
            <View
              style={[styles.serviceIcon, { backgroundColor: service.color }]}
            >
              {getIconComponent(service.icon, Colors.white)}
            </View>
            <Text style={styles.serviceText}>{service.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  servicesContainer: {
    padding: 20,
    backgroundColor: Colors.white,
  },
  servicesTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serviceText: {
    color: Colors.textPrimary,
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default ServicesGrid;
