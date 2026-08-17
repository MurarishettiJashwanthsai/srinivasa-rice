# Deployment security and indexing checklist

No production secret or service verification token belongs in GitHub. Configure the following values in the hosting dashboards before deploying this security update.

## Render backend environment

- `SECRET_KEY`: generate at least 32 random bytes; never reuse the admin password.
- `ADMIN_USERNAME`: the authorized administrator email or username.
- `ADMIN_PASSWORD`: a unique password of at least 14 characters. The backend has no built-in fallback credential.
- `ADMIN_PASSWORD_MIN_LENGTH=14`
- `ACCESS_TOKEN_HOURS=8`
- `LOGIN_MAX_ATTEMPTS=5`
- `LOGIN_WINDOW_MINUTES=15`
- `LOGIN_LOCKOUT_MINUTES=15`
- `MAX_IMAGE_BYTES=5242880`
- `SITE_URL=https://www.srinivascanvassing.com`
- `FRONTEND_URL=https://www.srinivascanvassing.com`
- `TURNSTILE_SECRET_KEY`: Cloudflare Turnstile secret key.
- `LEAD_NOTIFICATION_WEBHOOK_URL`: private team/CRM new-enquiry webhook.
- `CUSTOMER_CONFIRMATION_WEBHOOK_URL`: provider workflow that sends the RFQ reference by WhatsApp or email.

Keep the existing database and Cloudinary variables. The migration only adds session, login-history, consent, and confirmation fields; it does not delete genuine records.

## Vercel frontend environment

- Remove a production `VITE_API_URL` override if it points directly to Render. Production browser calls use the same-origin `/api` proxy so the HttpOnly admin cookie remains first-party.
- `VITE_GTM_ID`: Google Tag Manager container ID, for example `GTM-XXXXXXX`.
- `VITE_TURNSTILE_SITE_KEY`: public Cloudflare Turnstile site key.
- `VITE_GOOGLE_SITE_VERIFICATION`: Search Console HTML-tag verification value only.
- `VITE_BING_SITE_VERIFICATION`: Bing Webmaster Tools `msvalidate.01` value only.

## Search-console setup

1. Add `https://www.srinivascanvassing.com` as a Google Search Console domain property and verify it with DNS, or use the generated meta-tag environment value.
2. Submit `https://www.srinivascanvassing.com/sitemap.xml`.
3. Inspect the homepage, products page, and each current product URL; request indexing after the deployment is live.
4. Add the same site in Bing Webmaster Tools, import from Search Console when available, and submit the same sitemap.
5. Review coverage/indexing reports weekly. The GitHub Actions workflow separately verifies every sitemap URL, `robots.txt`, and the admin noindex header each Monday morning IST.

## Google Tag Manager

Create only privacy-safe tags. The application emits allow-listed events and never sends names, emails, telephone numbers, or enquiry text:

- `page_view`
- `quote_form_view`
- `quote_form_start`
- `quote_form_success`
- `quote_form_failure`
- `price_alert_form_success`
- `price_alert_form_failure`
- `whatsapp_click`
- `product_quote_click`

Map these events to GA4 or another approved analytics destination inside GTM, publish the container, and test them in preview/debug mode.
