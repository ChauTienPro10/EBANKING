import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { clearNotifications } from '../../store/slices/appSlice';
import Header from '../../components/Header';
import BottomNavigation from '../../components/BottomNavigation';
import GText from '../../components/GText';
import {
  ChatbubbleIcon,
  PhoneIcon,
  MailIcon,
  FAQIcon,
} from '../../components/icon';
import Colors from '../../constants/color';

const SupportScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const notificationCount = useSelector(
    (state: RootState) => state.app.notificationCount,
  );
  const [activeTab, setActiveTab] = React.useState('support');

  const handleQRPress = () => {
    console.log('QR Code pressed - Open QR Scanner');
  };

  const bottomTabs = [
    { id: 'home', label: t('bottom_navigation.home'), icon: 'home' },
    { id: 'card', label: t('bottom_navigation.card'), icon: 'card' },
    {
      id: 'settings',
      label: t('bottom_navigation.settings'),
      icon: 'settings',
    },
    {
      id: 'support',
      label: t('bottom_navigation.support'),
      icon: 'help-circle',
    },
  ];

  const handleTabChange = (tabId: string) => {
    console.log(
      t('mock_data.messages.tab_changed', { from: activeTab, to: tabId }),
    );
    setActiveTab(tabId);
    switch (tabId) {
      case 'home':
        navigation.navigate('Home' as never);
        break;
      case 'card':
        navigation.navigate('Card' as never);
        break;
      case 'settings':
        navigation.navigate('Settings' as never);
        break;
      case 'support':
        break;
      default:
        console.log('Unknown tab:', tabId);
    }
  };

  const supportOptions = [
    {
      id: 'chat',
      title: t('support.chatbot'),
      description: t('support.chatbot_desc'),
      icon: ChatbubbleIcon,
    },
    {
      id: 'call',
      title: t('support.hotline'),
      description: t('support.hotline_desc'),
      icon: PhoneIcon,
    },
    {
      id: 'email',
      title: t('support.email'),
      description: t('support.email_desc'),
      icon: MailIcon,
    },
    {
      id: 'faq',
      title: t('support.faq'),
      description: t('support.faq_desc'),
      icon: FAQIcon,
    },
  ];

  const handleSupportOption = (option: any) => {
    if (option.id === 'chat') {
      navigation.navigate('Chatbot' as never);
      return;
    } else if (option.id === 'call') {
      // let phone = `tel:${phoneNumber}`;
      Linking.openURL(`tel:${'0812788212'}`);
    } else if (option.id === 'email') {
      Linking.openURL(`mailto:${'itchauduongphattien@gmail.com'}`);
    }
    console.log('Support option selected:', option);
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('support.title')}
        showBackButton={false}
        showNotification={true}
        notificationCount={notificationCount}
        onNotificationPress={() => {
          navigation.navigate('Notifications' as never);
        }}
        iconSize={20}
        badgeSize={16}
        badgeColor={Colors.orange}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeContainer}>
          <View style={styles.welcomeIconContainer}>
            <ChatbubbleIcon size={32} color={Colors.main_bule} />
          </View>
          <GText
            type="systemBold_18"
            color={Colors.textPrimary}
            style={styles.welcomeText}
          >
            {t('support.welcome')}
          </GText>
          <GText
            type="systemLight_14"
            color={Colors.textSecondary}
            style={styles.subtitleText}
          >
            {t('support.subtitle')}
          </GText>
        </View>

        <View style={styles.optionsContainer}>
          {supportOptions.map((option, index) => {
            const IconComponent = option.icon;
            const isLastItem = index === supportOptions.length - 1;
            return (
              <TouchableOpacity
                key={option.id}
                style={[styles.optionItem, isLastItem && styles.optionItemLast]}
                onPress={() => handleSupportOption(option)}
                activeOpacity={0.7}
              >
                <View style={styles.optionIconContainer}>
                  <IconComponent size={24} color={Colors.main_bule} />
                </View>
                <View style={styles.optionContent}>
                  <GText
                    type="systemLight_16"
                    color={Colors.textPrimary}
                    style={styles.optionTitle}
                  >
                    {option.title}
                  </GText>
                  <GText
                    type="systemLight_12"
                    color={Colors.textSecondary}
                    style={styles.optionDescription}
                  >
                    {option.description}
                  </GText>
                </View>
                <View style={styles.arrowContainer}>
                  <GText type="systemLight_16" color={Colors.grey3}>
                    ›
                  </GText>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <BottomNavigation
        activeTab={activeTab}
        tabs={bottomTabs}
        onChange={handleTabChange}
        onQRPress={handleQRPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  welcomeContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  welcomeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: Colors.main_bule,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  welcomeText: {
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitleText: {
    textAlign: 'center',
    lineHeight: 20,
  },
  optionsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    minHeight: 72,
  },
  optionItemLast: {
    borderBottomWidth: 0,
  },
  optionItemPressed: {
    backgroundColor: '#F8FAFC',
    transform: [{ scale: 0.98 }],
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F8FF',
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.main_bule,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    marginBottom: 4,
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 20,
  },
  optionDescription: {
    lineHeight: 18,
    fontSize: 13,
  },
  arrowContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SupportScreen;
