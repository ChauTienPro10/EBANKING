import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '../../../constants/color';
import TextStyles from '../../../constants/textStyle';
import CustomInput from '../../../components/CustomInput';
import { MessageSquareIcon } from '../../../components/icon';

interface ContentInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  maxLength?: number;
}

const ContentInput: React.FC<ContentInputProps> = ({
  value,
  onChange,
  error,
  maxLength = 200,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <CustomInput
        label={t('transfer.content')}
        placeholder={t('transfer.content_placeholder')}
        value={value}
        onChangeText={onChange}
        error={error}
        leftIcon={<MessageSquareIcon size={20} color={Colors.grey3} />}
        multiline
        numberOfLines={3}
        maxLength={maxLength}
        style={styles.contentInput}
      />
      <Text style={styles.characterCount}>
        {value.length}/{maxLength}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  contentInput: {
    textAlignVertical: 'top',
    minHeight: 80,
    maxHeight: 120, // Prevent overflow
    paddingTop: 12,
  },
  characterCount: {
    ...TextStyles.systemLight_12,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
});

export default ContentInput;
