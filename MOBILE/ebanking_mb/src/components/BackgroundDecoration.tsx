import React from 'react';
import { View, StyleSheet } from 'react-native';
import Colors from '../constants/color';

interface BackgroundDecorationProps {
  children: React.ReactNode;
}

const BackgroundDecoration: React.FC<BackgroundDecorationProps> = ({ children }) => {
  return (
    <View style={styles.container}>
      {/* Clean gradient background */}
      <View style={styles.gradientLayer1} />
      <View style={styles.gradientLayer2} />
      
      {/* Content overlay */}
      <View style={styles.contentOverlay}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: Colors.main_bule, 
  },
  gradientLayer1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.main_bule, // Deep blue
  },
  gradientLayer2: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.main_bule, // Medium blue
    opacity: 0.4,
  },
  contentOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});

export default BackgroundDecoration;
