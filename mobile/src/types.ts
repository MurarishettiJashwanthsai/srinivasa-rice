export type Product = {
  id: number | string;
  variety_name: string;
  slug: string;
  grade?: string | null;
  current_price_mt?: number | null;
  previous_price_mt?: number | null;
  percentage_change?: number | null;
  trend?: string | null;
  currency?: string | null;
  unit?: string | null;
  price_basis?: string | null;
  market_location?: string | null;
  public_note?: string | null;
  last_updated?: string | null;
  image_url?: string | null;
  moisture?: string | null;
  processing?: string | null;
  status?: string | null;
};

export type ProductsState = {
  products: Product[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export type QuoteRequest = {
  name: string;
  company: string;
  email?: string;
  whatsapp: string;
  product_name?: string;
  quantity_mt?: number;
  quantity_unit: string;
  packaging_type?: string;
  inquiry: string;
  privacy_consent: boolean;
  marketing_consent: boolean;
  turnstile_token: string;
  honeypot: string;
  source_page: 'mobile-app';
  client_submission_id: string;
};

export type QuoteResponse = {
  message: string;
  request_id: string;
  notification_status?: string;
  confirmation_status?: string;
};
