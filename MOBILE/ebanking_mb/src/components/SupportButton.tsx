import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import GText from './GText';
import Colors from '../constants/color';
import ChatbubbleIcon from './icon/ChatbubbleIcon';

interface SupportButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'floating' | 'inline';
}

const SupportButton: React.FC<SupportButtonProps> = ({ 
  label, 
  onPress, 
  variant = 'floating' 
}) => {
  if (variant === 'floating') {
    return (
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <ChatbubbleIcon size={24} color={Colors.white} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.inlineButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.inlineButtonContent}>
        <ChatbubbleIcon size={20} color={Colors.main_bule} />
        <GText type="systemLight_14" color={Colors.main_bule} style={styles.inlineButtonLabel}>
          {label}
        </GText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.main_bule,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  inlineButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inlineButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  inlineButtonLabel: {
    marginLeft: 8,
  },
});

export default SupportButton;
