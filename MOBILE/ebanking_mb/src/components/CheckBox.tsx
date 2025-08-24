import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Colors from '../constants/color';

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  style?: StyleProp<ViewStyle>;
};

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, style }) => {
  return (
    <TouchableOpacity
      onPress={() => onChange(!checked)}
      style={[styles.checkboxContainer, style]}
    >
      <Icon
        name={checked ? 'check-box' : 'check-box-outline-blank'}
        size={24}
        color={checked ? Colors.main_bule : Colors.grey1}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Checkbox;
