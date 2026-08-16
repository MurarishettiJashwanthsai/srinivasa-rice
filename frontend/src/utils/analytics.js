const ALLOWED_EVENT_NAMES = new Set([
    'page_view',
    'quote_form_view',
    'quote_form_start',
    'quote_form_success',
    'quote_form_failure',
    'price_alert_form_success',
    'price_alert_form_failure',
    'whatsapp_click',
    'product_quote_click',
]);

const ALLOWED_PROPERTIES = new Set([
    'page_path',
    'source_page',
    'product_requested',
    'request_id',
    'notification_status',
    'confirmation_status',
    'interaction_type',
    'error_type',
]);

export const trackEvent = (eventName, properties = {}) => {
    if (typeof window === 'undefined' || !ALLOWED_EVENT_NAMES.has(eventName)) return;

    const safeProperties = Object.fromEntries(
        Object.entries(properties)
            .filter(([key, value]) => ALLOWED_PROPERTIES.has(key) && ['string', 'number', 'boolean'].includes(typeof value))
            .map(([key, value]) => [key, typeof value === 'string' ? value.slice(0, 150) : value]),
    );

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...safeProperties });
};
