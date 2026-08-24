import { StyleSheet, Text, View } from 'react-native';
import { ActionButton } from '@/components/action-button';
import { AnimatedReveal } from '@/components/animated-reveal';
import { AppHeader } from '@/components/app-header';
import { Screen } from '@/components/screen';
import { SectionTitle } from '@/components/section-title';
import { ABOUT_URL, CERTIFICATIONS_URL, PACKAGING_URL, PRIVACY_URL } from '@/config';
import { openEmail, openPhone, openTrustedWebPage } from '@/lib/links';
import { colors, radii, shadows } from '@/theme';

const links = [
  { symbol: '◉', title: 'About the enterprise', description: 'Rice sourcing expertise and business approach', url: ABOUT_URL },
  { symbol: '✓', title: 'Quality & certifications', description: 'Infrastructure and quality standards', url: CERTIFICATIONS_URL },
  { symbol: '▣', title: 'Packaging options', description: 'Bulk and branded packaging information', url: PACKAGING_URL },
  { symbol: '§', title: 'Privacy & legal', description: 'How enquiry information is handled', url: PRIVACY_URL },
] as const;

export default function MoreScreen() {
  return (
    <Screen header={<AppHeader eyebrow="COMPANY & SUPPORT" />}>
      <AnimatedReveal><SectionTitle eyebrow="SRI SRINIVASA ENTERPRISE" title="Trade support beyond rates" description="Learn about our sourcing, quality, packaging and customer support." /></AnimatedReveal>

      <View style={styles.linkList}>
        {links.map((item, index) => (
          <AnimatedReveal key={item.title} delay={60 + index * 55}>
            <View style={styles.linkCard}>
              <View style={styles.linkIcon}><Text style={styles.linkIconText}>{item.symbol}</Text></View>
              <View style={styles.linkCopy}><Text style={styles.linkTitle}>{item.title}</Text><Text style={styles.linkDescription}>{item.description}</Text></View>
              <Text style={styles.chevron}>›</Text>
              <View style={styles.fullButton}><ActionButton label={`Open ${item.title}`} variant="ghost" onPress={() => void openTrustedWebPage(item.url)} /></View>
            </View>
          </AnimatedReveal>
        ))}
      </View>

      <View style={styles.contactCard}>
        <Text style={styles.contactEyebrow}>CONTACT DESK</Text>
        <Text style={styles.contactTitle}>Direct help when you need it</Text>
        <Text style={styles.contactText}>For urgent product or rate questions, contact the business through its published channels.</Text>
        <View style={styles.contactActions}>
          <ActionButton label="Call +91 98667 60028" variant="outline" onPress={() => void openPhone('+919866760028')} />
          <ActionButton label="Email the business" variant="outline" onPress={() => void openEmail('srinivasulu@srinivascanvassing.com')} />
        </View>
      </View>

      <Text style={styles.version}>SRI SRINIVASA ENTERPRISE • APP VERSION 1.0.0</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  linkList: { gap: 11 },
  linkCard: { position: 'relative', flexDirection: 'row', alignItems: 'center', gap: 13, padding: 16, paddingBottom: 82, backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, ...shadows.soft },
  linkIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.surfaceWarm, alignItems: 'center', justifyContent: 'center' },
  linkIconText: { color: colors.primaryDark, fontSize: 17, fontWeight: '900' },
  linkCopy: { flex: 1, gap: 3 },
  linkTitle: { color: colors.text, fontSize: 15, fontWeight: '900' },
  linkDescription: { color: colors.textMuted, fontSize: 11, lineHeight: 16, fontWeight: '600' },
  chevron: { color: colors.textMuted, fontSize: 25 },
  fullButton: { position: 'absolute', left: 16, right: 16, bottom: 14 },
  contactCard: { padding: 21, borderRadius: radii.xl, backgroundColor: colors.surfaceMuted, gap: 8 },
  contactEyebrow: { color: colors.primaryDark, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  contactTitle: { color: colors.text, fontSize: 21, fontWeight: '900' },
  contactText: { color: colors.textMuted, fontWeight: '600', lineHeight: 20, marginBottom: 5 },
  contactActions: { gap: 9 },
  version: { textAlign: 'center', color: colors.textMuted, fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
});
