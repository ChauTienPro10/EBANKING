import { useState } from 'react';
import { Clipboard } from 'react-native';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';

export const useCardActions = () => {
  const { t } = useTranslation();
  const [isCardNumberVisible, setIsCardNumberVisible] = useState(false);

  const toggleCardNumberVisibility = () => {
    setIsCardNumberVisible(!isCardNumberVisible);
  };

  const copyCardNumber = (cardNumber: string) => {
    Clipboard.setString(cardNumber);
    Toast.show({
      type: 'success',
      text1: t('card.copied') || 'Đã sao chép',
      text2: t('card.card_number_copied') || 'Số thẻ đã được sao chép',
      visibilityTime: 2000,
      position: 'top',
    });
  };

  return {
    isCardNumberVisible,
    toggleCardNumberVisibility,
    copyCardNumber,
  };
};
