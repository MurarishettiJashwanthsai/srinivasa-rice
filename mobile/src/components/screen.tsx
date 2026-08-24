import type { PropsWithChildren, ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme';

type Props = PropsWithChildren<{
  refreshing?: boolean;
  onRefresh?: () => void;
  header?: ReactNode;
}>;

export function Screen({ children, refreshing = false, onRefresh, header }: Props) {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      {header ? <View style={styles.header}><View style={styles.headerInner}>{header}</View></View> : null}
      <View pointerEvents="none" style={styles.decorOne} />
      <View pointerEvents="none" style={styles.decorTwo} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
        refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryDark} colors={[colors.primaryDark]} /> : undefined}
      >
        {children}
      </ScrollView>
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
