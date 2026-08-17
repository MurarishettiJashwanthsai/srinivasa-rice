const NATIONAL_NUMBER_RULES = Object.freeze({
    '+91': { min: 10, max: 10, label: 'India' },
    '+971': { min: 9, max: 9, label: 'UAE' },
    '+880': { min: 10, max: 10, label: 'Bangladesh' },
    '+966': { min: 9, max: 9, label: 'Saudi Arabia' },
    '+974': { min: 8, max: 8, label: 'Qatar' },
    '+968': { min: 8, max: 8, label: 'Oman' },
    '+965': { min: 8, max: 8, label: 'Kuwait' },
    '+1': { min: 10, max: 10, label: 'US/Canada' },
    '+44': { min: 10, max: 11, label: 'United Kingdom' },
    '+65': { min: 8, max: 8, label: 'Singapore' },
    '+60': { min: 9, max: 10, label: 'Malaysia' },
    '+61': { min: 9, max: 9, label: 'Australia' },
});

export const normalizePhoneNumber = (countryCode, nationalNumber) => (
    `${countryCode}${nationalNumber}`.replace(/[^+\d]/g, '')
);

export const validateNationalPhoneNumber = (countryCode, nationalNumber) => {
    const digits = nationalNumber.replace(/\D/g, '').replace(/^0+/, '');
    const rule = NATIONAL_NUMBER_RULES[countryCode] || { min: 7, max: 12, label: 'selected country' };
    if (digits.length < rule.min || digits.length > rule.max) {
        const expected = rule.min === rule.max ? `${rule.min} digits` : `${rule.min}–${rule.max} digits`;
        return { valid: false, message: `Enter a valid ${rule.label} number (${expected} after the country code).` };
    }

    const fullNumber = normalizePhoneNumber(countryCode, digits);
    if (!/^\+?[1-9]\d{6,14}$/.test(fullNumber)) {
        return { valid: false, message: 'Enter a valid WhatsApp number including country code.' };
    }
    return { valid: true, fullNumber };
};
