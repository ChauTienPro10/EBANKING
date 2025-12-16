import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { ActionItemType, ServiceItemType } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const useHomeNavigation = (
  account: any,
  userInfo: any,
  onShowComingSoon?: () => void,
) => {
  const navigation = useNavigation<NavigationProp>();

  const handleActionPress = (action: ActionItemType) => {
    switch (action.id) {
      case 'transfer':
        if (account) {
          navigation.navigate('Transfer', {
            receiver: '',
            amount: '',
            content: '',
            bankCode: '',
          });
        } else {
          navigation.navigate('OpenCard', { userInfo });
        }
        break;
      case 'withdraw':
        onShowComingSoon?.();
        break;
      case 'trans_history':
        navigation.navigate('TransactionHistoryScreen' as never);
        break;
      case 'mobile_prepaid':
        onShowComingSoon?.();
        break;
      case 'profile':
        navigation.navigate('Profile' as never);
        break;
      case 'statistics':
        navigation.navigate('Statistics' as never);
        break;
      case 'suspicious':
        navigation.navigate('SuspiciousTransactions' as never);
        break;
      case 'bnpl':
      case 'loan':
        onShowComingSoon?.();
        break;
      default:
        console.log('Unknown action:', action.id);
    }
  };

  const handleServicePress = (service: ServiceItemType) => {
    switch (service.id) {
      case 'lottery':
        navigation.navigate('Lottery');
        break;
      case 'data':
      case 'game':
      case 'flight':
        onShowComingSoon?.();
        break;
      default:
        console.log('Service pressed:', service.id);
    }
  };

  const handleQRPress = () => {
    navigation.navigate('ScannerScreen', {
      onScanSuccess: (value: string) => console.log('QR Code scanned:', value),
    });
  };

  const handleOpenCard = () => {
    navigation.navigate('OpenCard', { userInfo });
  };

  return {
    handleActionPress,
    handleServicePress,
    handleQRPress,
    handleOpenCard,
    navigation,
  };
};
