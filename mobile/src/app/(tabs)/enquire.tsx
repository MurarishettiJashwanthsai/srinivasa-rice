import { useEffect, useState, type ReactNode } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type KeyboardTypeOptions, type StyleProp, type ViewStyle } from 'react-native';
import { ActionButton } from '@/components/action-button';
import { AnimatedReveal } from '@/components/animated-reveal';
import { AppHeader } from '@/components/app-header';
import { Screen } from '@/components/screen';
import { SectionTitle } from '@/components/section-title';
import { TurnstileVerification } from '@/components/turnstile-verification';
import { makeWhatsAppUrl, PRIVACY_URL } from '@/config';
import { useProducts } from '@/hooks/use-products';
import { PublicApiError, submitQuote } from '@/lib/api';
import { openTrustedWebPage } from '@/lib/links';
import { colors, radii, shadows } from '@/theme';
import type { QuoteResponse } from '@/types';
import { countries as websiteCountries } from '../../../../frontend/src/data/countries';

type WebsiteCountry = { name: string; code: string; flag?: string; font?: string };

const countries = websiteCountries as WebsiteCountry[];

const phoneRules: Record<string, { min: number; max: number }> = {
  '+91': { min: 10, max: 10 },
  '+971': { min: 9, max: 9 },
  '+966': { min: 9, max: 9 },
  '+974': { min: 8, max: 8 },
  '+968': { min: 8, max: 8 },
  '+965': { min: 8, max: 8 },
  '+880': { min: 10, max: 10 },
  '+1': { min: 10, max: 10 },
  '+44': { min: 10, max: 11 },
};

const quantityUnits = [
  ['MT', 'Metric Tonne (1,000 kg)'],
  ['QUINTAL', 'Quintal (100 kg)'],
  ['KG', 'Kilogram'],
  ['SHORT_TON', 'US Short Ton (907.18 kg)'],
  ['LONG_TON', 'Imperial Long Ton (1,016.05 kg)'],
  ['BAG_50KG', '50 kg Bag'],
  ['BAG_25KG', '25 kg Bag'],
] as const;

const packagingOptions = ['50kg PP Bag', '26kg PP Bag', '25kg Non-Woven Bag', 'Custom Packaging'] as const;

