import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import IconButton from '../components/IconButton';
import BackgroundDecoration from '../components/BackgroundDecoration';
import { AuthStackParamList } from '../navigation/AuthNavigator';

type DemoScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SignIn'>;

const DemoScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<DemoScreenNavigationProp>();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
  };

  const handleLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <BackgroundDecoration>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Demo Components</Text>
            <TouchableOpacity style={styles.langButton} onPress={toggleLanguage}>
              <Text style={styles.langText}>
                {i18n.language === 'vi' ? 'EN' : 'VI'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Custom Input</Text>
            <CustomInput
              placeholder="Test input"
              value={inputValue}
              onChangeText={setInputValue}
              leftIcon={<Icon name="input" size={20} color="#6B7280" />}
            />
            <CustomInput
              placeholder="Input with error"
              error="This is an error message"
              leftIcon={<Icon name="error" size={20} color="#EF4444" />}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Custom Buttons</Text>
            <CustomButton
              title="Primary Button"
              onPress={() => {}}
              containerStyle={styles.button}
            />
            <CustomButton
              title="Secondary Button"
              variant="secondary"
              onPress={() => {}}
              containerStyle={styles.button}
            />
            <CustomButton
              title="Outline Button"
              variant="outline"
              onPress={() => {}}
              containerStyle={styles.button}
            />
            <CustomButton
              title="Loading Button"
              onPress={handleLoading}
              loading={isLoading}
              containerStyle={styles.button}
            />
            <CustomButton
              title="Disabled Button"
              onPress={() => {}}
              disabled
              containerStyle={styles.button}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Icon Buttons</Text>
            <View style={styles.iconRow}>
              <IconButton
                icon={<Icon name="home" size={24} color="#FFFFFF" />}
                onPress={() => {}}
                variant="primary"
                size={48}
              />
              <IconButton
                icon={<Icon name="favorite" size={24} color="#1E40AF" />}
                onPress={() => {}}
                variant="outline"
                size={48}
              />
              <IconButton
                icon={<Icon name="settings" size={24} color="#FFFFFF" />}
                onPress={() => {}}
                variant="secondary"
                size={48}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Navigation</Text>
            <CustomButton
              title="Go to Sign In"
              onPress={() => navigation.navigate('SignIn')}
              containerStyle={styles.button}
            />
            <CustomButton
              title="Go to Sign Up"
              onPress={() => navigation.navigate('SignUp')}
              containerStyle={styles.button}
            />
            <CustomButton
              title="Go to Forgot Password"
              onPress={() => navigation.navigate('ForgotPassword')}
              containerStyle={styles.button}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>i18n Test</Text>
            <Text style={styles.i18nText}>
              {t('auth.signIn.greeting')}
            </Text>
            <Text style={styles.i18nText}>
              {t('auth.signUp.greeting')}
            </Text>
            <Text style={styles.i18nText}>
              {t('auth.forgotPassword.title')}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </BackgroundDecoration>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  langButton: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  langText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  button: {
    marginBottom: 12,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  i18nText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default DemoScreen;
