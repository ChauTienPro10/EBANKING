import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface ImageSectionProps {
  frontImage: string;
  backImage: string;
}

const ImageSection: React.FC<ImageSectionProps> = ({
  frontImage,
  backImage,
}) => {
  return (
    <View style={styles.imageSection}>
      <Text style={styles.sectionTitle}>CMND/CCCD</Text>
      <View style={styles.imageGrid}>
        <View style={styles.imageContainer}>
          <Text style={styles.imageLabel}>Mặt trước</Text>
          <Image source={{ uri: frontImage }} style={styles.image} />
        </View>
        <View style={styles.imageContainer}>
          <Text style={styles.imageLabel}>Mặt sau</Text>
          <Image source={{ uri: backImage }} style={styles.image} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  imageSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  imageGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  imageContainer: {
    flex: 1,
  },
  imageLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});

export default ImageSection;
