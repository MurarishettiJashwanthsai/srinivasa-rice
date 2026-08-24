import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '@/theme';

export function LoadingState({ label = 'Loading current information…' }: { label?: string }) {
  return (
    <View style={styles.wrap} accessibilityRole="progressbar">
      <View style={styles.loader}><ActivityIndicator color={colors.primaryDark} size="small" /></View>
      <Text style={styles.title}>One moment</Text>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <View style={[styles.wrap, styles.error]} accessibilityRole="alert">
      <Text style={styles.errorIcon}>!</Text>
      <Text style={styles.errorTitle}>Unable to load</Text>
      <Text style={styles.text}>{message}</Text>
      <Text style={styles.hint}>Pull down to securely retry.</Text>
    </View>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return <View style={styles.wrap}><Text style={styles.emptyIcon}>◇</Text><Text style={styles.title}>{title}</Text><Text style={styles.text}>{message}</Text></View>;
}

const styles = StyleSheet.create({
  wrap: { padding: 28, alignItems: 'center', gap: 7, borderRadius: radii.lg, backgroundColor: colors.surfaceMuted },
  loader: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', marginBottom: 3 },
  title: { color: colors.text, fontWeight: '900', fontSize: 17 },
  error: { borderWidth: 1, borderColor: '#F1B9B5', backgroundColor: colors.dangerSoft },
  errorIcon: { width: 38, height: 38, borderRadius: 19, textAlign: 'center', textAlignVertical: 'center', color: colors.white, backgroundColor: colors.danger, fontWeight: '900', fontSize: 21, overflow: 'hidden' },
  errorTitle: { color: colors.danger, fontWeight: '900', fontSize: 17 },
  emptyIcon: { color: colors.primaryDark, fontSize: 28, fontWeight: '900' },
  text: { color: colors.textMuted, fontWeight: '600', textAlign: 'center', lineHeight: 20 },
  hint: { color: colors.textMuted, fontSize: 11, fontWeight: '800', marginTop: 3 },
});
