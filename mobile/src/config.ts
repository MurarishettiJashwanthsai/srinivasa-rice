const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export const SITE_URL = trimTrailingSlash(process.env.EXPO_PUBLIC_SITE_URL || 'https://www.srinivascanvassing.com');
export const API_URL = trimTrailingSlash(process.env.EXPO_PUBLIC_API_URL || `${SITE_URL}/api`);
export const WHATSAPP_NUMBER = '919866760028';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const PRIVACY_URL = `${SITE_URL}/legal#privacy-policy`;
export const ABOUT_URL = `${SITE_URL}/about`;
export const CERTIFICATIONS_URL = `${SITE_URL}/certifications`;
export const PACKAGING_URL = `${SITE_URL}/packaging`;

const isDevelopmentHost = (hostname: string) => (
  hostname === 'localhost'
  || hostname === '127.0.0.1'
  || hostname.startsWith('10.')
  || hostname.startsWith('192.168.')
);

export const isAllowedWebUrl = (value: string) => {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && __DEV__ && isDevelopmentHost(url.hostname))) return false;
    const siteHost = new URL(SITE_URL).hostname;
    return url.hostname === siteHost || url.hostname === 'wa.me';
  } catch {
    return false;
  }
};

export const isAllowedImageUrl = (value: string) => {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && __DEV__ && isDevelopmentHost(url.hostname))) return false;
    const siteHost = new URL(SITE_URL).hostname;
    const apiHost = new URL(API_URL).hostname;
    if (url.hostname === siteHost || url.hostname === apiHost) return true;
    return url.hostname === 'res.cloudinary.com'
      && url.pathname.startsWith('/df948lfrf/image/upload/');
  } catch {
    return false;
  }
};

export const resolveImageUrl = (value?: string | null) => {
  if (!value) return undefined;
  const candidate = /^https?:\/\//i.test(value)
    ? value
    : `${SITE_URL}${value.startsWith('/') ? '' : '/'}${value}`;
  if (!isAllowedImageUrl(candidate)) return undefined;

  const url = new URL(candidate);
  if (url.hostname === 'res.cloudinary.com') {
    url.pathname = url.pathname.replace(
      '/df948lfrf/image/upload/',
      '/df948lfrf/image/upload/f_jpg,q_auto,w_1200/',
    );
  }
  return url.toString();
};

export const makeWhatsAppUrl = (message?: string) => (
  message ? `${WHATSAPP_URL}?text=${encodeURIComponent(message)}` : WHATSAPP_URL
);
