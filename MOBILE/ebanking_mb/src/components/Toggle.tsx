// Toggle.tsx
import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({ value, onChange, label, disabled }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        thumbColor={value ? '#4caf50' : '#f4f3f4'}
        trackColor={{ false: '#767577', true: '#767577' }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 16,
    marginRight: 8,
  },
});

export default Toggle;
