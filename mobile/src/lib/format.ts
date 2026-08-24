import type { Product } from '@/types';

export const formatRate = (product: Product) => {
  if (!product.current_price_mt) return 'On request';
  const currency = product.currency || 'INR';
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(Number(product.current_price_mt));
  } catch {
    return `₹${Number(product.current_price_mt).toLocaleString('en-IN')}`;
  }
};

export const formatDate = (value?: string | null) => {
  if (!value) return 'Recently reviewed';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
};

export const trendSymbol = (trend?: string | null) => trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

export const readableUnit = (value?: string | null) => ({
  MT: 'metric tonne',
  QUINTAL: 'quintal',
  KG: 'kg',
  SHORT_TON: 'short ton',
  LONG_TON: 'long ton',
  BAG_50KG: '50 kg bag',
  BAG_25KG: '25 kg bag',
}[value || 'MT'] || (value || 'MT'));
