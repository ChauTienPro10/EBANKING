import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../../../constants/color';

const VideoCard: React.FC = () => {
  return (
    <View style={styles.videoCard}>
      <View style={styles.videoIconContainer}>
        <Text style={styles.videoIcon}>🎥</Text>
      </View>
      <View style={styles.videoContent}>
        <Text style={styles.videoTitle}>Video xác thực</Text>
        <Text style={styles.videoStatus}>Video đã được ghi lại thành công</Text>
      </View>
      <View style={styles.videoCheckmark}>
        <Text style={styles.checkmarkText}>✓</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  videoCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  videoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  videoIcon: {
    fontSize: 24,
  },
  videoContent: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  videoStatus: {
    fontSize: 13,
    color: '#6B7280',
  },
  videoCheckmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.main_green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
});

export default VideoCard;
