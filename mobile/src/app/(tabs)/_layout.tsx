import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadows } from '@/theme';

const TabIcon = ({ symbol, focused }: { symbol: string; focused: boolean }) => (
  <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
    <Text style={[styles.icon, focused && styles.iconActive]}>{symbol}</Text>
  </View>
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.label,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ focused }) => <TabIcon symbol="⌂" focused={focused} /> }} />
      <Tabs.Screen name="products" options={{ title: 'Products', tabBarIcon: ({ focused }) => <TabIcon symbol="◇" focused={focused} /> }} />
      <Tabs.Screen name="rates" options={{ title: 'Rates', tabBarIcon: ({ focused }) => <TabIcon symbol="₹" focused={focused} /> }} />
      <Tabs.Screen name="enquire" options={{ title: 'Enquire', tabBarIcon: ({ focused }) => <TabIcon symbol="✦" focused={focused} /> }} />
      <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: ({ focused }) => <TabIcon symbol="•••" focused={focused} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: { height: 76, paddingTop: 7, paddingBottom: 9, backgroundColor: colors.surface, borderTopColor: colors.border, ...shadows.soft },
  label: { fontWeight: '800', fontSize: 10, marginTop: 1 },
  iconWrap: { width: 36, height: 29, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
  iconWrapActive: { backgroundColor: colors.surfaceWarm },
  icon: { color: colors.textMuted, fontWeight: '900', fontSize: 18, lineHeight: 20 },
  iconActive: { color: colors.primaryDark },
});
