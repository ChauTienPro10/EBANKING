import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import GText from '../../../components/GText';
import Colors from '../../../constants/color';

interface TransactionHeaderProps {
  title: string;
  onBack: () => void;
  onFilterPress: () => void;
}

const TransactionHeader: React.FC<TransactionHeaderProps> = ({
  title,
  onBack,
  onFilterPress,
}) => {
  return (
    <View style={styles.customHeader}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
      </TouchableOpacity>

      <GText
        type="systemBold_20"
        color={Colors.white}
        style={styles.headerTitle}
      >
        {title}
      </GText>

      <TouchableOpacity onPress={onFilterPress} style={styles.filterIconButton}>
        <MaterialCommunityIcons name="filter-outline" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

export default TransactionHeader;

const styles = StyleSheet.create({
  customHeader: {
    height: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.main_bule,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  filterIconButton: {
    padding: 4,
  },
});
