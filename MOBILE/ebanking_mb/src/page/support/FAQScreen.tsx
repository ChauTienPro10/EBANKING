import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../components/Header';
import Colors from '../../constants/color';

// Enable LayoutAnimation for Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const faqData: FAQItem[] = [
    {
      id: '1',
      category: 'account',
      question: t('faq.q1_question'),
      answer: t('faq.q1_answer'),
    },
    {
      id: '2',
      category: 'account',
      question: t('faq.q2_question'),
      answer: t('faq.q2_answer'),
    },
    {
      id: '2a',
      category: 'account',
      question: t('faq.q2a_question'),
      answer: t('faq.q2a_answer'),
    },
    {
      id: '3',
      category: 'transfer',
      question: t('faq.q3_question'),
      answer: t('faq.q3_answer'),
    },
    {
      id: '4',
      category: 'transfer',
      question: t('faq.q4_question'),
      answer: t('faq.q4_answer'),
    },
    {
      id: '5',
      category: 'security',
      question: t('faq.q5_question'),
      answer: t('faq.q5_answer'),
    },
    {
      id: '6',
      category: 'security',
      question: t('faq.q6_question'),
      answer: t('faq.q6_answer'),
    },
    {
      id: '6a',
      category: 'security',
      question: t('faq.q6a_question'),
      answer: t('faq.q6a_answer'),
    },
    {
      id: '7',
      category: 'card',
      question: t('faq.q7_question'),
      answer: t('faq.q7_answer'),
    },
  ];

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const renderFAQItem = (item: FAQItem) => {
    const isExpanded = expandedId === item.id;

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.faqItem, isExpanded && styles.faqItemExpanded]}
        onPress={() => toggleExpand(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.questionContainer}>
          <View style={styles.questionIconContainer}>
            <Icon
              name="help-circle-outline"
              size={20}
              color={isExpanded ? Colors.main_bule : Colors.grey3}
            />
          </View>
          <Text
            style={[styles.question, isExpanded && styles.questionExpanded]}
          >
            {item.question}
          </Text>
          <Icon
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={isExpanded ? Colors.main_bule : Colors.grey3}
            style={styles.chevron}
          />
        </View>

        {isExpanded && (
          <View style={styles.answerContainer}>
            <View style={styles.answerDivider} />
            <Text style={styles.answer}>{item.answer}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Group FAQs by category
  const categories = [
    { id: 'account', title: t('faq.category_account'), icon: 'person-outline' },
    {
      id: 'transfer',
      title: t('faq.category_transfer'),
      icon: 'swap-horizontal-outline',
    },
    {
      id: 'security',
      title: t('faq.category_security'),
      icon: 'shield-checkmark-outline',
    },
    { id: 'card', title: t('faq.category_card'), icon: 'card-outline' },
  ];

  return (
    <View style={styles.container}>
      <Header
        title={t('faq.title')}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerIconContainer}>
            <Icon
              name="chatbubble-ellipses"
              size={32}
              color={Colors.main_bule}
            />
          </View>
          <Text style={styles.headerTitle}>{t('faq.header_title')}</Text>
          <Text style={styles.headerSubtitle}>{t('faq.header_subtitle')}</Text>
        </View>

        {/* FAQ Categories */}
        {categories.map(category => {
          const categoryFAQs = faqData.filter(
            faq => faq.category === category.id,
          );

          if (categoryFAQs.length === 0) return null;

          return (
            <View key={category.id} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryIconContainer}>
                  <Icon
                    name={category.icon}
                    size={18}
                    color={Colors.main_bule}
                  />
                </View>
                <Text style={styles.categoryTitle}>{category.title}</Text>
              </View>

              <View style={styles.faqList}>
                {categoryFAQs.map(item => renderFAQItem(item))}
              </View>
            </View>
          );
        })}

        {/* Contact Support Section */}
        <View style={styles.contactSection}>
          <Icon
            name="headset-outline"
            size={24}
            color={Colors.main_bule}
            style={styles.contactIcon}
          />
          <Text style={styles.contactTitle}>{t('faq.still_need_help')}</Text>
          <Text style={styles.contactSubtitle}>{t('faq.contact_support')}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.main_bule + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.grey3,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.main_bule + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  faqList: {
    gap: 12,
  },
  faqItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  faqItemExpanded: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionIconContainer: {
    marginRight: 12,
  },
  question: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  questionExpanded: {
    color: Colors.main_bule,
  },
  chevron: {
    marginLeft: 8,
  },
  answerContainer: {
    marginTop: 12,
  },
  answerDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 12,
    marginLeft: 32,
  },
  answer: {
    fontSize: 14,
    color: Colors.grey3,
    lineHeight: 22,
    marginLeft: 32,
  },
  contactSection: {
    backgroundColor: Colors.main_bule + '10',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  contactIcon: {
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  contactSubtitle: {
    fontSize: 14,
    color: Colors.grey3,
    textAlign: 'center',
  },
});

export default FAQScreen;
