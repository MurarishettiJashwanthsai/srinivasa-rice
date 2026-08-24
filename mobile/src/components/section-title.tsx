import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';

type Props = { eyebrow?: string; title: string; description?: string; align?: 'left' | 'center' };

export function SectionTitle({ eyebrow, title, description, align = 'left' }: Props) {
  return (
    <View style={[styles.wrap, align === 'center' && styles.center]}>
      {eyebrow ? <Text style={[styles.eyebrow, align === 'center' && styles.centerText]}>{eyebrow}</Text> : null}
      <Text style={[styles.title, align === 'center' && styles.centerText]}>{title}</Text>
      {description ? <Text style={[styles.description, align === 'center' && styles.centerText]}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 7 },
  center: { alignItems: 'center' },
  centerText: { textAlign: 'center' },
  eyebrow: { color: colors.primaryDark, fontWeight: '900', fontSize: 10, letterSpacing: 1.8 },
  title: { color: colors.text, fontWeight: '900', fontSize: 29, lineHeight: 35, letterSpacing: -0.45 },
  description: { color: colors.textMuted, fontWeight: '600', fontSize: 14, lineHeight: 22, maxWidth: 620 },
});
