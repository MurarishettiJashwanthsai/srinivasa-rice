import { useCallback, useRef, useState, type PropsWithChildren, type ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackToTopButton } from '@/components/back-to-top-button';
import { colors } from '@/theme';

type Props = PropsWithChildren<{
  refreshing?: boolean;
  onRefresh?: () => void;
  header?: ReactNode;
}>;

export function Screen({ children, refreshing = false, onRefresh, header }: Props) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [atPageEnd, setAtPageEnd] = useState(false);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const nextShowBackToTop = contentOffset.y > 320;
    const nextAtPageEnd = nextShowBackToTop
      && contentOffset.y + layoutMeasurement.height >= contentSize.height - 40;

    setShowBackToTop((current) => current === nextShowBackToTop ? current : nextShowBackToTop);
    setAtPageEnd((current) => current === nextAtPageEnd ? current : nextAtPageEnd);
  }, []);

  const scrollToTop = useCallback(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      {header ? <View style={styles.header}><View style={styles.headerInner}>{header}</View></View> : null}
      <View pointerEvents="none" style={styles.decorOne} />
      <View pointerEvents="none" style={styles.decorTwo} />
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={32}
        refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryDark} colors={[colors.primaryDark]} /> : undefined}
      >
        {children}
      </ScrollView>
      <BackToTopButton visible={showBackToTop} atPageEnd={atPageEnd} onPress={scrollToTop} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.secondary, paddingHorizontal: 20, paddingVertical: 13, zIndex: 2 },
  headerInner: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 58, gap: 20, flexGrow: 1, width: '100%', maxWidth: 800, alignSelf: 'center' },
  decorOne: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(217,164,65,0.06)', top: 110, right: -160 },
  decorTwo: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(16,42,29,0.035)', bottom: 40, left: -120 },
});
