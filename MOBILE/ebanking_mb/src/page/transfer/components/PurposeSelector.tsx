import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '../../../constants/color';
import { TransferPurpose } from '../types/transfer.types';

interface PurposeSelectorProps {
  selectedPurpose?: TransferPurpose;
  onPress: () => void;
}

const PurposeSelector: React.FC<PurposeSelectorProps> = ({
  selectedPurpose,
  onPress,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('transfer.purpose_label')}</Text>
      <TouchableOpacity style={styles.selector} onPress={onPress}>
        <Text style={[
          styles.selectorText,
          !selectedPurpose && styles.placeholder
        ]}>
          {selectedPurpose ? selectedPurpose.name : t('transfer.select_purpose')}
        </Text>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectorText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  placeholder: {
    color: Colors.placeholder,
  },
  arrow: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: 'bold',
  },
});

export default PurposeSelector;