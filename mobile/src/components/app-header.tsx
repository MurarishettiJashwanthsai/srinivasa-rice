import { Image, StyleSheet, Text, View } from 'react-native';
import { SITE_URL } from '@/config';
import { colors, radii } from '@/theme';

type Props = {
  eyebrow?: string;
  title?: string;
};

export function AppHeader({ eyebrow = 'MIRYALAGUDA • TELANGANA', title = 'Sri Srinivasa Enterprise' }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.logoWrap}>
        <Image source={{ uri: `${SITE_URL}/logo-256.png` }} style={styles.logo} resizeMode="contain" accessibilityLabel="Sri Srinivasa Enterprise logo" />
      </View>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.title}>{title}</Text>
      </View>
      <View style={styles.live} accessibilityLabel="Secure live connection">
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  logoWrap: { width: 48, height: 48, borderRadius: radii.md, backgroundColor: colors.white, padding: 4, overflow: 'hidden' },
  logo: { width: '100%', height: '100%' },
  copy: { flex: 1 },
  eyebrow: { color: colors.primaryLight, fontWeight: '900', fontSize: 9, letterSpacing: 1.45 },
  title: { color: colors.white, fontWeight: '900', fontSize: 17, marginTop: 3 },
  live: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 5, borderRadius: radii.pill, backgroundColor: 'rgba(255,255,255,0.10)' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#6EDB98' },
  liveText: { color: '#DDF7E7', fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
});
