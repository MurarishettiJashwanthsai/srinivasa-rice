export const RATE_UNIT_OPTIONS = Object.freeze([
    { value: 'MT', label: 'Metric Tonne (1,000 kg)', shortLabel: 'MT' },
    { value: 'QUINTAL', label: 'Quintal (100 kg)', shortLabel: 'qtl' },
    { value: 'KG', label: 'Kilogram', shortLabel: 'kg' },
    { value: 'SHORT_TON', label: 'US Short Ton (907.18 kg)', shortLabel: 'US ton' },
    { value: 'LONG_TON', label: 'Imperial Long Ton (1,016.05 kg)', shortLabel: 'UK ton' },
    { value: 'BAG_50KG', label: '50 kg Bag', shortLabel: '50 kg bag' },
    { value: 'BAG_25KG', label: '25 kg Bag', shortLabel: '25 kg bag' },
]);

export const getRateUnitShortLabel = (unit) => (
    RATE_UNIT_OPTIONS.find((option) => option.value === unit)?.shortLabel || unit || 'MT'
);
