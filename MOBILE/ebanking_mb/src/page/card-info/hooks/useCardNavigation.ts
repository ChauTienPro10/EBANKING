import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Card'>;

export const useCardNavigation = () => {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState('card');

  const handleBackPress = () => {
    navigation.navigate('Home' as never);
  };

  const handleTabChange = (tabId: string) => {
    if (tabId !== activeTab) {
      setActiveTab(tabId);

      switch (tabId) {
        case 'home':
          navigation.navigate('Home' as never);
          break;
        case 'card':
          break;
        case 'settings':
          navigation.navigate('Settings' as never);
          break;
        case 'support':
          navigation.navigate('Support' as never);
          break;
        default:
          console.log('Unknown tab:', tabId);
      }
    }
  };

  const handleQRPress = () => {
    const handleScanSuccess = (value: string) => {
      console.log('QR Code scanned:', value);
    };
    navigation.navigate('ScannerScreen', { onScanSuccess: handleScanSuccess });
  };

  return {
    activeTab,
    handleBackPress,
    handleTabChange,
    handleQRPress,
  };
};
