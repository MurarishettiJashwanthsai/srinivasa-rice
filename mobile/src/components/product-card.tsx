import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { resolveImageUrl } from '@/config';
import { formatRate, readableUnit, trendSymbol } from '@/lib/format';
import { colors, radii, shadows } from '@/theme';
import type { Product } from '@/types';

export function ProductCard({ product }: { product: Product }) {
  const image = resolveImageUrl(product.image_url);
  const [imageFailed, setImageFailed] = useState(false);
  const isDown = product.trend === 'down';
  const isUp = product.trend === 'up';

  useEffect(() => setImageFailed(false), [image]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${product.variety_name} specifications and rate`}
      onPress={() => router.push({ pathname: '/product/[slug]', params: { slug: product.slug } })}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.imageWrap}>
        {image && !imageFailed
          ? <Image source={{ uri: image, cache: 'force-cache' }} onError={() => setImageFailed(true)} style={styles.image} resizeMode="cover" />
          : <View style={[styles.image, styles.placeholder]}><Text style={styles.grain}>✦</Text><Text style={styles.placeholderText}>PREMIUM RICE</Text></View>}
        <View style={styles.gradePill}><Text style={styles.grade}>{product.grade || 'EXPORT GRADE'}</Text></View>
      </View>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <View style={styles.titleCopy}>
            <Text style={styles.name} numberOfLines={2}>{product.variety_name}</Text>
            <Text style={styles.spec} numberOfLines={1}>{product.processing || 'Specification on request'}</Text>
          </View>
          <View style={styles.arrowCircle}><Text style={styles.arrow}>›</Text></View>
        </View>
        <View style={styles.rule} />
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceLabel}>INDICATIVE RATE</Text>
            <Text style={styles.price}>{formatRate(product)}</Text>
          </View>
          <View style={[styles.trend, isDown && styles.trendDown, !isDown && !isUp && styles.trendNeutral]}>
            <Text style={[styles.trendText, isDown && styles.trendTextDown, !isDown && !isUp && styles.trendTextNeutral]}>{trendSymbol(product.trend)} {product.percentage_change ? `${Math.abs(product.percentage_change).toFixed(1)}%` : 'Stable'}</Text>
          </View>
        </View>
        <Text style={styles.unit}>per {readableUnit(product.unit)} • {product.price_basis || 'EX_MILL'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radii.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, marginBottom: 16, ...shadows.soft },
  pressed: { opacity: 0.91, transform: [{ scale: 0.992 }] },
  imageWrap: { height: 174, backgroundColor: colors.surfaceMuted },
  image: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.secondarySoft },
  grain: { color: colors.primary, fontSize: 34, marginBottom: 6 },
  placeholderText: { fontSize: 10, letterSpacing: 2, fontWeight: '900', color: colors.primaryLight },
  gradePill: { position: 'absolute', left: 13, bottom: 13, backgroundColor: 'rgba(255,255,255,0.93)', borderRadius: radii.pill, paddingHorizontal: 11, paddingVertical: 6 },
  grade: { color: colors.primaryDark, fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  copy: { padding: 17 },
  titleRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  titleCopy: { flex: 1, gap: 5 },
  name: { color: colors.text, fontWeight: '900', fontSize: 20, lineHeight: 24 },
  spec: { color: colors.textMuted, fontWeight: '600', fontSize: 12 },
  arrowCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  arrow: { color: colors.secondary, fontSize: 24, lineHeight: 24 },
  rule: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: 14 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  priceLabel: { color: colors.textMuted, fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  price: { color: colors.success, fontWeight: '900', fontSize: 18, marginTop: 2 },
  unit: { color: colors.textMuted, fontSize: 10, fontWeight: '700', marginTop: 4 },
  trend: { backgroundColor: colors.successSoft, borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 6 },
  trendDown: { backgroundColor: colors.dangerSoft },
  trendNeutral: { backgroundColor: colors.surfaceMuted },
  trendText: { color: colors.success, fontSize: 10, fontWeight: '900' },
  trendTextDown: { color: colors.danger },
  trendTextNeutral: { color: colors.textMuted },
});
