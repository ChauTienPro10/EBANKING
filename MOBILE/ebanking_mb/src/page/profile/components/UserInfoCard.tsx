import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';

interface UserInfoCardProps {
  fullName: string;
  cardOpacity: Animated.Value;
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({
  fullName,
  cardOpacity,
}) => {
  const { t } = useTranslation();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: cardOpacity,
        },
      ]}
    >
      <Text style={styles.userName}>{fullName}</Text>
      <Text style={styles.memberSince}>{t('profile.member_since')} 2023</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  memberSince: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default UserInfoCard;
