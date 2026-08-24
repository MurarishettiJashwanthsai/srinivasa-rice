# Sri Srinivasa Canvassing mobile app

Expo React Native customer application for Android and iOS. It displays the same published products and market rates as the public website and routes protected quote requests through the official secure web flow.

## App sections

- Animated home page with live catalogue summary and featured products.
- Searchable product catalogue and detailed product specifications.
- Filterable indicative market-rate board with movement context.
- Native secure quote form with product preselection, quantity units, consent, Turnstile verification and CRM reference workflow.
- Company, certification, packaging, privacy and support links.

## Local setup with npm

Node.js 22.13 or newer is required.

```bash
cd mobile
cp .env.example .env
npm install
npm run check
npm start
```

Scan the QR code with a compatible Expo development client. For native simulators, use `npm run android` or `npm run ios`.

## Shared live data

The app fetches only published products from `EXPO_PUBLIC_API_URL`. Admin updates are made in the existing CRM portal and stored in the same production database, so one published change appears on both the website and mobile app after refresh. The app does not seed, copy, replace or delete product and enquiry records.

## Security model

- Only public `EXPO_PUBLIC_*` service addresses are bundled into the binary.
- Database credentials, admin credentials, Turnstile secrets, Cloudinary secrets and signing keys must never be placed in this folder.
- Production API and website links are restricted to HTTPS.
- External web navigation is allowlisted to the official site and WhatsApp.
- Public API responses are time limited, size checked and shape validated.
- The customer app contains no admin login link, credentials or CRM access. Staff administration remains separate in the protected website portal.
- The native enquiry form remains protected by backend validation, consent capture, rate limiting, idempotency and a Cloudflare Turnstile WebView loaded only from the official site.
- Android cleartext traffic and application backup are disabled; iOS arbitrary network loads are disabled.

## Store builds

After signing in to the Expo account and confirming the EAS project ID:

```bash
npm install
npx eas-cli build:configure
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform all --profile production
```

Production builds use the public URLs declared in `eas.json`. Store signing credentials should be managed by EAS or the respective store account, never committed to Git.

## Updating an installed preview app

The QR code on an EAS Build page downloads a fixed APK. After native configuration changes, create and install a new preview APK:

```bash
npx eas-cli@latest build --platform android --profile preview
```

That build is connected to the `preview` EAS Update channel. For later JavaScript, styling and bundled-asset changes that do not change the native runtime, publish an over-the-air update:

```bash
npx eas-cli@latest update --channel preview --message "Describe the app change" --environment preview
```

After publishing, fully close and reopen the installed app. The first launch downloads a compatible update; reopen it once more if the change has not yet appeared. Native dependency, permission, icon, splash-screen or runtime changes always require a new build.

Before store submission, provide final App Store and Play Store listing text, screenshots, privacy declarations, support URL and an approved square 1024×1024 brand icon.
