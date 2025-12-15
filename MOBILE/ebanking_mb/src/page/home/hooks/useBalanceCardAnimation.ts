import { useRef, useState, useCallback } from 'react';
import { Animated, Easing, Platform } from 'react-native';

export const useBalanceCardAnimation = () => {
  // Transform-based animations for smooth visual effect
  const balanceCardScale = useRef(new Animated.Value(1)).current;
  const balanceCardOpacity = useRef(new Animated.Value(1)).current;
  const balanceCardTranslateY = useRef(new Animated.Value(0)).current;

  // Height animation to remove white space
  const balanceCardHeight = useRef(new Animated.Value(156)).current;

  const headerPaddingBottom = useRef(new Animated.Value(20)).current;

  const isAnimatingRef = useRef(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const COLLAPSE_THRESHOLD = 50; // Reduced from 50 to work with fewer items
  const EXPAND_THRESHOLD = 0;
  const ANIMATION_DURATION = 300;

  const collapse = useCallback(() => {
    if (isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    setIsExpanded(false);

    Animated.parallel([
      // Visual animations - use native driver for smoothness
      Animated.timing(balanceCardScale, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(balanceCardOpacity, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(balanceCardTranslateY, {
        toValue: -78,
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // Layout animation - removes white space
      Animated.timing(balanceCardHeight, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // Height cannot use native driver
      }),
      // Header animations
      Animated.timing(headerPaddingBottom, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start(() => {
      isAnimatingRef.current = false;
    });
  }, []);

  const expand = useCallback(() => {
    if (isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    setIsExpanded(true);

    Animated.parallel([
      // Visual animations - use native driver for smoothness
      Animated.timing(balanceCardScale, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(balanceCardOpacity, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(balanceCardTranslateY, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // Layout animation - restores space
      Animated.timing(balanceCardHeight, {
        toValue: 156,
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // Height cannot use native driver
      }),
      // Header animations
      Animated.timing(headerPaddingBottom, {
        toValue: 20,
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start(() => {
      isAnimatingRef.current = false;
    });
  }, []);

  const handleScroll = useCallback(
    (event: any) => {
      const offsetY = event.nativeEvent.contentOffset.y;

      if (offsetY > COLLAPSE_THRESHOLD && isExpanded) {
        collapse();
      } else if (offsetY <= EXPAND_THRESHOLD && !isExpanded) {
        expand();
      }
    },
    [isExpanded, collapse, expand],
  );

  return {
    balanceCardScale,
    balanceCardOpacity,
    balanceCardTranslateY,
    balanceCardHeight,
    headerPaddingBottom,
    handleScroll,
  };
};
