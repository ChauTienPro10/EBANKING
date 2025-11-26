import { useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';

export const useBalanceCardAnimation = () => {
  const balanceCardHeight = useRef(new Animated.Value(156)).current; // 140 + 16 paddingBottom
  const balanceCardOpacity = useRef(new Animated.Value(1)).current;
  const headerPaddingBottom = useRef(new Animated.Value(20)).current;
  const headerBorderRadius = useRef(new Animated.Value(24)).current;
  const isAnimatingRef = useRef(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const COLLAPSE_THRESHOLD = 50;
    const EXPAND_THRESHOLD = 0;

    // Prevent animation trigger during animation
    if (isAnimatingRef.current) return;

    if (offsetY > COLLAPSE_THRESHOLD && isExpanded) {
      isAnimatingRef.current = true;
      setIsExpanded(false);
      Animated.parallel([
        Animated.timing(balanceCardHeight, {
          toValue: 0,
          duration: 250,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: false,
        }),
        Animated.timing(balanceCardOpacity, {
          toValue: 0,
          duration: 250,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: false,
        }),
        Animated.timing(headerPaddingBottom, {
          toValue: 0,
          duration: 250,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: false,
        }),
        Animated.timing(headerBorderRadius, {
          toValue: 0,
          duration: 250,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: false,
        }),
      ]).start(() => {
        isAnimatingRef.current = false;
      });
    } else if (offsetY <= EXPAND_THRESHOLD && !isExpanded) {
      isAnimatingRef.current = true;
      setIsExpanded(true);
      Animated.parallel([
        Animated.timing(balanceCardHeight, {
          toValue: 156,
          duration: 300,
          easing: Easing.bezier(0.0, 0.0, 0.2, 1),
          useNativeDriver: false,
        }),
        Animated.timing(balanceCardOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.bezier(0.0, 0.0, 0.2, 1),
          useNativeDriver: false,
        }),
        Animated.timing(headerPaddingBottom, {
          toValue: 20,
          duration: 300,
          easing: Easing.bezier(0.0, 0.0, 0.2, 1),
          useNativeDriver: false,
        }),
        Animated.timing(headerBorderRadius, {
          toValue: 24,
          duration: 300,
          easing: Easing.bezier(0.0, 0.0, 0.2, 1),
          useNativeDriver: false,
        }),
      ]).start(() => {
        isAnimatingRef.current = false;
      });
    }
  };

  return {
    balanceCardHeight,
    balanceCardOpacity,
    headerPaddingBottom,
    headerBorderRadius,
    handleScroll,
  };
};
