import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ActionButton } from '@/components/action-button';
import { AnimatedReveal } from '@/components/animated-reveal';
import { AppHeader } from '@/components/app-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback-state';
import { ProductCard } from '@/components/product-card';
import { Screen } from '@/components/screen';
import { SectionTitle } from '@/components/section-title';
import { makeWhatsAppUrl } from '@/config';
import { useProducts } from '@/hooks/use-products';
import { openTrustedWebPage } from '@/lib/links';
import { colors, radii, shadows } from '@/theme';

export default function HomeScreen() {
  const { products, loading, error, refreshing, refresh } = useProducts();
  const currentRates = products.filter((product) => Boolean(product.current_price_mt)).length;

  return (
    <Screen refreshing={refreshing} onRefresh={() => void refresh()} header={<AppHeader />}>
      <AnimatedReveal distance={10}>
        <View style={styles.hero}>
          <View style={styles.heroGlow} />
          <View style={styles.grainOne}><Text style={styles.grainText}>✦</Text></View>
          <View style={styles.grainTwo}><Text style={styles.grainText}>✦</Text></View>
          <View style={styles.heroContent}>
            <View style={styles.heroPill}><Text style={styles.heroPillText}>TRUSTED RICE MARKET DESK</Text></View>
            <Text style={styles.heroTitle}>Rice trade clarity,{`\n`}wherever you are.</Text>
            <Text style={styles.heroText}>Published varieties, indicative Miryalaguda rates and a secure enquiry desk—connected to one live system.</Text>
            <View style={styles.heroActions}>
              <ActionButton label="Request a secure quote" onPress={() => router.push('/enquire')} />
              <ActionButton label="View market rates" variant="outline" onPress={() => router.push('/rates')} />
            </View>
          </View>
        </View>
      </AnimatedReveal>

      <AnimatedReveal delay={80}>
        <View style={styles.metrics}>
          <View style={styles.metric}><Text style={styles.metricValue}>{products.length || '—'}</Text><Text style={styles.metricLabel}>Published varieties</Text></View>
          <View style={styles.divider} />
          <View style={styles.metric}><Text style={styles.metricValue}>{currentRates || '—'}</Text><Text style={styles.metricLabel}>Rate indications</Text></View>
          <View style={styles.divider} />
          <View style={styles.metric}><Text style={styles.liveValue}>LIVE</Text><Text style={styles.metricLabel}>Admin synced</Text></View>
        </View>
      </AnimatedReveal>

      <AnimatedReveal delay={130}>
        <SectionTitle eyebrow="CURRENT CATALOGUE" title="Featured rice varieties" description="Live published information from the same backend used by the website and CRM." />
      </AnimatedReveal>
      {loading
        ? <LoadingState />
        : error
          ? <ErrorState message={error} />
          : products.length === 0
            ? <EmptyState title="Catalogue being updated" message="No published varieties are available right now." />
            : products.slice(0, 3).map((product, index) => <AnimatedReveal delay={170 + index * 65} key={product.id}><ProductCard product={product} /></AnimatedReveal>)}
      {!loading && products.length > 3 ? <ActionButton label="Explore all products" variant="secondary" onPress={() => router.push('/products')} /> : null}

      <AnimatedReveal delay={240}>
        <View style={styles.trustCard}>
          <View style={styles.trustMark}><Text style={styles.trustMarkText}>✓</Text></View>
          <View style={styles.trustCopy}>
            <Text style={styles.trustEyebrow}>ONE SOURCE OF TRUTH</Text>
            <Text style={styles.trustTitle}>Website and app stay in sync</Text>
            <Text style={styles.trustText}>When an authorized admin publishes a product or rate, the app reads the same updated public record. Existing data is never copied into a separate demo database.</Text>
          </View>
        </View>
      </AnimatedReveal>

      <View style={styles.supportCard}>
        <Text style={styles.supportEyebrow}>HUMAN SUPPORT</Text>
        <Text style={styles.supportTitle}>Need help choosing a variety?</Text>
        <Text style={styles.supportText}>Speak with the enterprise sourcing desk on WhatsApp before submitting your formal requirement.</Text>
        <ActionButton label="Chat with the sourcing desk" variant="ghost" onPress={() => void openTrustedWebPage(makeWhatsAppUrl('Hello Sri Srinivasa Enterprise, I need help with a rice requirement.'))} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { marginHorizontal: -20, marginTop: -20, minHeight: 560, justifyContent: 'flex-end', overflow: 'hidden', backgroundColor: colors.secondary },
  heroGlow: { position: 'absolute', width: 260, height: 260, borderRadius: 130, right: -80, top: -50, backgroundColor: 'rgba(217,164,65,0.18)' },
  grainOne: { position: 'absolute', width: 180, height: 180, borderRadius: 90, right: -25, top: 72, borderWidth: 1, borderColor: 'rgba(243,213,140,0.12)', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '15deg' }] },
  grainTwo: { position: 'absolute', width: 110, height: 110, borderRadius: 55, left: -32, top: 140, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  grainText: { color: 'rgba(243,213,140,0.18)', fontSize: 55 },
  heroContent: { paddingHorizontal: 24, paddingTop: 72, paddingBottom: 28, gap: 15 },
  heroPill: { alignSelf: 'flex-start', paddingHorizontal: 11, paddingVertical: 7, borderRadius: radii.pill, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
  heroPillText: { color: colors.primaryLight, fontSize: 9, fontWeight: '900', letterSpacing: 1.25 },
  heroTitle: { color: colors.white, fontSize: 39, lineHeight: 44, fontWeight: '900', letterSpacing: -1.1 },
  heroText: { color: '#DCE6DF', fontSize: 15, lineHeight: 23, fontWeight: '600', maxWidth: 600 },
  heroActions: { gap: 10, marginTop: 5 },
  metrics: { flexDirection: 'row', alignItems: 'stretch', backgroundColor: colors.surface, paddingVertical: 18, paddingHorizontal: 9, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, ...shadows.soft },
  metric: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 3 },
  metricValue: { color: colors.primaryDark, fontSize: 23, fontWeight: '900' },
  liveValue: { color: colors.success, fontSize: 17, fontWeight: '900', marginTop: 4 },
  metricLabel: { color: colors.textMuted, fontSize: 9, lineHeight: 12, fontWeight: '800', textAlign: 'center' },
  divider: { width: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: 4 },
  trustCard: { flexDirection: 'row', padding: 20, borderRadius: radii.lg, backgroundColor: colors.surfaceMuted, gap: 15 },
  trustMark: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
  trustMarkText: { color: colors.primaryLight, fontWeight: '900', fontSize: 20 },
  trustCopy: { flex: 1, gap: 5 },
  trustEyebrow: { color: colors.primaryDark, fontWeight: '900', fontSize: 9, letterSpacing: 1.2 },
  trustTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  trustText: { color: colors.textMuted, fontWeight: '600', lineHeight: 20, fontSize: 13 },
  supportCard: { backgroundColor: colors.secondary, borderRadius: radii.xl, padding: 22, gap: 9 },
  supportEyebrow: { color: colors.primaryLight, fontSize: 9, fontWeight: '900', letterSpacing: 1.3 },
  supportTitle: { color: colors.white, fontSize: 23, lineHeight: 28, fontWeight: '900' },
  supportText: { color: '#C9D8CE', fontWeight: '600', lineHeight: 21, marginBottom: 5 },
});
