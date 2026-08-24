import { useEffect, useRef, type PropsWithChildren } from 'react';
import { AccessibilityInfo, Animated, Platform, StyleSheet, type ViewStyle } from 'react-native';

type Props = PropsWithChildren<{
  delay?: number;
  distance?: number;
  style?: ViewStyle | ViewStyle[];
}>;

export function AnimatedReveal({ children, delay = 0, distance = 16, style }: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!active) return;
      if (reduceMotion) {
        progress.setValue(1);
        return;
      }
      Animated.timing(progress, {
        toValue: 1,
        duration: 520,
        delay,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    });
    return () => { active = false; progress.stopAnimation(); };
  }, [delay, progress]);

  return (
    <Animated.View style={[
      styles.base,
      style,
      {
        opacity: progress,
        transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }],
      },
    ]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({ base: { width: '100%' } });
