import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '../../../constants/color';
import TextStyles from '../../../constants/textStyle';
import { CardIcon, PeopleIcon } from '../../../components/icon';

interface TransferTypeSelectorProps {
  transferType: 'internal' | 'external';
  onTypeChange: (type: 'internal' | 'external') => void;
}

const TransferTypeSelector: React.FC<TransferTypeSelectorProps> = ({
  transferType,
  onTypeChange,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <View style={styles.transferTypeContainer}>
        <TouchableOpacity
          style={[
            styles.transferTypeButton,
            transferType === 'internal' && styles.transferTypeButtonActive,
          ]}
          onPress={() => onTypeChange('internal')}
        >
          <CardIcon
            size={20}
            color={
              transferType === 'internal' ? Colors.white : Colors.main_bule
            }
          />
          <Text
            style={[
              styles.transferTypeText,
              transferType === 'internal' && styles.transferTypeTextActive,
            ]}
          >
            {t('transfer.internal_transfer')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.transferTypeButton,
            transferType === 'external' && styles.transferTypeButtonActive,
          ]}
          onPress={() => onTypeChange('external')}
        >
          <PeopleIcon
            size={20}
            color={
              transferType === 'external' ? Colors.white : Colors.main_bule
            }
          />
          <Text
            style={[
              styles.transferTypeText,
              transferType === 'external' && styles.transferTypeTextActive,
            ]}
          >
            {t('transfer.external_transfer')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  transferTypeContainer: {
    marginTop: 10,
    marginBottom: -15,
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  transferTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  transferTypeButtonActive: {
    backgroundColor: Colors.main_bule,
  },
  transferTypeText: {
    ...TextStyles.systemLight_14,
    color: Colors.main_bule,
    marginLeft: 8,
    fontWeight: '500',
  },
  transferTypeTextActive: {
    color: Colors.white,
  },
});

export default TransferTypeSelector;
