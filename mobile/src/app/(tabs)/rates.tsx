import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AnimatedReveal } from '@/components/animated-reveal';
import { AppHeader } from '@/components/app-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback-state';
import { Screen } from '@/components/screen';
import { SectionTitle } from '@/components/section-title';
import { useProducts } from '@/hooks/use-products';
import { formatDate, formatRate, readableUnit, trendSymbol } from '@/lib/format';
import { colors, radii, shadows } from '@/theme';
import type { Product } from '@/types';

type RateFilter = 'all' | 'up' | 'down';

function RateRow({ product }: { product: Product }) {
  const isDown = product.trend === 'down';
  const isNeutral = product.trend !== 'up' && product.trend !== 'down';
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.name}>{product.variety_name}</Text>
        <Text style={styles.meta}>{product.price_basis || 'EX_MILL'} • {product.market_location || 'Miryalaguda'}</Text>
        <Text style={styles.updated}>Updated {formatDate(product.last_updated)}</Text>
      </View>
      <View style={styles.rateWrap}>
        <Text style={styles.rate}>{formatRate(product)}</Text>
        <Text style={styles.unit}>per {readableUnit(product.unit)}</Text>
        <View style={[styles.trendPill, isDown && styles.trendDown, isNeutral && styles.trendNeutral]}>
          <Text style={[styles.trend, isDown && styles.trendTextDown, isNeutral && styles.trendTextNeutral]}>{trendSymbol(product.trend)} {product.percentage_change ? `${Math.abs(product.percentage_change).toFixed(2)}%` : 'Stable'}</Text>
        </View>
      </View>
    </View>
  );
}

export default function RatesScreen() {
  const { products, loading, error, refreshing, refresh } = useProducts();
  const [filter, setFilter] = useState<RateFilter>('all');
  const rateProducts = useMemo(() => products.filter((product) => filter === 'all' || product.trend === filter), [filter, products]);
  const latestUpdate = products.map((product) => product.last_updated).filter(Boolean).sort().at(-1);

  return (
    <Screen refreshing={refreshing} onRefresh={() => void refresh()} header={<AppHeader eyebrow="MARKET INTELLIGENCE" />}>
      <AnimatedReveal><SectionTitle eyebrow="MIRYALAGUDA WHOLESALE" title="Indicative market rates" description="Clear rate context for planning. Final offers depend on grade, quantity, packaging and delivery requirements." /></AnimatedReveal>

      <AnimatedReveal delay={65}>
        <View style={styles.summaryCard}>
          <View style={styles.pulse} />
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryTitle}>Published rate board</Text>
            <Text style={styles.summaryText}>{products.length} varieties • Last change {formatDate(latestUpdate)}</Text>
          </View>
          <Text style={styles.summaryBadge}>LIVE</Text>
        </View>
      </AnimatedReveal>

      <View style={styles.filters} accessibilityRole="tablist">
        {([['all', 'All rates'], ['up', 'Moving up'], ['down', 'Moving down']] as const).map(([value, label]) => (
          <Pressable key={value} accessibilityRole="tab" accessibilityState={{ selected: filter === value }} onPress={() => setFilter(value)} style={[styles.filter, filter === value && styles.filterActive]}>
            <Text style={[styles.filterText, filter === value && styles.filterTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.notice}><Text style={styles.noticeMark}>i</Text><Text style={styles.noticeText}>Informational market indications only—not binding quotations or financial advice.</Text></View>
      {loading
        ? <LoadingState label="Loading current rate indications…" />
        : error
          ? <ErrorState message={error} />
          : rateProducts.length === 0
            ? <EmptyState title="No matching movements" message="There are no published products in this rate movement category." />
            : rateProducts.map((product, index) => <AnimatedReveal delay={Math.min(index * 40, 240)} key={product.id}><RateRow product={product} /></AnimatedReveal>)}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.secondary, borderRadius: radii.lg, padding: 17, ...shadows.soft },
  pulse: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#62D492', borderWidth: 3, borderColor: 'rgba(255,255,255,0.24)' },
  summaryCopy: { flex: 1, gap: 3 },
  summaryTitle: { color: colors.white, fontSize: 15, fontWeight: '900' },
  summaryText: { color: '#BACCC0', fontSize: 10, fontWeight: '700' },
  summaryBadge: { color: colors.primaryLight, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  filters: { flexDirection: 'row', backgroundColor: colors.surfaceMuted, borderRadius: radii.md, padding: 4, gap: 3 },
  filter: { flex: 1, minHeight: 39, alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingHorizontal: 5 },
  filterActive: { backgroundColor: colors.surface, ...shadows.soft },
  filterText: { color: colors.textMuted, fontSize: 10, fontWeight: '800', textAlign: 'center' },
  filterTextActive: { color: colors.text },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: radii.md, backgroundColor: colors.surfaceWarm, borderWidth: 1, borderColor: '#EED59E' },
  noticeMark: { width: 24, height: 24, borderRadius: 12, overflow: 'hidden', textAlign: 'center', textAlignVertical: 'center', backgroundColor: colors.primaryDark, color: colors.white, fontWeight: '900' },
  noticeText: { flex: 1, color: '#79571D', fontWeight: '700', lineHeight: 18, fontSize: 11 },
  row: { flexDirection: 'row', gap: 12, padding: 17, borderRadius: radii.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, ...shadows.soft },
  copy: { flex: 1, gap: 5 },
  name: { color: colors.text, fontSize: 16, fontWeight: '900', lineHeight: 21 },
  meta: { color: colors.textMuted, fontSize: 9, lineHeight: 14, fontWeight: '800' },
  updated: { color: colors.textMuted, fontSize: 9 },
  rateWrap: { alignItems: 'flex-end', justifyContent: 'center', maxWidth: '45%' },
  rate: { color: colors.success, fontSize: 18, fontWeight: '900', textAlign: 'right' },
  unit: { color: colors.textMuted, fontSize: 9, fontWeight: '700', textAlign: 'right', marginTop: 1 },
  trendPill: { backgroundColor: colors.successSoft, borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 4, marginTop: 6 },
  trendDown: { backgroundColor: colors.dangerSoft },
  trendNeutral: { backgroundColor: colors.surfaceMuted },
  trend: { color: colors.success, fontSize: 9, fontWeight: '900' },
  trendTextDown: { color: colors.danger },
  trendTextNeutral: { color: colors.textMuted },
});
