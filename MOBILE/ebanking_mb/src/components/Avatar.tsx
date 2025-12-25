import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { PersonIcon } from './icon';
import Colors from '../constants/color';

interface AvatarProps {
  src?: string;
  size?: number;
  onPress?: () => void;
  showBorder?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  size = 50,
  onPress,
  showBorder = true,
}) => {
  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const containerStyle = {
    width: size + (showBorder ? 4 : 0),
    height: size + (showBorder ? 4 : 0),
    borderRadius: (size + 4) / 2,
  };

  const AvatarContent = () => {
    return (
      <View style={[styles.container, containerStyle]}>
        {src ? (
          <Image
            source={{ uri: src }}
            style={[avatarStyle, styles.image]}
            // Force reload on URI change
            key={src}
            onError={error => {
              console.error(
                '❌ Avatar image load error:',
                error.nativeEvent.error,
              );
              console.error('❌ Failed URL:', src);
            }}
            onLoad={() => {
              console.log('✅ Avatar image loaded successfully:', src);
            }}
          />
        ) : (
          <View style={[avatarStyle, styles.placeholder]}>
            <PersonIcon size={size * 0.6} color={Colors.white} />
          </View>
        )}
      </View>
    );
  };

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <AvatarContent />
      </TouchableOpacity>
    );
  }

  return <AvatarContent />;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.main_bule,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: Colors.grey1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Avatar;
