import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { View, StyleSheet } from 'react-native';

type Props = {
  size?: number;
  color?: string;
};

export default function AlertIcon({ size = 24, color = '#FF3B30' }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle" size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
});
