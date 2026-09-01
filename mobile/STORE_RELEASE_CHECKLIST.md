# Mobile store release checklist

Use this checklist for the first production release of **Sri Srinivasa Enterprise**. Never place admin credentials, database credentials, signing secrets, Turnstile secrets, or webhook URLs in the mobile project.

## Before building

- [ ] Confirm the production website and API are available over HTTPS.
- [ ] Submit one test enquiry and verify its CRM reference, staff notification, and customer confirmation.
- [ ] Upload real product images for every published variety in the website admin portal.
- [ ] Confirm `npx expo-doctor@latest` reports all checks passed.
- [ ] Confirm `npm run typecheck` passes.
- [ ] Review the public privacy policy and support contact details.
- [ ] Approve the final 1024×1024 app icon and splash screen.

## Store assets and declarations

- [ ] Prepare phone screenshots for Android and iOS from the production build.
- [ ] Prepare the short description, full description, category, support URL, privacy-policy URL, and contact email.
- [ ] Complete Google Play Data safety and Apple App Privacy declarations using the actual enquiry fields collected.
- [ ] Declare that admin access is not included in the customer application.
- [ ] Confirm that no customer name, email, telephone number, or enquiry text is sent to analytics.

## Build and internal testing

```bash
cd mobile
npm ci
npx expo-doctor@latest
npm run typecheck
npx eas-cli@latest build --platform android --profile production --clear-cache
npx eas-cli@latest build --platform ios --profile production --clear-cache
```

- [ ] Install the Android build through Play Console internal testing.
- [ ] Install the iOS build through TestFlight.
- [ ] Test welcome animation, products, images, rates, quote form, Turnstile, reference success screen, WhatsApp links, accessibility text scaling, offline/error states, and update delivery.
- [ ] Confirm an admin rate or product change appears on both the website and app after refresh.

## Submission and ongoing updates

- [ ] Submit the approved builds to Google Play and App Store Connect.
- [ ] Use EAS Update only for JavaScript, styling, and bundled-asset changes compatible with the installed runtime.
- [ ] Create a new store build for native dependency, permission, icon, splash-screen, or runtime changes.
- [ ] Increase the public app version for each store release and keep release notes.
