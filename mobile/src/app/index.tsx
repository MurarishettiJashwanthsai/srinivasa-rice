import { useCallback, useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AccessibilityInfo, Animated, Image, Platform, ScrollView, StyleSheet, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '@/components/action-button';
import { AnimatedReveal } from '@/components/animated-reveal';
import { BackToTopButton } from '@/components/back-to-top-button';
import { SITE_URL } from '@/config';
import { colors, radii, shadows } from '@/theme';

const features = [
  { symbol: '◇', title: 'Published products', text: 'Explore current rice varieties and specifications.' },
  { symbol: '₹', title: 'Market-rate clarity', text: 'Follow indicative rates from the Miryalaguda desk.' },
  { symbol: '✓', title: 'Secure enquiries', text: 'Send requirements into the protected CRM workflow.' },
] as const;

export default function WelcomeScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [atPageEnd, setAtPageEnd] = useState(false);
  const logoProgress = useRef(new Animated.Value(0)).current;
  const copyProgress = useRef(new Animated.Value(0)).current;
  const actionProgress = useRef(new Animated.Value(0)).current;
  const ambient = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let active = true;
    let ambientAnimation: Animated.CompositeAnimation | undefined;

    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!active) return;
      if (reduceMotion) {
        logoProgress.setValue(1);
        copyProgress.setValue(1);
        actionProgress.setValue(1);
        return;
      }

      Animated.sequence([
        Animated.spring(logoProgress, { toValue: 1, speed: 12, bounciness: 9, useNativeDriver: Platform.OS !== 'web' }),
        Animated.parallel([
          Animated.timing(copyProgress, { toValue: 1, duration: 520, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(actionProgress, { toValue: 1, duration: 580, delay: 160, useNativeDriver: Platform.OS !== 'web' }),
        ]),
      ]).start();

      ambientAnimation = Animated.loop(Animated.sequence([
        Animated.timing(ambient, { toValue: 1, duration: 2600, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(ambient, { toValue: 0, duration: 2600, useNativeDriver: Platform.OS !== 'web' }),
      ]));
      ambientAnimation.start();
    });

    return () => {
      active = false;
      logoProgress.stopAnimation();
      copyProgress.stopAnimation();
      actionProgress.stopAnimation();
      ambientAnimation?.stop();
    };
  }, [actionProgress, ambient, copyProgress, logoProgress]);

  const enterApp = () => router.replace('/(tabs)');

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
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <View pointerEvents="none" style={styles.pattern}>
        <Animated.View style={[styles.glow, { transform: [{ scale: ambient.interpolate({ inputRange: [0, 1], outputRange: [1, 1.16] }) }] }]} />
        <View style={styles.ringOne} />
        <View style={styles.ringTwo} />
        <Text style={styles.grainOne}>✦</Text>
        <Text style={styles.grainTwo}>✦</Text>
      </View>

      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} onScroll={handleScroll} scrollEventThrottle={32}>
        <View style={styles.topRow}>
          <Text style={styles.location}>MIRYALAGUDA • TELANGANA</Text>
          <View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE DATA</Text></View>
        </View>

        <Animated.View style={[
          styles.logoStage,
          {
            opacity: logoProgress,
            transform: [
              { scale: logoProgress.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] }) },
              { rotate: logoProgress.interpolate({ inputRange: [0, 1], outputRange: ['-8deg', '0deg'] }) },
            ],
          },
        ]}>
          <View style={styles.logoHalo} />
          <View style={styles.logoFrame}>
            <Text style={styles.logoFallback}>SSE</Text>
            <Image source={{ uri: `${SITE_URL}/logo-256.png`, cache: 'force-cache' }} style={styles.logo} resizeMode="contain" accessibilityLabel="Sri Srinivasa Enterprise logo" />
          </View>
          <View style={styles.verified}><Text style={styles.verifiedText}>✓</Text></View>
        </Animated.View>

        <Animated.View style={[
          styles.intro,
          {
            opacity: copyProgress,
            transform: [{ translateY: copyProgress.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
          },
        ]}>
          <Text style={styles.eyebrow}>WELCOME TO</Text>
          <Text style={styles.title}>Sri Srinivasa{`\n`}Enterprise</Text>
          <Text style={styles.subtitle}>Rice sourcing intelligence, product information and secure trade support in one connected app.</Text>
        </Animated.View>

        <View style={styles.features}>
          {features.map((feature, index) => (
            <AnimatedReveal key={feature.title} delay={620 + index * 100} distance={12}>
              <View style={styles.featureCard}>
                <View style={styles.featureIcon}><Text style={styles.featureSymbol}>{feature.symbol}</Text></View>
                <View style={styles.featureCopy}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureText}>{feature.text}</Text>
                </View>
              </View>
            </AnimatedReveal>
          ))}
        </View>

        <Animated.View style={[
          styles.action,
          {
            opacity: actionProgress,
            transform: [{ translateY: actionProgress.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
          },
        ]}>
          <ActionButton label="Explore the app" onPress={enterApp} accessibilityHint="Opens the main application" />
          <Text style={styles.securityNote}>SECURE • ADMIN-SYNCED • CUSTOMER-FOCUSED</Text>
        </Animated.View>
      </ScrollView>
      <BackToTopButton visible={showBackToTop} atPageEnd={atPageEnd} onPress={scrollToTop} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.secondary },
  pattern: { ...StyleSheet.absoluteFill, overflow: 'hidden' },
  glow: { position: 'absolute', width: 360, height: 360, borderRadius: 180, backgroundColor: 'rgba(217,164,65,0.14)', top: -190, right: -130 },
  ringOne: { position: 'absolute', width: 230, height: 230, borderRadius: 115, borderWidth: 1, borderColor: 'rgba(243,213,140,0.10)', top: 145, left: -145 },
  ringTwo: { position: 'absolute', width: 180, height: 180, borderRadius: 90, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', bottom: 65, right: -100 },
  grainOne: { position: 'absolute', color: 'rgba(243,213,140,0.14)', fontSize: 64, top: 110, right: 22 },
  grainTwo: { position: 'absolute', color: 'rgba(255,255,255,0.07)', fontSize: 46, bottom: 180, left: 16 },
  content: { width: '100%', maxWidth: 700, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 12, paddingBottom: 26, flexGrow: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  location: { color: colors.primaryLight, fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 6, borderRadius: radii.pill, backgroundColor: 'rgba(255,255,255,0.08)' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#6EDB98' },
  liveText: { color: '#DDF7E7', fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  logoStage: { alignSelf: 'center', width: 138, height: 138, alignItems: 'center', justifyContent: 'center', marginTop: 28, marginBottom: 22 },
  logoHalo: { position: 'absolute', width: 138, height: 138, borderRadius: 69, backgroundColor: 'rgba(217,164,65,0.13)', borderWidth: 1, borderColor: 'rgba(243,213,140,0.18)' },
  logoFrame: { width: 104, height: 104, borderRadius: 32, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...shadows.raised },
  logoFallback: { position: 'absolute', color: colors.secondary, fontSize: 18, fontWeight: '900' },
  logo: { width: 94, height: 88, backgroundColor: colors.white },
  verified: { position: 'absolute', right: 8, bottom: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.secondary },
  verifiedText: { color: colors.white, fontWeight: '900', fontSize: 15 },
  intro: { alignItems: 'center', gap: 8 },
  eyebrow: { color: colors.primaryLight, fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  title: { color: colors.white, textAlign: 'center', fontSize: 36, lineHeight: 40, fontWeight: '900', letterSpacing: -0.9 },
  subtitle: { color: '#C9D8CE', textAlign: 'center', fontSize: 13, lineHeight: 20, fontWeight: '600', maxWidth: 480 },
  features: { gap: 9, marginTop: 24 },
  featureCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderRadius: radii.md, backgroundColor: 'rgba(255,255,255,0.075)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)' },
  featureIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: 'rgba(217,164,65,0.16)', alignItems: 'center', justifyContent: 'center' },
  featureSymbol: { color: colors.primaryLight, fontSize: 17, fontWeight: '900' },
  featureCopy: { flex: 1, gap: 2 },
  featureTitle: { color: colors.white, fontSize: 13, fontWeight: '900' },
  featureText: { color: '#B5C7BB', fontSize: 10, lineHeight: 15, fontWeight: '600' },
  action: { marginTop: 'auto', paddingTop: 24, gap: 12 },
  securityNote: { color: '#8FA697', textAlign: 'center', fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
});
