import { useRef, type ReactNode } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadows } from '@/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: ReactNode;
  disabled?: boolean;
  accessibilityHint?: string;
};

export function ActionButton({ label, onPress, variant = 'primary', icon, disabled = false, accessibilityHint }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const animate = (toValue: number) => Animated.spring(scale, {
    toValue,
    speed: 30,
    bounciness: 4,
    useNativeDriver: Platform.OS !== 'web',
  }).start();

  return (
    <Animated.View style={[styles.animated, { transform: [{ scale }] }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityHint={accessibilityHint}
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => animate(0.975)}
        onPressOut={() => animate(1)}
        style={[styles.base, styles[variant], disabled && styles.disabled]}
      >
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <Text style={[styles.label, (variant === 'outline' || variant === 'ghost') && styles.darkLabel]}>{label}</Text>
        <Text accessibilityElementsHidden style={[styles.arrow, (variant === 'outline' || variant === 'ghost') && styles.darkLabel]}>›</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animated: { width: '100%' },
  base: {
    minHeight: 54,
    paddingHorizontal: 18,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  primary: { backgroundColor: colors.primary, ...shadows.soft },
  secondary: { backgroundColor: colors.secondary },
  outline: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong },
  ghost: { backgroundColor: colors.surfaceMuted },
  disabled: { opacity: 0.5 },
  icon: { alignItems: 'center', justifyContent: 'center' },
  label: { color: colors.white, fontWeight: '900', fontSize: 14, flex: 1, textAlign: 'center' },
  darkLabel: { color: colors.text },
  arrow: { color: colors.white, fontSize: 23, lineHeight: 23, fontWeight: '500' },
});
