import { API_URL } from '@/config';
import type { Product, QuoteRequest, QuoteResponse } from '@/types';

const REQUEST_TIMEOUT_MS = 12_000;
const MAX_PUBLIC_RESPONSE_BYTES = 1_500_000;

export class PublicApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'PublicApiError';
  }
}

const assertSecureApiUrl = () => {
  const parsed = new URL(API_URL);
  const localDevelopment = __DEV__ && ['localhost', '127.0.0.1'].includes(parsed.hostname);
  if (parsed.protocol !== 'https:' && !localDevelopment) {
    throw new PublicApiError('The app API must use an encrypted HTTPS connection.');
  }
};

const requestJson = async <T>(path: string): Promise<T> => {
  assertSecureApiUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-App-Client': 'ssc-mobile/1.0',
      },
      signal: controller.signal,
    });
    if (!response.ok) throw new PublicApiError('The server could not complete this request.', response.status);
    const contentLength = Number(response.headers.get('content-length') || 0);
    if (contentLength > MAX_PUBLIC_RESPONSE_BYTES) throw new PublicApiError('The server response was unexpectedly large.');
    return await response.json() as T;
  } catch (error) {
    if (error instanceof PublicApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') throw new PublicApiError('The request timed out.');
    throw new PublicApiError('A secure connection to the server could not be established.');
  } finally {
    clearTimeout(timeout);
  }
};

const isProduct = (value: unknown): value is Product => {
  if (!value || typeof value !== 'object') return false;
  const product = value as Partial<Product>;
  return (typeof product.id === 'number' || typeof product.id === 'string')
    && typeof product.variety_name === 'string'
    && typeof product.slug === 'string';
};

export const getProducts = async () => {
  const response = await requestJson<unknown>('/products');
  if (!Array.isArray(response)) throw new PublicApiError('The product response was invalid.');
  return response.filter(isProduct).filter((product) => product.status !== 'archived');
};

export const getProductBySlug = async (slug: string) => {
  if (!/^[a-z0-9-]{1,160}$/i.test(slug)) throw new PublicApiError('The product reference was invalid.');
  const response = await requestJson<unknown>(`/products/slug/${encodeURIComponent(slug)}`);
  if (!isProduct(response)) throw new PublicApiError('The product response was invalid.');
  return response;
};

export const submitQuote = async (payload: QuoteRequest): Promise<QuoteResponse> => {
  assertSecureApiUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}/contact`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-App-Client': 'ssc-mobile/1.0',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const contentLength = Number(response.headers.get('content-length') || 0);
    if (contentLength > MAX_PUBLIC_RESPONSE_BYTES) throw new PublicApiError('The server response was unexpectedly large.');
    const body = await response.json() as Partial<QuoteResponse> & { detail?: string };
    if (!response.ok) throw new PublicApiError(body.detail || 'The quote request could not be submitted.', response.status);
    if (typeof body.request_id !== 'string' || !body.request_id.startsWith('RFQ-')) {
      throw new PublicApiError('The server did not return a valid enquiry reference.');
    }
    return {
      message: typeof body.message === 'string' ? body.message : 'Inquiry received successfully.',
      request_id: body.request_id,
      notification_status: body.notification_status,
      confirmation_status: body.confirmation_status,
    };
  } catch (error) {
    if (error instanceof PublicApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') throw new PublicApiError('The request timed out. Please try again.');
    throw new PublicApiError('A secure connection to the server could not be established.');
  } finally {
    clearTimeout(timeout);
  }
};
