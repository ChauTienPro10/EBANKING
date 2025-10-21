import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

interface LanguageItem {
  code: string;
  label: string;
}

const LanguageScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState<string>(i18n.language);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setSelectedLang(lang);
  };

  // Lấy dữ liệu ngôn ngữ từ file i18n
  const languageOptions = t('language_setting.language_options', {
    returnObjects: true,
  }) as Record<string, string>;

  const languageData: LanguageItem[] = Object.keys(languageOptions).map(
    (key) => ({
      code: key,
      label: languageOptions[key],
    })
  );

  const renderItem = ({ item }: { item: LanguageItem }) => {
    const isActive = selectedLang === item.code;

    return (
      <TouchableOpacity
        style={[styles.button, isActive && styles.activeButton]}
        onPress={() => changeLanguage(item.code)}
      >
        <Text style={[styles.text, isActive && styles.activeText]}>
          {item.label} {isActive ? '✓' : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {t('language_setting.select_language')}
        </Text>
      </View>

      {/* Danh sách ngôn ngữ */}
      <FlatList
        data={languageData}
        renderItem={renderItem}
        keyExtractor={(item) => item.code}
      />
    </View>
  );
};

export default LanguageScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#e0f7f9',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  activeButton: {
    backgroundColor: '#00796B',
  },
  text: { fontSize: 16, color: '#000' },
  activeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
