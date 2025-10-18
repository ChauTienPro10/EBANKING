import { useRef } from 'react';
import { Animated } from 'react-native';

export const useProfileAnimations = () => {
  // Animation values for collapsible header
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = useRef(new Animated.Value(200)).current;
  const avatarOpacity = useRef(new Animated.Value(1)).current;
  const avatarScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;

  const createScrollHandler = (
    isCollapsed: boolean,
    setIsCollapsed: (collapsed: boolean) => void,
  ) => {
    return Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      {
        useNativeDriver: false,
        listener: (event: any) => {
          const offsetY = event.nativeEvent.contentOffset.y;
          const collapseThreshold = 50;
          const shouldCollapse = offsetY > collapseThreshold;

          if (shouldCollapse !== isCollapsed) {
            setIsCollapsed(shouldCollapse);

            if (shouldCollapse) {
              // Collapse header
              Animated.parallel([
                Animated.timing(headerHeight, {
                  toValue: 80,
                  duration: 200,
                  useNativeDriver: false,
                }),
                Animated.timing(avatarOpacity, {
                  toValue: 0,
                  duration: 150,
                  useNativeDriver: false,
                }),
                Animated.timing(avatarScale, {
                  toValue: 0.8,
                  duration: 200,
                  useNativeDriver: false,
                }),
                Animated.timing(cardOpacity, {
                  toValue: 0.3,
                  duration: 150,
                  useNativeDriver: false,
                }),
              ]).start();
            } else {
              // Expand header
              Animated.parallel([
                Animated.timing(headerHeight, {
                  toValue: 200,
                  duration: 250,
                  useNativeDriver: false,
                }),
                Animated.timing(avatarOpacity, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: false,
                }),
                Animated.timing(avatarScale, {
                  toValue: 1,
                  duration: 250,
                  useNativeDriver: false,
                }),
                Animated.timing(cardOpacity, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: false,
                }),
              ]).start();
            }
          }
        },
      },
    );
  };

  return {
    scrollY,
    headerHeight,
    avatarOpacity,
    avatarScale,
    cardOpacity,
    createScrollHandler,
  };
};
