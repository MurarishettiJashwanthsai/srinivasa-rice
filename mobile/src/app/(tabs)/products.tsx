import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AnimatedReveal } from '@/components/animated-reveal';
import { AppHeader } from '@/components/app-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback-state';
import { ProductCard } from '@/components/product-card';
import { Screen } from '@/components/screen';
import { SectionTitle } from '@/components/section-title';
import { useProducts } from '@/hooks/use-products';
import { colors, radii } from '@/theme';

type Filter = 'all' | 'priced' | 'up';

export default function ProductsScreen() {
  const { products, loading, error, refreshing, refresh } = useProducts();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch = !normalized || [product.variety_name, product.grade, product.processing]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized));
      const matchesFilter = filter === 'all'
        || (filter === 'priced' && Boolean(product.current_price_mt))
        || (filter === 'up' && product.trend === 'up');
      return matchesSearch && matchesFilter;
    });
  }, [filter, products, query]);

  return (
    <Screen refreshing={refreshing} onRefresh={() => void refresh()} header={<AppHeader eyebrow="PRODUCT CATALOGUE" />}>
      <AnimatedReveal><SectionTitle eyebrow="FIND THE RIGHT VARIETY" title="Published rice catalogue" description="Search specifications and open any product for current rate context and secure quotation." /></AnimatedReveal>

      <AnimatedReveal delay={70}>
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            accessibilityLabel="Search rice products"
            value={query}
            onChangeText={setQuery}
            placeholder="Search variety or processing…"
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            autoCorrect={false}
            maxLength={80}
            style={styles.search}
          />
          {query ? <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')} style={styles.clear}><Text style={styles.clearText}>×</Text></Pressable> : null}
        </View>
      </AnimatedReveal>

      <View style={styles.filters} accessibilityRole="tablist">
        {([['all', 'All'], ['priced', 'With rates'], ['up', 'Moving up']] as const).map(([value, label]) => (
          <Pressable key={value} accessibilityRole="tab" accessibilityState={{ selected: filter === value }} onPress={() => setFilter(value)} style={[styles.chip, filter === value && styles.chipActive]}>
            <Text style={[styles.chipText, filter === value && styles.chipTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {!loading && !error ? <Text style={styles.resultCount}>{visibleProducts.length} {visibleProducts.length === 1 ? 'VARIETY' : 'VARIETIES'}</Text> : null}
      {loading
        ? <LoadingState label="Loading the published catalogue…" />
        : error
          ? <ErrorState message={error} />
          : visibleProducts.length === 0
            ? <EmptyState title="No matching varieties" message="Try another search term or clear the selected filter." />
            : visibleProducts.map((product, index) => <AnimatedReveal delay={Math.min(index * 45, 260)} key={product.id}><ProductCard product={product} /></AnimatedReveal>)}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchWrap: { minHeight: 54, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radii.md, paddingHorizontal: 15 },
  searchIcon: { fontSize: 23, color: colors.primaryDark, marginRight: 9 },
  search: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '700', paddingVertical: 14 },
  clear: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  clearText: { color: colors.textMuted, fontSize: 22, lineHeight: 23 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 38, paddingHorizontal: 14, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  chipActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  chipText: { color: colors.textMuted, fontSize: 11, fontWeight: '800' },
  chipTextActive: { color: colors.white },
  resultCount: { color: colors.textMuted, fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
});
