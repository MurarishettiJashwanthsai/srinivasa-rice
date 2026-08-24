import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { ActionButton } from '@/components/action-button';
import { AnimatedReveal } from '@/components/animated-reveal';
import { ErrorState, LoadingState } from '@/components/feedback-state';
import { Screen } from '@/components/screen';
import { makeWhatsAppUrl, resolveImageUrl } from '@/config';
import { useProducts } from '@/hooks/use-products';
import { getProductBySlug } from '@/lib/api';
import { formatDate, formatRate, readableUnit, trendSymbol } from '@/lib/format';
import { openTrustedWebPage } from '@/lib/links';
import { colors, radii, shadows } from '@/theme';
import type { Product } from '@/types';

const Specification = ({ label, value }: { label: string; value?: string | null }) => (
  <View style={styles.specRow}>
    <Text style={styles.specLabel}>{label}</Text>
    <Text style={styles.specValue}>{value || 'Confirm before quotation'}</Text>
  </View>
);

export default function ProductDetailScreen() {
  const params = useLocalSearchParams<{ slug?: string | string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const { products } = useProducts();
  const cachedProduct = products.find((item) => item.slug === slug);
  const [product, setProduct] = useState<Product | null>(cachedProduct || null);
  const [loading, setLoading] = useState(!cachedProduct);
  const [error, setError] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (cachedProduct) {
      setProduct(cachedProduct);
      setLoading(false);
      setError(null);
      return;
    }
    if (!slug) {
      setError('The product reference is missing.');
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    getProductBySlug(slug)
      .then((result) => { if (active) setProduct(result); })
      .catch((loadError) => { if (active) setError(loadError instanceof Error ? loadError.message : 'This product could not be loaded.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [cachedProduct, slug]);

  useEffect(() => setImageFailed(false), [product?.image_url]);

  if (loading) return <Screen><LoadingState label="Loading product specifications…" /></Screen>;
  if (error || !product) return <Screen><ErrorState message={error || 'Product unavailable.'} /></Screen>;

  const image = resolveImageUrl(product.image_url);
  const isDown = product.trend === 'down';

  return (
    <Screen>
      <AnimatedReveal distance={8}>
        <ImageBackground source={image && !imageFailed ? { uri: image, cache: 'force-cache' } : undefined} onError={() => setImageFailed(true)} style={styles.image} imageStyle={styles.imageRadius}>
          <View style={styles.imageOverlay} />
          <View style={styles.imageTop}><Text style={styles.grade}>{product.grade || 'PUBLISHED RICE VARIETY'}</Text></View>
          <View style={styles.imageBottom}>
            <Text style={styles.title}>{product.variety_name}</Text>
            <Text style={styles.location}>{product.market_location || 'Miryalaguda, Telangana'}</Text>
          </View>
        </ImageBackground>
      </AnimatedReveal>

      <AnimatedReveal delay={70}>
        <View style={styles.rateCard}>
          <View style={styles.rateHeader}>
            <Text style={styles.rateLabel}>INDICATIVE RATE • {product.price_basis || 'EX_MILL'}</Text>
            <View style={[styles.trendPill, isDown && styles.trendDown]}><Text style={[styles.trendText, isDown && styles.trendTextDown]}>{trendSymbol(product.trend)} {product.percentage_change ? `${Math.abs(product.percentage_change).toFixed(2)}%` : 'Stable'}</Text></View>
          </View>
          <Text style={styles.rate}>{formatRate(product)}</Text>
          <Text style={styles.rateUnit}>per {readableUnit(product.unit)} • {product.currency || 'INR'}</Text>
          <View style={styles.rateRule} />
          <Text style={styles.disclaimer}>Indicative only. Final price depends on quality, quantity, packing and prevailing market conditions.</Text>
        </View>
      </AnimatedReveal>

      <AnimatedReveal delay={120}>
        <View style={styles.specCard}>
          <Text style={styles.specEyebrow}>PRODUCT INFORMATION</Text>
          <Text style={styles.specTitle}>Specifications</Text>
          <Specification label="Processing" value={product.processing} />
          <Specification label="Moisture" value={product.moisture} />
          <Specification label="Price basis" value={product.price_basis} />
          <Specification label="Rate unit" value={readableUnit(product.unit)} />
          <Specification label="Last updated" value={formatDate(product.last_updated)} />
        </View>
      </AnimatedReveal>

      {product.public_note ? <View style={styles.note}><Text style={styles.noteLabel}>PUBLIC NOTE</Text><Text style={styles.noteText}>{product.public_note}</Text></View> : null}

      <View style={styles.quoteCard}>
        <Text style={styles.quoteEyebrow}>READY TO DISCUSS?</Text>
        <Text style={styles.quoteTitle}>Request a quote for {product.variety_name}</Text>
        <Text style={styles.quoteText}>The protected form preselects this product. Add your quantity, packaging and contact information to receive a reference number.</Text>
        <ActionButton label="Open in-app quote form" onPress={() => router.push({ pathname: '/enquire', params: { product: product.variety_name } })} />
        <ActionButton label="Discuss on WhatsApp" variant="ghost" onPress={() => void openTrustedWebPage(makeWhatsAppUrl(`Hello, I would like to discuss ${product.variety_name}.`))} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  image: { height: 350, width: '100%', borderRadius: radii.xl, overflow: 'hidden', justifyContent: 'space-between', backgroundColor: colors.secondarySoft, ...shadows.raised },
  imageRadius: { borderRadius: radii.xl },
  imageOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(4,18,10,0.52)' },
  imageTop: { padding: 18, alignItems: 'flex-start' },
  grade: { color: colors.primaryLight, backgroundColor: 'rgba(8,26,16,0.72)', borderRadius: radii.pill, paddingHorizontal: 11, paddingVertical: 7, fontSize: 9, fontWeight: '900', letterSpacing: 1.15, overflow: 'hidden' },
  imageBottom: { padding: 22, gap: 7 },
  title: { color: colors.white, fontSize: 32, lineHeight: 37, fontWeight: '900', letterSpacing: -0.6 },
  location: { color: '#D7E2DA', fontSize: 12, fontWeight: '700' },
  rateCard: { borderRadius: radii.lg, backgroundColor: colors.secondary, padding: 20, gap: 4, ...shadows.soft },
  rateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  rateLabel: { flex: 1, color: colors.primaryLight, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  trendPill: { backgroundColor: 'rgba(82,204,132,0.15)', paddingHorizontal: 8, paddingVertical: 5, borderRadius: radii.pill },
  trendDown: { backgroundColor: 'rgba(255,120,110,0.14)' },
  trendText: { color: '#76D99C', fontSize: 9, fontWeight: '900' },
  trendTextDown: { color: '#FFAAA4' },
  rate: { color: colors.white, fontSize: 34, fontWeight: '900', marginTop: 6 },
  rateUnit: { color: '#C9D6CE', fontWeight: '700', fontSize: 12 },
  rateRule: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.16)', marginVertical: 10 },
  disclaimer: { color: '#AFC1B5', fontSize: 10, lineHeight: 16 },
  specCard: { borderRadius: radii.lg, backgroundColor: colors.surface, padding: 18, borderWidth: 1, borderColor: colors.border, ...shadows.soft },
  specEyebrow: { color: colors.primaryDark, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  specTitle: { color: colors.text, fontSize: 21, fontWeight: '900', marginTop: 4, marginBottom: 8 },
  specRow: { flexDirection: 'row', gap: 16, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  specLabel: { color: colors.textMuted, fontWeight: '700', fontSize: 12, width: 95 },
  specValue: { color: colors.text, fontWeight: '800', fontSize: 12, flex: 1, textAlign: 'right' },
  note: { padding: 17, borderRadius: radii.md, backgroundColor: colors.surfaceWarm, borderWidth: 1, borderColor: '#EED59E', gap: 5 },
  noteLabel: { color: colors.primaryDark, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  noteText: { color: '#70511E', fontWeight: '700', lineHeight: 20, fontSize: 12 },
  quoteCard: { padding: 21, borderRadius: radii.xl, backgroundColor: colors.surfaceMuted, gap: 10 },
  quoteEyebrow: { color: colors.primaryDark, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  quoteTitle: { color: colors.text, fontSize: 21, lineHeight: 26, fontWeight: '900' },
  quoteText: { color: colors.textMuted, lineHeight: 20, fontSize: 12, fontWeight: '600', marginBottom: 3 },
});
