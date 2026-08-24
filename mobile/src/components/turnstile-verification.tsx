import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { SITE_URL } from '@/config';
import { colors, radii } from '@/theme';

type Status = 'loading' | 'verified' | 'expired' | 'error';

type Props = {
  resetKey: number;
  status: Status;
  onStatusChange: (status: Status) => void;
  onToken: (token: string) => void;
};

const verificationUrl = `${SITE_URL}/mobile-turnstile`;

export function TurnstileVerification({ resetKey, status, onStatusChange, onToken }: Props) {
  const source = useMemo(() => ({ uri: `${verificationUrl}?reset=${resetKey}` }), [resetKey]);

  const statusText = {
    loading: 'Loading secure verification…',
    verified: 'Security verification completed',
    expired: 'Verification expired. Please complete it again.',
    error: 'Verification could not load. Check your connection and retry.',
  }[status];

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>ANTI-SPAM VERIFICATION *</Text>
      <View style={styles.webFrame}>
        <WebView
          key={resetKey}
          source={source}
          javaScriptEnabled
          domStorageEnabled
          thirdPartyCookiesEnabled
          scrollEnabled={false}
          setSupportMultipleWindows={false}
          originWhitelist={['https://*', 'about:*']}
          onLoadStart={() => onStatusChange('loading')}
          onError={() => {
            onToken('');
            onStatusChange('error');
          }}
          onHttpError={() => {
            onToken('');
            onStatusChange('error');
          }}
          onShouldStartLoadWithRequest={(request) => {
            if (request.url.startsWith('about:')) return true;
            try {
              const hostname = new URL(request.url).hostname;
              return hostname === new URL(SITE_URL).hostname || hostname === 'challenges.cloudflare.com';
            } catch {
              return false;
            }
          }}
          onMessage={({ nativeEvent }) => {
            if (nativeEvent.data.length > 4_096) return;
            try {
              const message = JSON.parse(nativeEvent.data) as { type?: string; token?: string };
              if (message.type === 'verified' && typeof message.token === 'string' && message.token.length <= 2_048) {
                onToken(message.token);
                onStatusChange('verified');
              } else if (message.type === 'expired') {
                onToken('');
                onStatusChange('expired');
              } else if (message.type === 'error') {
                onToken('');
                onStatusChange('error');
              }
            } catch {
              // Ignore messages that do not match the small trusted bridge protocol.
            }
          }}
          style={styles.webView}
          accessibilityLabel="Cloudflare anti-spam verification"
        />
      </View>
      <View style={[styles.status, status === 'verified' && styles.statusSuccess, (status === 'error' || status === 'expired') && styles.statusError]}>
        <Text style={[styles.statusText, status === 'verified' && styles.statusTextSuccess, (status === 'error' || status === 'expired') && styles.statusTextError]}>
          {status === 'verified' ? '✓ ' : ''}{statusText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  label: { color: colors.text, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  webFrame: { height: 84, overflow: 'hidden', borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  webView: { flex: 1, backgroundColor: colors.surface },
  status: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: radii.sm, backgroundColor: colors.surfaceMuted },
  statusSuccess: { backgroundColor: colors.successSoft },
  statusError: { backgroundColor: colors.dangerSoft },
  statusText: { color: colors.textMuted, fontSize: 10, fontWeight: '700', lineHeight: 15 },
  statusTextSuccess: { color: colors.success },
  statusTextError: { color: colors.danger },
});
