import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProductsProvider } from '@/hooks/use-products';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ProductsProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.secondary },
            headerTintColor: colors.white,
            headerTitleStyle: { fontWeight: '900' },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
            gestureEnabled: true,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="product/[slug]" options={{ title: 'Product details', headerBackTitle: 'Products' }} />
        </Stack>
      </ProductsProvider>
    </SafeAreaProvider>
  );
}