const createSubmissionId = () => (
  globalThis.crypto?.randomUUID?.()
  || `mobile-quote-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
);

type FormState = {
  name: string;
  company: string;
  email: string;
  countryCode: string;
  countryName: string;
  whatsapp: string;
  productName: string;
  quantity: string;
  quantityUnit: string;
  packagingType: string;
  inquiry: string;
  privacyConsent: boolean;
  marketingConsent: boolean;
  submissionId: string;
};

const initialForm = (): FormState => ({
  name: '',
  company: '',
  email: '',
  countryCode: '+91',
  countryName: 'India',
  whatsapp: '',
  productName: '',
  quantity: '',
  quantityUnit: 'MT',
  packagingType: '50kg PP Bag',
  inquiry: '',
  privacyConsent: false,
  marketingConsent: false,
  submissionId: createSubmissionId(),
});

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  required?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  maxLength?: number;
  containerStyle?: StyleProp<ViewStyle>;
};

const FormField = ({ label, required, multiline, containerStyle, ...inputProps }: FieldProps) => (
  <View style={[styles.field, containerStyle]}>
    <Text style={styles.fieldLabel}>{label}{required ? <Text style={styles.required}> *</Text> : null}</Text>
    <TextInput
      {...inputProps}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      style={[styles.input, multiline && styles.textarea]}
      placeholderTextColor="#8A958D"
      accessibilityLabel={`${label}${required ? ', required' : ''}`}
    />
  </View>
);

type SelectOption = { value: string; label: string };

type SelectFieldProps = {
  label: string;
  value: string;
  options: SelectOption[];
  placeholder: string;
  onChange: (value: string) => void;
  required?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

const SelectField = ({ label, value, options, placeholder, onChange, required, containerStyle }: SelectFieldProps) => {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <View style={[styles.field, containerStyle]}>
      <Text style={styles.fieldLabel}>{label}{required ? <Text style={styles.required}> *</Text> : null}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selectedLabel || 'not selected'}`}
        accessibilityHint={`Opens the ${label.toLowerCase()} options`}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.selectTrigger, pressed && styles.selectTriggerPressed]}
      >
        <Text numberOfLines={1} style={[styles.selectValue, !selectedLabel && styles.selectPlaceholder]}>{selectedLabel || placeholder}</Text>
        <Text accessibilityElementsHidden importantForAccessibility="no" style={styles.selectChevron}>⌄</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setOpen(false)}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Close ${label} options`} style={styles.modalBackdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.selectSheet} onPress={(event) => event.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHeaderCopy}>
                <Text style={styles.sheetEyebrow}>SELECT AN OPTION</Text>
                <Text style={styles.sheetTitle}>{label}</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Close options" onPress={() => setOpen(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>×</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.optionList} contentContainerStyle={styles.optionListContent} showsVerticalScrollIndicator={false}>
              {options.map((option) => {
                const selected = option.value === value;
                return (
                  <Pressable
                    key={`${option.value}-${option.label}`}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [styles.optionRow, selected && styles.optionRowSelected, pressed && styles.optionRowPressed]}
                  >
                    <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{option.label}</Text>
                    <View style={[styles.optionIndicator, selected && styles.optionIndicatorSelected]}>
                      {selected ? <Text style={styles.optionCheck}>✓</Text> : null}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const Consent = ({ checked, onPress, children }: { checked: boolean; onPress: () => void; children: ReactNode }) => (
  <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={onPress} style={styles.consentRow}>
    <View style={[styles.checkbox, checked && styles.checkboxChecked]}><Text style={styles.checkboxMark}>{checked ? '✓' : ''}</Text></View>
    <Text style={styles.consentText}>{children}</Text>
  </Pressable>
);

export default function EnquireScreen() {
  const params = useLocalSearchParams<{ product?: string | string[] }>();
  const requestedProduct = Array.isArray(params.product) ? params.product[0] : params.product;
  const { products } = useProducts();
  const [form, setForm] = useState<FormState>(initialForm);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileStatus, setTurnstileStatus] = useState<'loading' | 'verified' | 'expired' | 'error'>('loading');
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<QuoteResponse | null>(null);
  const countryOptions = countries.map((country) => ({
    value: `${country.code}|${country.name}`,
    label: `${country.flag || country.font || '🌐'} ${country.name} (${country.code})`,
  }));
  const productOptions = [
    ...(form.productName && !products.some((product) => product.variety_name === form.productName)
      ? [{ value: form.productName, label: form.productName }]
      : []),
    ...products.map((product) => ({ value: product.variety_name, label: product.variety_name })),
    { value: 'Other / Multiple', label: 'Other / Multiple' },
  ];
  const quantityUnitOptions = quantityUnits.map(([value, label]) => ({ value, label }));
  const packageOptions = packagingOptions.map((value) => ({ value, label: value }));

  useEffect(() => {
    if (requestedProduct) {
      setForm((current) => ({ ...current, productName: requestedProduct.slice(0, 160) }));
      return;
    }
    if (products.length) {
      setForm((current) => current.productName ? current : ({ ...current, productName: products[0].variety_name }));
    }
  }, [products, requestedProduct]);

  const update = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (error) setError('');
  };

  const updateCountry = (selection: string) => {
    const separator = selection.indexOf('|');
    if (separator < 1) return;
    setForm((current) => ({
      ...current,
      countryCode: selection.slice(0, separator),
      countryName: selection.slice(separator + 1),
    }));
    if (error) setError('');
  };

  const validate = () => {
    if (form.name.trim().length < 2) return 'Enter your full name.';
    if (form.company.trim().length < 2) return 'Enter your company name.';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Enter a valid business email address.';
    const phoneDigits = form.whatsapp.replace(/\D/g, '').replace(/^0+/, '');
    const phoneRule = phoneRules[form.countryCode] || { min: 7, max: 12 };
    if (phoneDigits.length < phoneRule.min || phoneDigits.length > phoneRule.max) return `Enter a valid WhatsApp number for ${form.countryName || 'the selected country'}.`;
    if (form.quantity.trim()) {
      const quantity = Number(form.quantity);
      if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 100_000) return 'Enter a quantity between 1 and 100,000.';
    }
    if (form.inquiry.trim().length < 5) return 'Describe your rice requirement.';
    if (!form.privacyConsent) return 'Privacy consent is required to submit an enquiry.';
    if (!turnstileToken || turnstileStatus !== 'verified') return 'Complete the anti-spam verification.';
    return null;
  };

  const submit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const phoneDigits = form.whatsapp.replace(/\D/g, '').replace(/^0+/, '');
    setSubmitting(true);
    setError('');
    try {
      const result = await submitQuote({
        name: form.name.trim(),
        company: form.company.trim(),
        email: form.email.trim() || undefined,
        whatsapp: `${form.countryCode}${phoneDigits}`.replace(/[^+\d]/g, ''),
        product_name: form.productName || undefined,
        quantity_mt: form.quantity.trim() ? Number(form.quantity) : undefined,
        quantity_unit: form.quantityUnit,
        packaging_type: form.packagingType,
        inquiry: form.inquiry.trim(),
        privacy_consent: true,
        marketing_consent: form.marketingConsent,
        turnstile_token: turnstileToken,
        honeypot: '',
        source_page: 'mobile-app',
        client_submission_id: form.submissionId,
      });
      setSuccess(result);
      setTurnstileToken('');
    } catch (submitError) {
      setError(submitError instanceof PublicApiError ? submitError.message : 'The quote request could not be submitted.');
      setTurnstileToken('');
      setTurnstileStatus('loading');
      setTurnstileResetKey((current) => current + 1);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm());
    setSuccess(null);
    setError('');
    setTurnstileToken('');
    setTurnstileStatus('loading');
    setTurnstileResetKey((current) => current + 1);
  };

  if (success) {
    return (
      <Screen header={<AppHeader eyebrow="SECURE ENQUIRY DESK" />}>
        <AnimatedReveal>
          <View style={styles.successCard} accessibilityLiveRegion="polite">
            <View style={styles.successIcon}><Text style={styles.successIconText}>✓</Text></View>
            <Text style={styles.successEyebrow}>QUOTE REQUEST RECEIVED</Text>
            <Text style={styles.successTitle}>Thank you, {form.name.trim()}.</Text>
            <Text style={styles.successText}>Our export desk in Miryalaguda will review your requirements and contact you shortly via WhatsApp at {`${form.countryCode}${form.whatsapp}`.replace(/[^+\d]/g, '')}.</Text>
            <View style={styles.referenceBox}><Text style={styles.referenceLabel}>REFERENCE NUMBER</Text><Text selectable style={styles.reference}>{success.request_id}</Text></View>
            <Text style={styles.referenceHelp}>{success.confirmation_status === 'delivered' ? 'The reference was also sent using the configured confirmation service.' : 'Save this reference number for follow-up.'}</Text>
            <ActionButton label="Submit another request" onPress={resetForm} />
            <ActionButton label="Follow up on WhatsApp" variant="outline" onPress={() => void openTrustedWebPage(makeWhatsAppUrl(`Hello, I am following up on quote reference ${success.request_id}.`))} />
          </View>
        </AnimatedReveal>
      </Screen>
    );
  }

  return (
    <Screen header={<AppHeader eyebrow="SECURE ENQUIRY DESK" />}>
      <AnimatedReveal><SectionTitle eyebrow="BULK RICE ENQUIRY" title="Request Bulk Quote" description="Request official rice specifications, packaging information, and proforma quotations directly from our enterprise sourcing team." /></AnimatedReveal>

      <View style={styles.formCard}>
        <View style={styles.formIntro}>
          <View style={styles.formIcon}><Text style={styles.formIconText}>✦</Text></View>
          <View style={styles.formIntroCopy}>
            <Text style={styles.formTitle}>Tell us your requirement</Text>
            <Text style={styles.formSubtitle}>Fields marked with * are required.</Text>
          </View>
        </View>

        <FormField label="Full name" required value={form.name} onChangeText={(value) => update('name', value)} placeholder="John Doe" autoCapitalize="words" maxLength={120} />
        <FormField label="Company name" required value={form.company} onChangeText={(value) => update('company', value)} placeholder="Global Imports Ltd" autoCapitalize="words" maxLength={160} />
        <FormField label="Business email" value={form.email} onChangeText={(value) => update('email', value)} placeholder="buyer@company.com" keyboardType="email-address" autoCapitalize="none" maxLength={254} />

        <View style={styles.phoneRow}>
          <SelectField containerStyle={styles.countryField} label="Country code" required value={`${form.countryCode}|${form.countryName}`} options={countryOptions} placeholder="Country" onChange={updateCountry} />
          <FormField containerStyle={styles.phoneField} label="WhatsApp number" required value={form.whatsapp} onChangeText={(value) => update('whatsapp', value.replace(/[^\d\s()-]/g, ''))} placeholder="Number" keyboardType="phone-pad" maxLength={18} />
        </View>

        <View style={styles.formDivider} />
        <SelectField label="Rice variety" value={form.productName} options={productOptions} placeholder="Select rice variety" onChange={(value) => update('productName', value)} />
        <FormField label="Quantity" value={form.quantity} onChangeText={(value) => update('quantity', value.replace(/[^\d.]/g, ''))} placeholder="e.g. 50" keyboardType="decimal-pad" maxLength={10} />
        <SelectField label="Quantity unit" value={form.quantityUnit} options={quantityUnitOptions} placeholder="Select quantity unit" onChange={(value) => update('quantityUnit', value)} />
        <SelectField label="Packaging" value={form.packagingType} options={packageOptions} placeholder="Select packaging" onChange={(value) => update('packagingType', value)} />
        <FormField label="Requirement details" required value={form.inquiry} onChangeText={(value) => update('inquiry', value)} placeholder="Describe broken percentage, moisture preference, delivery timing, or other requirements..." autoCapitalize="sentences" multiline maxLength={2000} />

        <View style={styles.formDivider} />
        <Consent checked={form.privacyConsent} onPress={() => update('privacyConsent', !form.privacyConsent)}>
          I agree that Sri Srinivasa Enterprise may use these details to process and respond to my wholesale enquiry. *
        </Consent>
        <Consent checked={form.marketingConsent} onPress={() => update('marketingConsent', !form.marketingConsent)}>
          (Optional) I would also like to receive daily WhatsApp market-rate updates from Miryalaguda.
        </Consent>
        <Pressable accessibilityRole="link" onPress={() => void openTrustedWebPage(PRIVACY_URL)}><Text style={styles.privacyLink}>Read the Privacy Policy</Text></Pressable>
        <TurnstileVerification resetKey={turnstileResetKey} status={turnstileStatus} onStatusChange={setTurnstileStatus} onToken={setTurnstileToken} />
        <ActionButton label={submitting ? 'Processing…' : 'Submit Quote Request'} onPress={() => void submit()} disabled={submitting} accessibilityHint="Sends this requirement securely to the Sri Srinivasa Enterprise CRM" />
        <Text style={styles.responseTime}>Expected response time: within one business hour during Monday–Saturday operating hours.</Text>
        {error ? <View accessibilityRole="alert" style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  formCard: { backgroundColor: colors.surface, padding: 20, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.border, gap: 18, ...shadows.raised },
  formIntro: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 3 },
  formIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceWarm, borderWidth: 1, borderColor: '#E8CF96' },
  formIconText: { color: colors.primaryDark, fontSize: 20, fontWeight: '900' },
  formIntroCopy: { flex: 1, gap: 3 },
  formTitle: { color: colors.text, fontSize: 18, fontWeight: '900' },
  formSubtitle: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  formDivider: { height: 1, backgroundColor: colors.border, marginVertical: 2 },
  phoneRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  countryField: { flex: 0.95, minWidth: 0 },
  phoneField: { flex: 1.25, minWidth: 0 },
  field: { gap: 7 },
  fieldLabel: { color: colors.text, fontSize: 10, fontWeight: '900', letterSpacing: 1.05 },
  required: { color: colors.danger },
  input: { minHeight: 50, borderRadius: radii.md, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.background, paddingHorizontal: 14, color: colors.text, fontSize: 14, fontWeight: '700' },
  textarea: { minHeight: 124, paddingTop: 14, lineHeight: 21 },
  selectTrigger: { minHeight: 52, borderRadius: radii.md, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.background, paddingLeft: 14, paddingRight: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  selectTriggerPressed: { borderColor: colors.primary, backgroundColor: colors.surfaceWarm },
  selectValue: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '800' },
  selectPlaceholder: { color: '#8A958D', fontWeight: '700' },
  selectChevron: { color: colors.primaryDark, fontSize: 24, lineHeight: 26, fontWeight: '900', marginTop: -5 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  selectSheet: { maxHeight: '72%', backgroundColor: colors.surface, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, paddingTop: 9, paddingHorizontal: 18, paddingBottom: 24, ...shadows.raised },
  sheetHandle: { width: 42, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong, alignSelf: 'center', marginBottom: 14 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  sheetHeaderCopy: { flex: 1, gap: 3 },
  sheetEyebrow: { color: colors.primaryDark, fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  sheetTitle: { color: colors.text, fontSize: 22, fontWeight: '900' },
  closeButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceMuted },
  closeButtonText: { color: colors.text, fontSize: 28, lineHeight: 30, fontWeight: '500', marginTop: -2 },
  optionList: { flexGrow: 0 },
  optionListContent: { gap: 8, paddingTop: 13, paddingBottom: 8 },
  optionRow: { minHeight: 52, borderRadius: radii.md, paddingHorizontal: 14, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  optionRowSelected: { borderColor: colors.primary, backgroundColor: colors.surfaceWarm },
  optionRowPressed: { opacity: 0.78 },
  optionLabel: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 20, fontWeight: '700' },
  optionLabelSelected: { color: colors.secondary, fontWeight: '900' },
  optionIndicator: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  optionIndicatorSelected: { borderColor: colors.success, backgroundColor: colors.success },
  optionCheck: { color: colors.white, fontSize: 12, fontWeight: '900' },
  consentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, paddingVertical: 3 },
  checkbox: { width: 23, height: 23, borderRadius: 7, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.success, borderColor: colors.success },
  checkboxMark: { color: colors.white, fontSize: 13, fontWeight: '900' },
  consentText: { flex: 1, color: colors.textMuted, fontSize: 11, lineHeight: 18, fontWeight: '600' },
  privacyLink: { color: colors.primaryDark, fontSize: 11, fontWeight: '900', textDecorationLine: 'underline', alignSelf: 'flex-start' },
  errorBox: { padding: 14, borderRadius: radii.md, backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: '#F0C8C5' },
  errorText: { color: colors.danger, textAlign: 'center', fontWeight: '800', fontSize: 12, lineHeight: 18 },
  submitCard: { gap: 10 },
  responseTime: { color: colors.textMuted, textAlign: 'center', fontSize: 10, lineHeight: 16, fontWeight: '700' },
  successCard: { backgroundColor: colors.surface, padding: 24, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.border, alignItems: 'center', gap: 13, ...shadows.raised },
  successIcon: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.successSoft, alignItems: 'center', justifyContent: 'center' },
  successIconText: { color: colors.success, fontSize: 34, fontWeight: '900' },
  successEyebrow: { color: colors.success, fontSize: 9, fontWeight: '900', letterSpacing: 1.3 },
  successTitle: { color: colors.text, textAlign: 'center', fontSize: 25, fontWeight: '900' },
  successText: { color: colors.textMuted, textAlign: 'center', fontSize: 13, lineHeight: 21, fontWeight: '600' },
  referenceBox: { width: '100%', padding: 15, borderRadius: radii.md, backgroundColor: colors.surfaceWarm, borderWidth: 1, borderColor: '#E8CF96', alignItems: 'center', gap: 5 },
  referenceLabel: { color: colors.primaryDark, fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  reference: { color: colors.secondary, fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },
  referenceHelp: { color: colors.textMuted, textAlign: 'center', fontSize: 10, lineHeight: 16, fontWeight: '700', marginBottom: 3 },
});
