import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';

type Props = {
  visible: boolean;
  atPageEnd: boolean;
  onPress: () => void;
};

export function BackToTopButton({ visible, atPageEnd, onPress }: Props) {
  if (!visible) return null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={atPageEnd ? 'End of page. Return to top' : 'Return to top'}
      accessibilityHint="Tap or double-tap to smoothly scroll to the beginning of this page"
      onPress={onPress}
      style={({ pressed }) => [styles.button, atPageEnd && styles.buttonAtEnd, pressed && styles.buttonPressed]}
    >
      <Text style={styles.arrow}>↑</Text>
      <View>
        {atPageEnd ? <Text style={styles.hint}>END REACHED</Text> : null}
        <Text style={styles.text}>TOP</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { position: 'absolute', right: 18, bottom: 16, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16, borderRadius: 24, backgroundColor: colors.secondary, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 7, zIndex: 10 },
  buttonAtEnd: { paddingHorizontal: 18, backgroundColor: colors.primaryDark },
  buttonPressed: { opacity: 0.78, transform: [{ scale: 0.96 }] },
  arrow: { color: colors.white, fontSize: 21, lineHeight: 23, fontWeight: '900' },
  hint: { color: colors.primaryLight, fontSize: 7, lineHeight: 9, fontWeight: '900', letterSpacing: 0.8 },
  text: { color: colors.white, fontSize: 10, lineHeight: 13, fontWeight: '900', letterSpacing: 0.8 },
});
